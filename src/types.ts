// ===== TIPOS DE LA APLICACIÓN =====

export type Pantalla = 'setup' | 'juego' | 'fin'

export interface Jugador {
  id: string // Identificador único
  nombre: string // Nombre del jugador
  dinero: number // Saldo actual en euros (siempre redondeado a céntimos)
  cartas: number // Cartas en la mano (5-10)
}

// Estado completo guardado ANTES de cada pago, para poder deshacerlo
export interface HistorialSnapshot {
  jugadores: Jugador[]
  seleccionados: string[]
  cantidadCuenta: string
  jugadorQueAumentoMano: string | null
}

export interface Transaccion {
  ronda: number
  tipo: 'pago' | '+1' | 'deshacer'
  jugadorId?: string
  descripcion: string
  timestamp: string
}

// Estado persistido en localStorage.
// Los perdedores no se guardan: se calculan a partir de `jugadores` (dinero <= 0).
export interface EstadoPartida {
  pantalla: Pantalla
  jugadoresSetup: string[]
  jugadores: Jugador[]
  seleccionados: string[]
  cantidadCuenta: string
  jugadorQueAumentoMano: string | null
  historialJuego: HistorialSnapshot[]
  transacciones: Transaccion[]
}

// Configuración del popup propio (sustituye a alert/confirm)
export interface ModalConfig {
  titulo: string
  mensaje: string
  tipo: 'aviso' | 'confirmar'
  textoConfirmar?: string
  peligroso?: boolean // Botón de confirmar en rojo/naranja
  onConfirmar?: () => void
}
