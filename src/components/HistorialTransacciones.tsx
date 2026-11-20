// ===== HISTORIAL DE TRANSACCIONES =====
import type { ReactNode } from 'react'
import type { Jugador, Transaccion } from '../types'

interface HistorialTransaccionesProps {
  transacciones: Transaccion[]
  jugadores: Jugador[]
  onCerrar: () => void
}

interface GrupoHistorial {
  ronda: number
  esDeshacer: boolean
  timestamp: string
  items: Transaccion[]
}

/**
 * Agrupa las transacciones en orden cronológico: una línea por ronda pagada y
 * una línea aparte por cada deshacer. Así, si se deshace la R3 y se vuelve a
 * pagar, se ven "↩️ Se deshizo la ronda 3" y "R3: ..." como entradas distintas.
 */
const agruparTransacciones = (transacciones: Transaccion[]): GrupoHistorial[] => {
  const grupos: GrupoHistorial[] = []
  transacciones.forEach((t) => {
    const esDeshacer = t.tipo === 'deshacer'
    const ultimo = grupos[grupos.length - 1]
    if (ultimo && !esDeshacer && !ultimo.esDeshacer && ultimo.ronda === t.ronda) {
      ultimo.items.push(t)
    } else {
      grupos.push({ ronda: t.ronda, esDeshacer, timestamp: t.timestamp, items: [t] })
    }
  })
  return grupos
}

function HistorialTransacciones({ transacciones, jugadores, onCerrar }: HistorialTransaccionesProps) {
  const grupos = agruparTransacciones(transacciones)

  return (
    <div className="w-full max-w-4xl mx-auto mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border-2 border-indigo-500">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">📋 Historial de Transacciones</h3>
        <button
          onClick={onCerrar}
          className="text-xl text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          aria-label="Cerrar historial"
        >
          ✕
        </button>
      </div>

      {grupos.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Aún no se ha jugado ninguna ronda.</p>
      ) : (
        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300 max-h-64 overflow-y-auto">
          {grupos.map((grupo, i) => {
            if (grupo.esDeshacer) {
              return (
                <div key={i} className="p-2 rounded flex justify-between italic text-gray-500 dark:text-gray-400">
                  <span>{grupo.items[0].descripcion}</span>
                  <span className="ml-4 flex-shrink-0">{grupo.timestamp}</span>
                </div>
              )
            }

            // Descripción con los nombres en negrita, separados por comas
            const partes: ReactNode[] = []
            grupo.items.forEach((t, idx) => {
              if (idx > 0) partes.push(', ')
              const jugador = jugadores.find((j) => j.id === t.jugadorId)
              partes.push(
                <span key={idx}>
                  <strong>{jugador?.nombre ?? 'Desconocido'}</strong> {t.descripcion}
                </span>,
              )
            })

            return (
              <div key={i} className="p-2 bg-gray-50 dark:bg-gray-700 rounded flex justify-between">
                <span>
                  <strong>R{grupo.ronda}:</strong> {partes}
                </span>
                <span className="text-gray-500 dark:text-gray-400 ml-4 flex-shrink-0">{grupo.timestamp}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default HistorialTransacciones
