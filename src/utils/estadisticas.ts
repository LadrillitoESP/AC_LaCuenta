// ===== ESTADÍSTICAS DE FIN DE PARTIDA =====
import { DINERO_INICIAL } from '../constants'
import type { HistorialSnapshot, Jugador, Transaccion } from '../types'
import { aCentimos, aEuros, restarEuros } from './dinero'

export interface EstadisticaJugador {
  jugador: Jugador
  totalPagado: number
  rondasPagadas: number
  cartasPedidas: number // Número de +1 obtenidos
}

export interface EstadisticasPartida {
  rondasJugadas: number
  totalGastado: number
  rondaMasCara: { ronda: number; total: number } | null
  porJugador: EstadisticaJugador[] // Ordenado de más a menos dinero
}

export const calcularEstadisticas = (
  jugadores: Jugador[],
  historialJuego: HistorialSnapshot[],
  transacciones: Transaccion[],
): EstadisticasPartida => {
  const dineroInicial = DINERO_INICIAL[jugadores.length] ?? 0

  const porJugador = [...jugadores]
    .sort((a, b) => b.dinero - a.dinero)
    .map((jugador) => ({
      jugador,
      totalPagado: restarEuros(dineroInicial, jugador.dinero),
      rondasPagadas: transacciones.filter((t) => t.tipo === 'pago' && t.jugadorId === jugador.id).length,
      cartasPedidas: transacciones.filter((t) => t.tipo === '+1' && t.jugadorId === jugador.id).length,
    }))

  // El coste de cada ronda es la diferencia de saldos entre su snapshot y el siguiente
  // (o el estado actual, para la última ronda)
  const sumaCentimos = (lista: Jugador[]) => lista.reduce((acc, j) => acc + aCentimos(j.dinero), 0)
  let rondaMasCara: EstadisticasPartida['rondaMasCara'] = null
  historialJuego.forEach((snapshot, i) => {
    const despues = historialJuego[i + 1]?.jugadores ?? jugadores
    const total = aEuros(sumaCentimos(snapshot.jugadores) - sumaCentimos(despues))
    if (!rondaMasCara || total > rondaMasCara.total) {
      rondaMasCara = { ronda: i + 1, total }
    }
  })

  const totalGastado = aEuros(porJugador.reduce((acc, e) => acc + aCentimos(e.totalPagado), 0))

  return {
    rondasJugadas: historialJuego.length,
    totalGastado,
    rondaMasCara,
    porJugador,
  }
}
