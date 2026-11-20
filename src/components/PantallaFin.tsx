// ===== PANTALLA FIN =====
import type { Partida } from '../hooks/usePartida'
import { calcularEstadisticas } from '../utils/estadisticas'
import { formatearEuros } from '../utils/dinero'

interface PantallaFinProps {
  partida: Partida
  onRevancha: () => void
}

function PantallaFin({ partida, onRevancha }: PantallaFinProps) {
  const { jugadores, perdedores, historialJuego, transacciones } = partida
  const stats = calcularEstadisticas(jugadores, historialJuego, transacciones)
  // No hay un único ganador: todos los que conservan dinero ganan
  const idsPerdedores = new Set(perdedores.map((j) => j.id))

  const nombresPerdedores = perdedores.map((j) => j.nombre)
  const textoPerdedores =
    nombresPerdedores.length > 1
      ? `${nombresPerdedores.slice(0, -1).join(', ')} y ${nombresPerdedores[nombresPerdedores.length - 1]} se han quedado sin dinero`
      : `${nombresPerdedores[0] ?? 'Alguien'} se ha quedado sin dinero`

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4">¡Partida terminada!</h1>
        <p className="text-2xl text-red-600 dark:text-red-400 mb-8">{textoPerdedores}</p>

        {/* Clasificación */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Puntuación final</h2>
          <div className="space-y-2">
            {stats.porJugador.map(({ jugador, totalPagado, rondasPagadas, cartasPedidas }) => (
              <div
                key={jugador.id}
                className={`p-3 rounded-lg text-left ${
                  idsPerdedores.has(jugador.id) ? 'bg-red-100 dark:bg-red-900' : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                <div className="flex justify-between items-baseline gap-2">
                  <span className="font-semibold text-gray-800 dark:text-gray-100 truncate">
                    {idsPerdedores.has(jugador.id) ? '💸 ' : '🏆 '}
                    {jugador.nombre}
                  </span>
                  <span
                    className={`font-bold flex-shrink-0 ${
                      jugador.dinero > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {formatearEuros(jugador.dinero)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Pagó {formatearEuros(totalPagado)} en {rondasPagadas} {rondasPagadas === 1 ? 'ronda' : 'rondas'} ·{' '}
                  {cartasPedidas} × +1 · {jugador.cartas} 🃏
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Estadísticas generales */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Rondas</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.rondasJugadas}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total gastado</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{Math.round(stats.totalGastado)}€</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Ronda más cara</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {stats.rondaMasCara ? `R${stats.rondaMasCara.ronda}` : '—'}
            </p>
            {stats.rondaMasCara && (
              <p className="text-xs text-gray-500 dark:text-gray-400">{formatearEuros(stats.rondaMasCara.total)}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={onRevancha}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition text-lg"
          >
            🔁 Revancha (mismos jugadores)
          </button>
          <div className="flex gap-2">
            <button
              onClick={partida.deshacer}
              disabled={historialJuego.length === 0}
              className="w-1/2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition"
            >
              ↩️ Deshacer último pago
            </button>
            <button
              onClick={partida.volverAlSetup}
              className="w-1/2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition"
            >
              Nueva partida
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PantallaFin
