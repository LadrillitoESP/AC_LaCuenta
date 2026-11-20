// ===== LÓGICA Y ESTADO DE LA PARTIDA =====
// Todo el estado del juego vive aquí. Las acciones que pueden fallar devuelven
// un mensaje de error (string) o null si todo fue bien; la UI decide cómo mostrarlo.
import { useEffect, useState } from 'react'
import {
  CARTAS_INICIALES,
  CARTAS_MAXIMAS,
  DINERO_INICIAL,
  MAX_JUGADORES,
  MIN_JUGADORES,
} from '../constants'
import type { HistorialSnapshot, Jugador, Pantalla, Transaccion } from '../types'
import { calcularParte, parsearCantidad, restarEuros } from '../utils/dinero'
import { borrarEstado, cargarEstado, guardarEstado } from '../utils/storage'

const horaActual = () => new Date().toLocaleTimeString('es-ES')

export function usePartida() {
  // La partida guardada se lee una sola vez, en el primer render (sin useEffect,
  // así no hay parpadeo de la pantalla de setup al recargar)
  const [estadoGuardado] = useState(cargarEstado)

  const [pantalla, setPantalla] = useState<Pantalla>(estadoGuardado?.pantalla ?? 'setup')
  const [jugadoresSetup, setJugadoresSetup] = useState<string[]>(estadoGuardado?.jugadoresSetup ?? [])
  const [jugadores, setJugadores] = useState<Jugador[]>(estadoGuardado?.jugadores ?? [])
  const [cantidadCuenta, setCantidadCuenta] = useState(estadoGuardado?.cantidadCuenta ?? '')
  const [seleccionados, setSeleccionados] = useState<string[]>(estadoGuardado?.seleccionados ?? [])
  const [jugadorQueAumentoMano, setJugadorQueAumentoMano] = useState<string | null>(
    estadoGuardado?.jugadorQueAumentoMano ?? null,
  )
  const [historialJuego, setHistorialJuego] = useState<HistorialSnapshot[]>(estadoGuardado?.historialJuego ?? [])
  const [transacciones, setTransacciones] = useState<Transaccion[]>(estadoGuardado?.transacciones ?? [])

  // Guardar automáticamente en cada cambio
  useEffect(() => {
    guardarEstado({
      pantalla,
      jugadoresSetup,
      jugadores,
      seleccionados,
      cantidadCuenta,
      jugadorQueAumentoMano,
      historialJuego,
      transacciones,
    })
  }, [pantalla, jugadoresSetup, jugadores, seleccionados, cantidadCuenta, jugadorQueAumentoMano, historialJuego, transacciones])

  // Los perdedores se derivan del saldo: pueden ser varios en la misma ronda
  const perdedores = jugadores.filter((j) => j.dinero <= 0)
  const ronda = historialJuego.length + 1

  // ===== SETUP =====
  const agregarJugadorSetup = (nombre: string): string | null => {
    const limpio = nombre.trim()
    if (!limpio) return null
    if (jugadoresSetup.length >= MAX_JUGADORES) return `Máximo ${MAX_JUGADORES} jugadores`
    if (jugadoresSetup.some((n) => n.toLowerCase() === limpio.toLowerCase())) {
      return `Ya hay un jugador llamado "${limpio}"`
    }
    setJugadoresSetup([...jugadoresSetup, limpio])
    return null
  }

  const eliminarJugadorSetup = (index: number) => {
    setJugadoresSetup(jugadoresSetup.filter((_, i) => i !== index))
  }

  /** Empieza una partida. Sin argumentos usa los nombres del setup; la revancha pasa los actuales. */
  const iniciarPartida = (nombres: string[] = jugadoresSetup): string | null => {
    if (nombres.length < MIN_JUGADORES || nombres.length > MAX_JUGADORES) {
      return `Necesitas entre ${MIN_JUGADORES} y ${MAX_JUGADORES} jugadores`
    }
    const dineroInicial = DINERO_INICIAL[nombres.length]
    setJugadoresSetup(nombres)
    setJugadores(
      nombres.map((nombre, index) => ({
        id: `jugador-${index}`,
        nombre,
        dinero: dineroInicial,
        cartas: CARTAS_INICIALES,
      })),
    )
    setCantidadCuenta('')
    setSeleccionados([])
    setJugadorQueAumentoMano(null)
    setHistorialJuego([])
    setTransacciones([])
    setPantalla('juego')
    return null
  }

  // ===== JUEGO =====
  const toggleSeleccion = (id: string) => {
    const estaSeleccionado = seleccionados.includes(id)

    // Si lo estamos deseleccionando y tiene +1, quitarle el +1
    if (estaSeleccionado && jugadorQueAumentoMano === id) {
      setJugadores(jugadores.map((j) => (j.id === id ? { ...j, cartas: j.cartas - 1 } : j)))
      setJugadorQueAumentoMano(null)
    }

    setSeleccionados(estaSeleccionado ? seleccionados.filter((j) => j !== id) : [...seleccionados, id])
  }

  /**
   * Botón +1 de un jugador:
   * - Siempre lo selecciona como pagador (aunque no pueda sumar carta)
   * - Si ya tenía el +1, se lo quita (toggle off)
   * - Si tiene el máximo de cartas, solo se selecciona
   * - Si otro tenía el +1, se le quita antes de dárselo a este
   */
  const aumentarCartas = (id: string) => {
    const jugador = jugadores.find((j) => j.id === id)
    if (!jugador) return

    if (!seleccionados.includes(id)) {
      setSeleccionados([...seleccionados, id])
    }

    if (jugadorQueAumentoMano === id) {
      setJugadores(jugadores.map((j) => (j.id === id ? { ...j, cartas: j.cartas - 1 } : j)))
      setJugadorQueAumentoMano(null)
      return
    }

    if (jugador.cartas >= CARTAS_MAXIMAS) return

    setJugadores(
      jugadores.map((j) => {
        if (j.id === id) return { ...j, cartas: j.cartas + 1 }
        if (j.id === jugadorQueAumentoMano) return { ...j, cartas: j.cartas - 1 }
        return j
      }),
    )
    setJugadorQueAumentoMano(id)
  }

  const pagarCuenta = (): string | null => {
    // Se permite 0€ (ronda sin coste), pero no vacío, negativo ni texto
    const cantidad = parsearCantidad(cantidadCuenta)
    if (cantidad === null) return 'Introduce una cantidad válida'
    if (seleccionados.length === 0) return 'Selecciona al menos un jugador'
    if (jugadorQueAumentoMano !== null && !seleccionados.includes(jugadorQueAumentoMano)) {
      return 'El jugador con +1 debe estar seleccionado para pagar'
    }

    // Guardar snapshot ANTES de hacer el cambio
    const snapshot: HistorialSnapshot = {
      jugadores: jugadores.map((j) => ({ ...j })),
      seleccionados: [...seleccionados],
      cantidadCuenta,
      jugadorQueAumentoMano,
    }

    // Todos pagan la misma parte, redondeada hacia abajo al céntimo (100€ / 3 → 33.33€)
    const parte = calcularParte(cantidad, seleccionados.length)

    const nuevosJugadores = jugadores.map((j) =>
      seleccionados.includes(j.id) ? { ...j, dinero: restarEuros(j.dinero, parte) } : j,
    )

    const timestamp = horaActual()
    const nuevasTransacciones: Transaccion[] = seleccionados.map((jugadorId) => ({
      ronda,
      tipo: 'pago',
      jugadorId,
      descripcion: parte > 0 ? `-${parte.toFixed(2)}€` : '0.00€',
      timestamp,
    }))

    if (jugadorQueAumentoMano !== null) {
      nuevasTransacciones.push({
        ronda,
        tipo: '+1',
        jugadorId: jugadorQueAumentoMano,
        descripcion: 'obtuvo +1 carta',
        timestamp,
      })
    }

    setHistorialJuego([...historialJuego, snapshot])
    setJugadores(nuevosJugadores)
    setSeleccionados([])
    setCantidadCuenta('')
    setJugadorQueAumentoMano(null)
    setTransacciones([...transacciones, ...nuevasTransacciones])

    // Si uno o varios jugadores llegan a 0€ o menos, termina la partida
    if (nuevosJugadores.some((j) => j.dinero <= 0)) {
      setPantalla('fin')
    }
    return null
  }

  /** Deshace el último pago. También funciona desde la pantalla de fin (vuelve al juego). */
  const deshacer = () => {
    if (historialJuego.length === 0) return

    const ultimoSnapshot = historialJuego[historialJuego.length - 1]
    const rondaDeshecha = historialJuego.length

    setJugadores(ultimoSnapshot.jugadores)
    setSeleccionados(ultimoSnapshot.seleccionados)
    setCantidadCuenta(ultimoSnapshot.cantidadCuenta)
    setJugadorQueAumentoMano(ultimoSnapshot.jugadorQueAumentoMano)

    // Quitar los pagos/+1 de la ronda deshecha (conservando deshacer anteriores)
    // y registrar el deshacer como entrada propia del historial
    setTransacciones([
      ...transacciones.filter((t) => !(t.ronda === rondaDeshecha && t.tipo !== 'deshacer')),
      {
        ronda: rondaDeshecha,
        tipo: 'deshacer',
        descripcion: `↩️ Se deshizo la ronda ${rondaDeshecha}`,
        timestamp: horaActual(),
      },
    ])
    setHistorialJuego(historialJuego.slice(0, -1))
    setPantalla('juego')
  }

  /** Vuelve al setup conservando los nombres para la siguiente partida */
  const volverAlSetup = () => {
    setPantalla('setup')
    setJugadores([])
    setSeleccionados([])
    setCantidadCuenta('')
    setJugadorQueAumentoMano(null)
    setHistorialJuego([])
    setTransacciones([])
    borrarEstado()
  }

  return {
    // Estado
    pantalla,
    jugadoresSetup,
    jugadores,
    cantidadCuenta,
    seleccionados,
    jugadorQueAumentoMano,
    historialJuego,
    transacciones,
    perdedores,
    ronda,
    // Acciones
    setCantidadCuenta,
    agregarJugadorSetup,
    eliminarJugadorSetup,
    iniciarPartida,
    toggleSeleccion,
    aumentarCartas,
    pagarCuenta,
    deshacer,
    volverAlSetup,
  }
}

export type Partida = ReturnType<typeof usePartida>
