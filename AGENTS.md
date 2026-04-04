# AGENTS.md - Normas de Comportamiento para Agentes

## 📋 Descripción General
Este archivo define las normas de comportamiento, convenciones y directrices que deben seguir los agentes al trabajar en el proyecto AC_LaCuenta.

---

## 🎯 Principios Fundamentales

1. **Mantén la arquitectura limpia**
   - Un componente principal en `App.tsx` (por ahora)
   - Separación clara de las 3 pantallas: setup, juego, fin
   - Tipos bien definidos con interfaces TypeScript

2. **Código TypeScript strict**
   - Todos los valores deben estar tipados
   - Usar interfaces para estructuras de datos
   - Evitar `any`

3. **Estilos con Tailwind CSS v4**
   - Usar clases de Tailwind, no CSS custom
   - Mantener consistencia de colores
   - Siempre considerar tema oscuro

4. **Gestión de estado con `useState` + `useEffect`**
   - Para funcionalidades simples usar `useState`
   - Si crece el proyecto, migrar a Context o Zustand
   - Comentar la lógica de estado compleja
   - **localStorage**: Usar `useEffect` para guardar/cargar automáticamente
     - Key: `STORAGE_KEY` constante
     - Estructura: interfaz `EstadoPartida` tipada
     - Cargar al montar, guardar en cada cambio
     - Limpiar cuando usuario vuelve al setup

---

## 📝 Convenciones de Código

### Nombres
- **Componentes**: PascalCase (ej: `App`, `JugadorCard`)
- **Variables**: camelCase (ej: `jugadores`, `cantidadCuenta`)
- **Constantes**: UPPER_SNAKE_CASE (ej: `DINERO_INICIAL`)
- **Interfaces**: PascalCase con prefijo `I` opcional (ej: `Jugador`)

### Estructura
```typescript
// 1. Imports
import { useState } from 'react'

// 2. Tipos/Interfaces
interface Jugador {
  id: string
  nombre: string
  dinero: number
}

// 3. Constantes
const DINERO_INICIAL = { 3: 900, ... }

// 4. Componente
function App() {
  // 5. Estados
  const [jugadores, setJugadores] = useState(...)
  
  // 6. Funciones helpers
  const agregarJugador = () => { ... }
  
  // 7. Render
  return ( ... )
}

export default App
```

### Comentarios
- Comentar lógica compleja
- Títulos de secciones grandes: `// ===== PANTALLA SETUP =====`
- Evitar comentarios obvios

---

## 🎮 Estructura de Datos

### Jugador
```typescript
interface Jugador {
  id: string          // Identificador único
  nombre: string      // Nombre del jugador
  dinero: number      // Saldo actual en euros
  cartas: number      // Cartas/Mano actual (5-10, por defecto 5)
}
```

### EstadoPartida (persistencia)
```typescript
interface EstadoPartida {
  pantalla: Pantalla                // 'setup' | 'juego' | 'fin'
  jugadoresSetup: string[]          // Nombres para siguiente partida
  jugadores: Jugador[]              // Estado actual del juego
  seleccionados: string[]           // IDs de pagadores
  cantidadCuenta: string            // Importe a pagar
  jugadorQueAumentoMano: string | null
  jugadorPerdedor: Jugador | null
}
```

### Pantalla (Type)
```typescript
type Pantalla = 'setup' | 'juego' | 'fin'
```

### Dinero Inicial
```typescript
const DINERO_INICIAL: Record<number, number> = {
  3: 900,
  4: 1000,
  5: 1100,
  6: 1200,
  7: 1300,
  8: 1400,
}
```

### Estados del Juego
- `seleccionados`: array de IDs de jugadores que van a pagar
- `jugadorQueAumentoMano`: ID del jugador con +1 activado (o null)
- Al deseleccionar un jugador, si tiene +1 se le quita automáticamente

---

## 🎨 Estilos

### Colores
- **Positivo (dinero)**: `text-green-600`, `bg-green-500`, `bg-green-600`
- **Negativo (sin dinero)**: `text-red-600`, `bg-red-500`
- **Neutral**: `bg-gray-100`, `text-gray-800`
- **Acción/Selección**: `bg-indigo-600`, `text-indigo-400`
- **Éxito**: `bg-green-600`
- **Advertencia**: `bg-orange-500`

### Estructura Common
```html
<!-- Contenedor página -->
<div className="flex flex-col items-center justify-center min-h-screen 
  bg-gradient-to-br from-blue-50 to-indigo-100 
  dark:from-gray-900 dark:to-gray-800 p-4">
  
  <!-- Contenido -->
  <div className="w-full max-w-2xl">
    ...
  </div>
</div>
```

