// ===== TARJETA DE JUGADOR (pantalla de juego) =====
import { CARTAS_MAXIMAS } from '../constants'
import type { Jugador, Transaccion } from '../types'
import { formatearEuros } from '../utils/dinero'

interface JugadorCardProps {
  jugador: Jugador
  seleccionado: boolean
  tieneMasUno: boolean
  transacciones: Transaccion[]
  onToggleSeleccion: () => void
  onAumentarCartas: () => void
}

function JugadorCard({
  jugador,
  seleccionado,
  tieneMasUno,
  transacciones,
  onToggleSeleccion,
  onAumentarCartas,
}: JugadorCardProps) {
  // Con el máximo de cartas el botón solo selecciona al jugador, no suma carta
  const enMaximo = jugador.cartas >= CARTAS_MAXIMAS && !tieneMasUno

  // Histórico personal: pagos, marcando con 🃏 las rondas en que pidió +1
  const historicoPersonal = transacciones
    .filter((t) => t.jugadorId === jugador.id && t.tipo === 'pago')
    .map((pago) => {
      const tieneCarta = transacciones.some(
        (t) => t.jugadorId === jugador.id && t.tipo === '+1' && t.ronda === pago.ronda,
      )
      return pago.descripcion + (tieneCarta ? ' 🃏' : '')
    })
    .join(' ')

  const estiloBoton = enMaximo
    ? seleccionado
      ? 'bg-white/30 text-white text-sm'
      : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-sm'
    : tieneMasUno
      ? `bg-orange-600 text-white hover:bg-orange-700 ${seleccionado ? 'ring-2 ring-orange-200' : ''}`
      : seleccionado
        ? 'bg-white text-emerald-700 hover:bg-gray-100'
        : 'bg-emerald-700 text-white hover:bg-emerald-800'

  return (
    <div
      onClick={onToggleSeleccion}
      className={`p-5 rounded-lg shadow-lg transition transform flex items-center justify-between cursor-pointer ${
        seleccionado
          ? 'bg-indigo-500 dark:bg-indigo-600 text-white scale-[1.02] ring-4 ring-indigo-300'
          : 'bg-white dark:bg-gray-800 hover:shadow-xl'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-3 mb-2">
          <h3
            className={`text-lg font-semibold truncate ${seleccionado ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}
          >
            {jugador.nombre}
          </h3>
          <span
            className={`text-sm font-semibold flex-shrink-0 ${seleccionado ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}
          >
            {jugador.cartas} 🃏
          </span>
        </div>

        {historicoPersonal && (
          <div className={`text-xs mb-1 ${seleccionado ? 'text-gray-100' : 'text-gray-400 dark:text-gray-500'}`}>
            {historicoPersonal}
          </div>
        )}

        <p className={`text-3xl font-bold ${seleccionado ? 'text-white' : 'text-green-600 dark:text-green-400'}`}>
          {formatearEuros(jugador.dinero)}
        </p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation()
          onAumentarCartas()
        }}
        title={enMaximo ? `Máximo ${CARTAS_MAXIMAS} cartas: solo selecciona al jugador` : 'Pedir +1 carta'}
        className={`w-20 h-20 rounded-full font-bold flex items-center justify-center text-lg transition flex-shrink-0 ml-4 ${estiloBoton}`}
      >
        {tieneMasUno ? '−1' : enMaximo ? 'Máx' : '+1'}
      </button>
    </div>
  )
}

export default JugadorCard
