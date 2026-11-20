import { useCallback, useState } from 'react'
import Modal from './components/Modal'
import PantallaFin from './components/PantallaFin'
import PantallaJuego from './components/PantallaJuego'
import PantallaSetup from './components/PantallaSetup'
import { usePartida } from './hooks/usePartida'
import type { ModalConfig } from './types'

// Componente principal: elige la pantalla y gestiona los popups.
// La lógica del juego vive en el hook usePartida.
function App() {
  const partida = usePartida()
  const [modal, setModal] = useState<ModalConfig | null>(null)

  const cerrarModal = useCallback(() => setModal(null), [])

  const mostrarAviso = (mensaje: string | null) => {
    if (mensaje) setModal({ tipo: 'aviso', titulo: 'Atención', mensaje })
  }

  const abandonarPartida = () => {
    setModal({
      tipo: 'confirmar',
      titulo: '¿Abandonar la partida?',
      mensaje: 'Se perderá el progreso de esta partida.',
      textoConfirmar: 'Abandonar',
      peligroso: true,
      onConfirmar: partida.volverAlSetup,
    })
  }

  // Revancha: nueva partida al momento con los mismos jugadores
  const revancha = () => mostrarAviso(partida.iniciarPartida(partida.jugadores.map((j) => j.nombre)))

  return (
    <>
      {partida.pantalla === 'setup' && (
        <PantallaSetup
          jugadoresSetup={partida.jugadoresSetup}
          onAgregar={partida.agregarJugadorSetup}
          onEliminar={partida.eliminarJugadorSetup}
          onIniciar={() => mostrarAviso(partida.iniciarPartida())}
        />
      )}
      {partida.pantalla === 'juego' && (
        <PantallaJuego
          partida={partida}
          onPagar={() => mostrarAviso(partida.pagarCuenta())}
          onAbandonar={abandonarPartida}
        />
      )}
      {partida.pantalla === 'fin' && <PantallaFin partida={partida} onRevancha={revancha} />}

      {modal && <Modal config={modal} onCerrar={cerrarModal} />}
    </>
  )
}

export default App