### Tarjetas
```html
<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
  ...
</div>
```

---

## 🔄 Funcionalidad Core

### Lógica de División de Cuenta
```typescript
const precioPorPersona = cantidad / seleccionados.length

const nuevosJugadores = jugadores.map((j) => {
  if (seleccionados.includes(j.id)) {
    return { ...j, dinero: j.dinero - precioPorPersona }
  }
  return j
})
```

### Sistema de Deshacer ⏮️
- **Snapshot**: Se guarda estado completo ANTES de cada pago
- **Restauración**: Botón "↩️ Deshacer" restaura último snapshot
- **Limitaciones**: Solo se puede deshacer pagos, no selecciones de jugadores o cambios de cartas
- **Persistencia**: El historial se guarda en localStorage

### Validaciones
- ✅ Mínimo 3 jugadores, máximo 8
- ✅ Cantidad a pagar: > 0
- ✅ Al menos 1 jugador seleccionado
- ✅ Jugador con 0€ o menos → fin de partida
- ✅ Máximo 10 cartas por jugador
- ✅ Solo 1 aumento de cartas (+1) por ronda
- ✅ Si hay un +1 activado, ese jugador DEBE estar seleccionado para pagar
- ✅ Al deseleccionar un jugador con +1, se le quita automáticamente
- ✅ Confirmación al abandonar partida (evita abandonos accidentales)

---

## 🔢 Contador y Historial

### Contador de Rondas
- Muestra número actual de ronda (1, 2, 3...)
- Ubicación: esquina superior derecha de la pantalla de juego
- Calculado como: `historialJuego.length + 1`

### Historial de Transacciones
- Cada pago se registra automáticamente con:
  - Número de ronda
  - Nombres de pagadores
  - Monto total y por persona
  - Timestamp (HH:MM:SS)
- Presentado como acordeón expandible
- Se guarda y restaura desde localStorage

### Lógica de Cartas (+1 por Ronda)
```typescript
// Cada jugador inicia con 5 cartas
const aumentarCartas = (id: string) => {
  // Si no está seleccionado, seleccionar automáticamente
  // Si ya tiene +1, toggle off (restar 1 carta)
  // Si otro tiene +1, quitárselo primero
  // Luego asignar el +1 al jugador actual
  // Máximo 10 cartas
}

// Al pagar
pagarCuenta() {
  // Resetea jugadorQueAumentoMano = null (prepara próxima ronda)
}
```

---

## 📦 Dependencias Permitidas

**Núcleo:**
- `react` (19.2.4+)
- `react-dom` (19.2.4+)

**Build:**
- `typescript` (~5.9.3)
- `vite` (^8.0.1)

**Estilos:**
- `tailwindcss` (^4.2.2)
- `@tailwindcss/postcss`
- `postcss` (^8.5.8)
- `autoprefixer` (^10.4.27)

**Herramientas:**
- `eslint` (^9.39.4)
- `vite-plugin-pwa` (^1.2.0)

**Agregar nuevas dependencias solo si es crucial**

---

## ⚠️ Lo que NO hacer

- ❌ No cambies la estructura de App.tsx sin una razón arquitectónica sólida
- ❌ No uses CSS custom si puedes hacerlo con Tailwind
- ❌ No ignores errores de TypeScript
- ❌ No hagas cambios sin actualizar README.md o AGENTS.md si es relevante
- ❌ No uses bibliotecas de estado (Redux, etc.) sin consultar primero
- ❌ No cambies las interfaces de datos sin documentar el cambio

---

## ✅ Checklist para Cambios

Cuando hagas cambios importantes:

- [ ] ¿El código sigue las convenciones de nombres?
- [ ] ¿Está todo tipado con TypeScript?
- [ ] ¿Funciona en móvil y escritorio?
- [ ] ¿El tema oscuro se ve bien?
- [ ] ¿Hay comentarios en lógica compleja?
- [ ] ¿Actualizaste README.md si hay cambios en features?
- [ ] ¿Actualizaste AGENTS.md si hay cambios en convenciones o estructura?
- [ ] ¿Probaste la funcionalidad en el navegador?

---

## 📚 Referencias Rápidas

- **React Hooks**: https://react.dev/reference/react
- **Tailwind CSS**: https://tailwindcss.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Vite**: https://vitejs.dev/

---

**Última actualización**: 04/04/2026
**Aplicación**: AC_LaCuenta v1.0.0
