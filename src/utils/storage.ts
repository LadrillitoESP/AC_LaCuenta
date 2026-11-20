// ===== PERSISTENCIA EN LOCALSTORAGE =====
import { STORAGE_KEY } from '../constants'
import type { EstadoPartida, Pantalla } from '../types'

const PANTALLAS_VALIDAS: Pantalla[] = ['setup', 'juego', 'fin']

/** Carga la partida guardada. Devuelve null si no hay o está corrupta. */
export const cargarEstado = (): EstadoPartida | null => {
  try {
    const texto = localStorage.getItem(STORAGE_KEY)
    if (!texto) return null
    const estado = JSON.parse(texto) as Partial<EstadoPartida>
    if (!estado.pantalla || !PANTALLAS_VALIDAS.includes(estado.pantalla)) return null

    return {
      pantalla: estado.pantalla,
      jugadoresSetup: estado.jugadoresSetup ?? [],
      jugadores: estado.jugadores ?? [],
      seleccionados: estado.seleccionados ?? [],
      cantidadCuenta: estado.cantidadCuenta ?? '',
      jugadorQueAumentoMano: estado.jugadorQueAumentoMano ?? null,
      historialJuego: estado.historialJuego ?? [],
      transacciones: estado.transacciones ?? [],
    }
  } catch (error) {
    console.error('Error al cargar estado:', error)
    return null
  }
}

export const guardarEstado = (estado: EstadoPartida): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado))
  } catch (error) {
    console.error('Error al guardar estado:', error)
  }
}

export const borrarEstado = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error al borrar estado:', error)
  }
}
