// ===== CÁLCULOS DE DINERO EN CÉNTIMOS =====
// Todo se calcula en céntimos enteros para evitar errores de coma flotante
// (ej: 100 / 3 = 33.333...), que dejaban saldos como 0.0000001€.

export const aCentimos = (euros: number): number => Math.round(euros * 100)

export const aEuros = (centimos: number): number => centimos / 100

export const formatearEuros = (euros: number): string => `${euros.toFixed(2)}€`

/**
 * Convierte el texto del input a número. Acepta coma o punto decimal.
 * Devuelve null si no es un importe válido (vacío, negativo o no numérico).
 */
export const parsearCantidad = (texto: string): number | null => {
  const normalizado = texto.trim().replace(',', '.')
  if (normalizado === '') return null
  const cantidad = Number(normalizado)
  if (!Number.isFinite(cantidad) || cantidad < 0) return null
  return cantidad
}

/**
 * Parte que paga cada jugador, redondeada hacia abajo al céntimo.
 * Todos pagan lo mismo y los céntimos sobrantes no los paga nadie.
 * Ej: 100€ entre 3 → 33.33€ cada uno
 */
export const calcularParte = (cantidad: number, numJugadores: number): number =>
  aEuros(Math.floor(aCentimos(cantidad) / numJugadores))

/** Resta dos importes en euros sin errores de coma flotante */
export const restarEuros = (a: number, b: number): number => aEuros(aCentimos(a) - aCentimos(b))
