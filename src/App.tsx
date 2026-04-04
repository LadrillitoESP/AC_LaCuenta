import './App.css'
import { useState, useEffect } from 'react'

interface Jugador {
  id: string
  nombre: string
  dinero: number
  cartas: number
}

interface HistorialSnapshot {
  jugadores: Jugador[]
  seleccionados: string[]
  cantidadCuenta: string
  jugadorQueAumentoMano: string | null
}

interface Transaccion {
  ronda: number
  tipo: 'pago' | '+1' | 'deshacer'
  jugadorId?: string
  descripcion: string
  timestamp: string
}

interface EstadoPartida {
  pantalla: Pantalla
  jugadoresSetup: string[]
  jugadores: Jugador[]
  seleccionados: string[]
  cantidadCuenta: string
  jugadorQueAumentoMano: string | null
  jugadorPerdedor: Jugador | null
  historialJuego: HistorialSnapshot[]
  transacciones: Transaccion[]
}

type Pantalla = 'setup' | 'juego' | 'fin'

const DINERO_INICIAL: Record<number, number> = {
  3: 900,
  4: 1000,
  5: 1100,
  6: 1200,
  7: 1300,
  8: 1400,
}

const STORAGE_KEY = 'ac_lacuenta_game'

function App() {
  // Estados iniciales vacíos
  const [pantalla, setPantalla] = useState<Pantalla>('setup')
  const [nombreNuevo, setNombreNuevo] = useState('')
  const [jugadoresSetup, setJugadoresSetup] = useState<string[]>([])
  const [jugadores, setJugadores] = useState<Jugador[]>([])
  const [cantidadCuenta, setCantidadCuenta] = useState('')
  const [seleccionados, setSeleccionados] = useState<string[]>([])
  const [jugadorPerdedor, setJugadorPerdedor] = useState<Jugador | null>(null)
  const [jugadorQueAumentoMano, setJugadorQueAumentoMano] = useState<string | null>(null)
  const [historialJuego, setHistorialJuego] = useState<HistorialSnapshot[]>([])
  const [transacciones, setTransacciones] = useState<Transaccion[]>([])
  const [historialAbierto, setHistorialAbierto] = useState(false)
  const [cargado, setCargado] = useState(false)

  // ===== PERSISTENCIA CON LOCALSTORAGE =====
  
  // Usar useEffect para cargar estado guardado al montar
  useEffect(() => {
    const estadoGuardado = localStorage.getItem(STORAGE_KEY)
    if (estadoGuardado) {
      try {
        const estado: EstadoPartida = JSON.parse(estadoGuardado)
        setPantalla(estado.pantalla)
        setJugadoresSetup(estado.jugadoresSetup)
        setJugadores(estado.jugadores)
        setSeleccionados(estado.seleccionados)
        setCantidadCuenta(estado.cantidadCuenta)
        setJugadorQueAumentoMano(estado.jugadorQueAumentoMano)
        setJugadorPerdedor(estado.jugadorPerdedor)
        setHistorialJuego(estado.historialJuego || [])
        setTransacciones(estado.transacciones || [])
      } catch (error) {
        console.error('Error al cargar estado:', error)
      }
    }
    setCargado(true)
  }, [])

  // Usar useEffect para guardar cambios automáticamente
  useEffect(() => {
    if (!cargado) return // No guardar hasta que no esté cargado
    
    const estado: EstadoPartida = {
      pantalla,
      jugadoresSetup,
      jugadores,
      seleccionados,
      cantidadCuenta,
      jugadorQueAumentoMano,
      jugadorPerdedor,
      historialJuego,
      transacciones,
    }
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(estado))
    } catch (error) {
      console.error('Error al guardar estado:', error)
    }
  }, [pantalla, jugadoresSetup, jugadores, seleccionados, cantidadCuenta, jugadorQueAumentoMano, jugadorPerdedor, historialJuego, transacciones, cargado])

  // ===== PANTALLA SETUP =====
  const agregarJugadorSetup = () => {
    if (nombreNuevo.trim() && !jugadoresSetup.includes(nombreNuevo.trim())) {
      setJugadoresSetup([...jugadoresSetup, nombreNuevo.trim()])
      setNombreNuevo('')
    }
  }

  const eliminarJugadorSetup = (index: number) => {
    setJugadoresSetup(jugadoresSetup.filter((_, i) => i !== index))
  }

  const iniciarPartida = () => {
    if (jugadoresSetup.length < 3 || jugadoresSetup.length > 8) {
      alert('Necesitas entre 3 y 8 jugadores')
      return
    }

    const dineroInicial = DINERO_INICIAL[jugadoresSetup.length]
    const nuevosJugadores: Jugador[] = jugadoresSetup.map((nombre, index) => ({
      id: `jugador-${index}`,
      nombre,
      dinero: dineroInicial,
      cartas: 5,
    }))

    setJugadores(nuevosJugadores)
    setCantidadCuenta('')
    setSeleccionados([])
    setJugadorQueAumentoMano(null)
    setPantalla('juego')
    setHistorialJuego([]) // Limpiar historial al iniciar partida
    setTransacciones([]) // Limpiar transacciones al iniciar partida
    setHistorialAbierto(false)
  }

  // ===== DESHACER ÚLTIMO TURNO =====
  const deshacer = () => {
    if (historialJuego.length === 0) return

    const ultimoSnapshot = historialJuego[historialJuego.length - 1]
    const rondaADeshacerNumero = historialJuego.length
    
    setJugadores(ultimoSnapshot.jugadores)
    setSeleccionados(ultimoSnapshot.seleccionados)
    setCantidadCuenta(ultimoSnapshot.cantidadCuenta)
    setJugadorQueAumentoMano(ultimoSnapshot.jugadorQueAumentoMano) // Restaurar el estado de +1 que había antes
    
    // Eliminar transacciones de la ronda que se deshizo
    const transaccionesActualizadas = transacciones.filter(
      (t) => t.ronda !== rondaADeshacerNumero
    )
    
    // Registrar acción de deshacer
    const transaccionDeshacer: Transaccion = {
      ronda: rondaADeshacerNumero,
      tipo: 'deshacer',
      descripcion: '↩️ Se deshizo la ronda',
      timestamp: new Date().toLocaleTimeString('es-ES'),
    }
    
    setTransacciones([...transaccionesActualizadas, transaccionDeshacer])
    
    // Eliminar el último snapshot del historial
    setHistorialJuego(historialJuego.slice(0, -1))
  }

  // ===== PANTALLA JUEGO =====
  const toggleSeleccion = (id: string) => {
    const estaSeleccionado = seleccionados.includes(id)

    // Si lo estamos deseleccionando y tiene +1, quitarle el +1
    if (estaSeleccionado && jugadorQueAumentoMano === id) {
      const actualizados = jugadores.map((j) =>
        j.id === id ? { ...j, cartas: j.cartas - 1 } : j
      )
      setJugadores(actualizados)
      setJugadorQueAumentoMano(null)
    }

    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((j) => j !== id) : [...prev, id]
    )
  }

  const aumentarCartas = (id: string) => {
    const jugador = jugadores.find((j) => j.id === id)
    if (!jugador) return

    // Si el jugador no está seleccionado, seleccionarlo automáticamente
    if (!seleccionados.includes(id)) {
      setSeleccionados((prev) => [...prev, id])
    }

    // Si es toggle off (el mismo jugador presiona de nuevo)
    if (jugadorQueAumentoMano === id) {
      const actualizados = jugadores.map((j) =>
        j.id === id ? { ...j, cartas: j.cartas - 1 } : j
      )
      setJugadores(actualizados)
      setJugadorQueAumentoMano(null)
      return
    }

    // Si otro jugador tiene aumento, quilarlo primero
    let actualizados = jugadores
    if (jugadorQueAumentoMano !== null) {
      actualizados = jugadores.map((j) =>
        j.id === jugadorQueAumentoMano ? { ...j, cartas: j.cartas - 1 } : j
      )
    }

    // Validar máximo 10 cartas
    if (jugador.cartas >= 10) {
      alert('Máximo 10 cartas')
      return
    }

    // Asignar aumento al jugador actual
    const finales = actualizados.map((j) =>
      j.id === id ? { ...j, cartas: j.cartas + 1 } : j
    )
    setJugadores(finales)
    setJugadorQueAumentoMano(id)
    // La transacción de +1 se registra cuando se paga, no aquí
  }

  const pagarCuenta = () => {
    const cantidad = parseFloat(cantidadCuenta)
    
    if (!cantidad || cantidad <= 0) {
      alert('Introduce una cantidad válida')
      return
    }

    if (seleccionados.length === 0) {
      alert('Selecciona al menos un jugador')
      return
    }

    // Validar que si hay un jugador con +1, está seleccionado
    if (jugadorQueAumentoMano !== null && !seleccionados.includes(jugadorQueAumentoMano)) {
      alert('El jugador con +1 debe estar seleccionado para pagar')
      return
    }

    // Guardar snapshot ANTES de hacer el cambio
    const snapshot: HistorialSnapshot = {
      jugadores: JSON.parse(JSON.stringify(jugadores)),
      seleccionados: [...seleccionados],
      cantidadCuenta,
      jugadorQueAumentoMano,
    }
    setHistorialJuego([...historialJuego, snapshot])

    const precioPorPersona = cantidad / seleccionados.length

    const nuevosJugadores = jugadores.map((j) => {
      if (seleccionados.includes(j.id)) {
        return { ...j, dinero: j.dinero - precioPorPersona }
      }
      return j
    })

    // Crear transacciones individuales por cada jugador que pagó
    const ronda = historialJuego.length + 1
    const nuevasTransacciones: Transaccion[] = []
    const timestamp = new Date().toLocaleTimeString('es-ES')
    
    seleccionados.forEach((jugadorId) => {
      const jugadorPagador = nuevosJugadores.find((j) => j.id === jugadorId)
      if (jugadorPagador) {
        nuevasTransacciones.push({
          ronda,
          tipo: 'pago',
          jugadorId,
          descripcion: `-${precioPorPersona.toFixed(2)}€`,
          timestamp,
        })
      }
    })
    
    // Registrar transacción de +1 si hay un jugador con carta activa
    if (jugadorQueAumentoMano !== null) {
      const jugadorConCarta = jugadores.find((j) => j.id === jugadorQueAumentoMano)
      if (jugadorConCarta) {
        nuevasTransacciones.push({
          ronda,
          tipo: '+1',
          jugadorId: jugadorQueAumentoMano,
          descripcion: `obtuvo +1 carta`,
          timestamp,
        })
      }
    }

    // Buscar jugador que llegó a 0 o menos
    const perdedor = nuevosJugadores.find((j) => j.dinero <= 0)

    setJugadores(nuevosJugadores)
    setSeleccionados([])
    setCantidadCuenta('')
    setJugadorQueAumentoMano(null)
    setTransacciones([...transacciones, ...nuevasTransacciones])

    if (perdedor) {
      setJugadorPerdedor(perdedor)
      setPantalla('fin')
    }
  }

  const volverAlSetup = () => {
    if (!confirm('¿Estás seguro de que quieres abandonar la partida?')) {
      return
    }
    
    setPantalla('setup')
    setNombreNuevo('')
    setJugadores([])
    setSeleccionados([])
    setCantidadCuenta('')
    setJugadorPerdedor(null)
    setJugadorQueAumentoMano(null)
    setHistorialJuego([])
    setTransacciones([])
    setHistorialAbierto(false)
    // Limpiar localStorage cuando se vuelve al setup
    localStorage.removeItem(STORAGE_KEY)
  }

  // ===== RENDER PANTALLAS =====

  if (pantalla === 'setup') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="w-full max-w-2xl">
          <h1 className="text-5xl font-bold text-center text-gray-800 dark:text-gray-100 mb-2">
            AC_LaCuenta
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
            Crea una nueva partida
          </p>

          {/* Añadir jugador */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Añadir jugadores ({jugadoresSetup.length}/8)
            </h2>
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={nombreNuevo}
                onChange={(e) => setNombreNuevo(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && agregarJugadorSetup()}
                placeholder="Nombre del jugador"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={agregarJugadorSetup}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition"
              >
                Añadir
              </button>
            </div>

            {/* Lista de jugadores */}
            <div className="space-y-2">
              {jugadoresSetup.map((nombre, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"
                >
                  <span className="text-gray-800 dark:text-gray-100">{nombre}</span>
                  <button
                    onClick={() => eliminarJugadorSetup(index)}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-lg transition text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>

            {jugadoresSetup.length < 3 && (
              <p className="text-sm text-red-500 mt-4">
                ⚠️ Necesitas al menos 3 jugadores
              </p>
            )}
          </div>

          {/* Botón iniciar */}
          <button
            onClick={iniciarPartida}
            disabled={jugadoresSetup.length < 3 || jugadoresSetup.length > 8}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition text-lg"
          >
            Iniciar partida ({jugadoresSetup.length} jugadores)
          </button>
        </div>
      </div>
    )
  }

  if (pantalla === 'fin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="w-full max-w-2xl text-center">
          <h1 className="text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            ¡Partida terminada!
          </h1>
          <p className="text-2xl text-red-600 dark:text-red-400 mb-8">
            {jugadorPerdedor?.nombre} ha llegado a 0€
          </p>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Puntuación final
            </h2>
            <div className="space-y-2">
              {[...jugadores]
                .sort((a, b) => b.dinero - a.dinero)
                .map((j) => (
                  <div
                    key={j.id}
                    className={`p-3 rounded-lg ${
                      j.id === jugadorPerdedor?.id
                        ? 'bg-red-100 dark:bg-red-900'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                  >
                    <span className="font-semibold text-gray-800 dark:text-gray-100">
                      {j.nombre}: {j.dinero.toFixed(2)}€
                    </span>
                  </div>
                ))}
            </div>
          </div>

          <button
            onClick={volverAlSetup}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition text-lg"
          >
            Nueva partida
          </button>
        </div>
      </div>
    )
  }

  // Pantalla JUEGO
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      {/* Encabezado fijo */}
      <div className="w-full max-w-4xl mx-auto mb-4">
        <div className="flex items-center justify-center relative">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">
            AC_LaCuenta
          </h1>
          <button
            onClick={() => setHistorialAbierto(!historialAbierto)}
            className="absolute right-0 cursor-pointer hover:opacity-80 transition"
            title="Ver historial de transacciones"
          >
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              R{historialJuego.length + 1}
            </div>
          </button>
        </div>
      </div>

      {/* Historial emergente */}
      {historialAbierto && transacciones.length > 0 && (
        <>
          <div className="w-full max-w-4xl mx-auto mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border-2 border-indigo-500">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">
                📋 Historial de Transacciones
              </h3>
              <button
                onClick={() => setHistorialAbierto(false)}
                className="text-xl text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300 max-h-64 overflow-y-auto">
              {/* Agrupar transacciones por ronda */}
              {Array.from({ length: Math.max(...transacciones.map((t) => t.ronda), 0) })
                .map((_, i) => i + 1)
                .map((ronda) => {
                  const transaccionesDelRonda = transacciones.filter((t) => t.ronda === ronda)
                  if (transaccionesDelRonda.length === 0) return null

                  // Construir descripción detallada con nombres en negrita
                  const descripcionesPartes: React.ReactNode[] = []
                  transaccionesDelRonda.forEach((t, idx) => {
                    if (idx > 0) descripcionesPartes.push(', ')
                    
                    if (t.tipo === 'pago' || t.tipo === '+1') {
                      const jugador = jugadores.find((j) => j.id === t.jugadorId)
                      descripcionesPartes.push(
                        <span key={`${ronda}-${t.jugadorId}-${idx}`}>
                          <strong>{jugador?.nombre || 'Desconocido'}</strong> {t.descripcion}
                        </span>
                      )
                    } else {
                      descripcionesPartes.push(
                        <span key={`${ronda}-${t.tipo}-${idx}`}>{t.descripcion}</span>
                      )
                    }
                  })

                  const timestamp = transaccionesDelRonda[0]?.timestamp || ''

                  return (
                    <div key={ronda} className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="flex justify-between">
                        <span>
                          <strong>R{ronda}:</strong> {descripcionesPartes}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 ml-4 flex-shrink-0">{timestamp}</span>
                      </div>
                    </div>
                  )
                })
                .filter(Boolean)}
            </div>
          </div>
          <button
            onClick={volverAlSetup}
            className="w-full max-w-4xl mx-auto bg-orange-400 hover:bg-orange-500 text-white font-bold py-3 px-4 rounded-lg transition mb-4"
            title="Abandonar partida"
          >
            🚪 Abandonar Partida
          </button>
        </>
      )}

      {/* Contenedor con scroll independiente para tarjetas */}
      <div className="flex-1 min-h-0 w-full max-w-4xl mx-auto overflow-y-auto overflow-x-hidden flex flex-col items-center">
        {/* Tarjetas de jugadores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full px-2 pt-2">
          {jugadores.map((jugador) => (
            <div
              key={jugador.id}
              onClick={() => jugador.dinero > 0 && toggleSeleccion(jugador.id)}
              className={`p-5 rounded-lg shadow-lg transition transform flex items-center justify-between ${
                jugador.dinero <= 0
                  ? 'bg-gray-300 dark:bg-gray-600 opacity-50'
                  : seleccionados.includes(jugador.id)
                  ? 'bg-indigo-500 dark:bg-indigo-600 text-white scale-[1.02] ring-4 ring-indigo-300 cursor-pointer'
                  : 'bg-white dark:bg-gray-800 hover:shadow-xl cursor-pointer'
              }`}
            >
              {/* Contenido principal (nombre, cartas, dinero) */}
              <div className="flex-1">
                <div className="flex items-baseline gap-3 mb-2">
                  <h3
                    className={`text-lg font-semibold ${
                      seleccionados.includes(jugador.id)
                        ? 'text-white'
                        : 'text-gray-800 dark:text-gray-100'
                    }`}
                  >
                    {jugador.nombre}
                  </h3>
                  <span
                    className={`text-sm font-semibold ${
                      seleccionados.includes(jugador.id)
                        ? 'text-white'
                        : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {jugador.cartas} 🃏
                  </span>
                </div>
                
                {/* Histórico personal de transacciones (solo pagos) */}
                {transacciones.filter((t) => t.jugadorId === jugador.id && t.tipo === 'pago').length > 0 && (
                  <div className={`text-xs mb-1 ${
                    seleccionados.includes(jugador.id)
                      ? 'text-gray-100'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {transacciones
                      .filter((t) => t.jugadorId === jugador.id && t.tipo === 'pago')
                      .map((pago) => {
                        // Buscar si en la misma ronda tuvo +1
                        const tieneCarta = transacciones.some((t) =>
                          t.jugadorId === jugador.id && t.tipo === '+1' && t.ronda === pago.ronda
                        )
                        return pago.descripcion + (tieneCarta ? ' 🃏' : '')
                      })
                      .join(' ')}
                  </div>
                )}
                
                <p
                  className={`text-3xl font-bold ${
                    seleccionados.includes(jugador.id)
                      ? 'text-white'
                      : jugador.dinero > 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {jugador.dinero.toFixed(2)}€
                </p>
              </div>

              {/* Botón grande centrado verticalmente */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (jugador.dinero > 0) {
                    aumentarCartas(jugador.id)
                  }
                }}
                disabled={
                  jugador.dinero <= 0 ||
                  (jugador.cartas >= 10 && jugadorQueAumentoMano !== jugador.id)
                }
                className={`w-20 h-20 rounded-full font-bold flex items-center justify-center text-lg transition flex-shrink-0 ml-4 ${
                  jugador.dinero <= 0 ||
                  (jugador.cartas >= 10 && jugadorQueAumentoMano !== jugador.id)
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                    : jugadorQueAumentoMano === jugador.id
                    ? seleccionados.includes(jugador.id)
                      ? 'bg-orange-600 text-white hover:bg-orange-700 ring-2 ring-orange-200'
                      : 'bg-orange-600 text-white hover:bg-orange-700'
                    : seleccionados.includes(jugador.id)
                    ? 'bg-white text-emerald-700 hover:bg-gray-100'
                    : 'bg-emerald-700 text-white hover:bg-emerald-800'
                }`}
              >
                {jugadorQueAumentoMano === jugador.id ? '−1' : '+1'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Sección de pago y botones - fija en la parte inferior */}
      <div className="w-full max-w-4xl mx-auto mt-4">
        {/* Fila 1: Input de cantidad */}
        <div className="mb-2">
          <input
            type="number"
            value={cantidadCuenta}
            onChange={(e) => setCantidadCuenta(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && pagarCuenta()}
            placeholder="Monto (ej: 400)"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {seleccionados.length > 0 && cantidadCuenta && (
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
              ÷ {seleccionados.length} = {(parseFloat(cantidadCuenta) / seleccionados.length).toFixed(2)}€
            </p>
          )}
        </div>
        
        {/* Fila 2: Botones Deshacer (1/4) y Pagar (3/4) */}
        <div className="flex gap-2">
          <button
            onClick={deshacer}
            disabled={historialJuego.length === 0}
            className="w-1/4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-2 rounded-lg transition"
            title="Deshacer último turno"
          >
            ↩️
          </button>
          <button
            onClick={pagarCuenta}
            className="w-3/4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition text-lg"
          >
            Pagar
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
