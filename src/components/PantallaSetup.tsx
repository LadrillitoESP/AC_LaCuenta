// ===== PANTALLA SETUP =====
import { useState } from 'react'
import { MAX_JUGADORES, MIN_JUGADORES } from '../constants'

interface PantallaSetupProps {
  jugadoresSetup: string[]
  onAgregar: (nombre: string) => string | null
  onEliminar: (index: number) => void
  onIniciar: () => void
}

function PantallaSetup({ jugadoresSetup, onAgregar, onEliminar, onIniciar }: PantallaSetupProps) {
  const [nombreNuevo, setNombreNuevo] = useState('')
  const [error, setError] = useState<string | null>(null)

  const lleno = jugadoresSetup.length >= MAX_JUGADORES
  const puedeIniciar = jugadoresSetup.length >= MIN_JUGADORES && jugadoresSetup.length <= MAX_JUGADORES

  const agregar = () => {
    const resultado = onAgregar(nombreNuevo)
    setError(resultado)
    if (!resultado) setNombreNuevo('')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-5xl font-bold text-center text-gray-800 dark:text-gray-100 mb-2">AC_LaCuenta</h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-8">Crea una nueva partida</p>

        {/* Añadir jugador */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Añadir jugadores ({jugadoresSetup.length}/{MAX_JUGADORES})
          </h2>
          <div className="flex flex-col sm:flex-row gap-2 mb-2">
            <input
              type="text"
              value={nombreNuevo}
              onChange={(e) => {
                setNombreNuevo(e.target.value)
                setError(null)
              }}
              onKeyDown={(e) => e.key === 'Enter' && agregar()}
              disabled={lleno}
              placeholder={lleno ? 'Máximo de jugadores alcanzado' : 'Nombre del jugador'}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
            <button
              onClick={agregar}
              disabled={lleno || !nombreNuevo.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg transition sm:w-auto w-full"
            >
              Añadir
            </button>
          </div>
          {error && <p className="text-sm text-red-500 mb-2">⚠️ {error}</p>}

          {/* Lista de jugadores */}
          <div className="space-y-2 mt-4">
            {jugadoresSetup.map((nombre, index) => (
              <div
                key={nombre}
                className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"
              >
                <span className="text-gray-800 dark:text-gray-100">{nombre}</span>
                <button
                  onClick={() => onEliminar(index)}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-lg transition text-sm"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>

          {jugadoresSetup.length < MIN_JUGADORES && (
            <p className="text-sm text-red-500 mt-4">⚠️ Necesitas al menos {MIN_JUGADORES} jugadores</p>
          )}
        </div>

        <button
          onClick={onIniciar}
          disabled={!puedeIniciar}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition text-lg"
        >
          Iniciar partida ({jugadoresSetup.length} jugadores)
        </button>
      </div>
    </div>
  )
}

export default PantallaSetup
