// ===== POPUP PROPIO (sustituye a alert / confirm del navegador) =====
import { useEffect } from 'react'
import type { ModalConfig } from '../types'

interface ModalProps {
  config: ModalConfig
  onCerrar: () => void
}

function Modal({ config, onCerrar }: ModalProps) {
  const esConfirmacion = config.tipo === 'confirmar'

  // Cerrar con Escape
  useEffect(() => {
    const alPulsarTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar()
    }
    window.addEventListener('keydown', alPulsarTecla)
    return () => window.removeEventListener('keydown', alPulsarTecla)
  }, [onCerrar])

  const confirmar = () => {
    onCerrar()
    config.onConfirmar?.()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onCerrar}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
        className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="modal-titulo" className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          {config.titulo}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{config.mensaje}</p>

        <div className="flex gap-2">
          {esConfirmacion && (
            <button
              onClick={onCerrar}
              className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 font-bold py-3 px-4 rounded-lg transition"
            >
              Cancelar
            </button>
          )}
          <button
            autoFocus
            onClick={esConfirmacion ? confirmar : onCerrar}
            className={`flex-1 text-white font-bold py-3 px-4 rounded-lg transition ${
              config.peligroso ? 'bg-orange-500 hover:bg-orange-600' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {config.textoConfirmar ?? (esConfirmacion ? 'Aceptar' : 'Entendido')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Modal
