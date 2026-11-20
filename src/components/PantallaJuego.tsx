// ===== PANTALLA JUEGO =====
import { useState } from 'react'
import type { Partida } from '../hooks/usePartida'
import { calcularParte, parsearCantidad } from '../utils/dinero'
import HistorialTransacciones from './HistorialTransacciones'
import JugadorCard from './JugadorCard'

// Solo dígitos y, como mucho, un separador decimal (coma o punto) con 2 decimales
const PATRON_IMPORTE = /^\d*([.,]\d{0,2})?$/

interface PantallaJuegoProps {
  partida: Partida
  onPagar: () => void
  onAbandonar: () => void
}

function PantallaJuego({ partida, onPagar, onAbandonar }: PantallaJuegoProps) {
  const [historialAbierto, setHistorialAbierto] = useState(false)
  const { jugadores, seleccionados, cantidadCuenta, jugadorQueAumentoMano, transacciones, historialJuego, ronda } =
    partida

  // Vista previa del reparto: "÷ 3 = 33.33€"
  const cantidad = parsearCantidad(cantidadCuenta)
  const vistaPrevia =
    cantidad !== null && seleccionados.length > 0
      ? `÷ ${seleccionados.length} = ${calcularParte(cantidad, seleccionados.length).toFixed(2)}€`
      : null

  return (
    <div className="flex flex-col h-dvh bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      {/* Encabezado */}
      <div className="w-full max-w-4xl mx-auto mb-4">
        <div className="flex items-center justify-center relative">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">AC_LaCuenta</h1>
          <button
            onClick={() => setHistorialAbierto(!historialAbierto)}
            className="absolute right-0 cursor-pointer hover:opacity-80 transition"
            title="Ver historial y opciones"
          >
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">R{ronda}</div>
          </button>
        </div>
      </div>

      {/* Historial desplegable (disponible desde la ronda 1, para poder abandonar) */}
      {historialAbierto && (
        <>
          <HistorialTransacciones
            transacciones={transacciones}
            jugadores={jugadores}
            onCerrar={() => setHistorialAbierto(false)}
          />
          <button
            onClick={onAbandonar}
            className="w-full max-w-4xl mx-auto bg-orange-400 hover:bg-orange-500 text-white font-bold py-3 px-4 rounded-lg transition mb-4"
          >
            🚪 Abandonar Partida
          </button>
        </>
      )}

      {/* Tarjetas con scroll independiente */}
      <div className="flex-1 min-h-0 w-full max-w-4xl mx-auto overflow-y-auto overflow-x-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full px-2 py-2">
          {jugadores.map((jugador) => (
            <JugadorCard
              key={jugador.id}
              jugador={jugador}
              seleccionado={seleccionados.includes(jugador.id)}
              tieneMasUno={jugadorQueAumentoMano === jugador.id}
              transacciones={transacciones}
              onToggleSeleccion={() => partida.toggleSeleccion(jugador.id)}
              onAumentarCartas={() => partida.aumentarCartas(jugador.id)}
            />
          ))}
        </div>
      </div>

      {/* Pago y botones, fijos abajo */}
      <div className="w-full max-w-4xl mx-auto mt-4">
        <div className="mb-2">
          <input
            type="text"
            inputMode="decimal"
            enterKeyHint="done"
            autoComplete="off"
            value={cantidadCuenta}
            onChange={(e) => PATRON_IMPORTE.test(e.target.value) && partida.setCantidadCuenta(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onPagar()}
            placeholder="Monto (ej: 400)"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {vistaPrevia && <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{vistaPrevia}</p>}
        </div>

        <div className="flex gap-2">
          <button
            onClick={partida.deshacer}
            disabled={historialJuego.length === 0}
            className="w-1/4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-2 rounded-lg transition"
            title="Deshacer último pago"
          >
            ↩️
          </button>
          <button
            onClick={onPagar}
            className="w-3/4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition text-lg"
          >
            Pagar
          </button>
        </div>
      </div>
    </div>
  )
}

export default PantallaJuego
