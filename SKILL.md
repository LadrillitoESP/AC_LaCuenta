# SKILL.md - AC_LaCuenta Game Logic

## name
ac-lacuenta-game

## description
Specialized knowledge for working with AC_LaCuenta, a split-the-bill card game built with React, TypeScript, and Tailwind CSS. Use this skill when modifying game logic, UI components, state management, or adding new features to the application.

## when to use
- Modifying game screens (setup, juego, fin)
- Working with game state, player management, or payment logic
- Adding or modifying the undo system, transaction history, or card system
- Updating UI components, styling, or responsive design
- Working with localStorage persistence

## project overview
AC_LaCuenta is a web app for playing a card-based split-the-bill game. Players start with money, take turns paying portions of bills, and can increase their hand size by +1 card per round. The game ends when a player reaches 0€.

## tech stack
- **Framework**: React 19.2.4+ with TypeScript ~5.9.3
- **Build**: Vite ^8.0.1
- **Styling**: Tailwind CSS ^4.2.2 (no custom CSS)
- **Linting**: ESLint ^9.39.4
- **State**: useState + useEffect (localStorage for persistence)

## architecture

### file structure
```
src/
  App.tsx          # Main component with all 3 screens
  main.tsx         # Entry point
  index.css        # Tailwind imports
```

### screens
1. **setup** - Player creation (3-8 players), name input, start game
2. **juego** - Main game loop: select payers, increase cards, pay bills
3. **fin** - Game over display, loser announcement, restart option

## data structures

### Jugador
```typescript
interface Jugador {
  id: string          // Unique identifier
  nombre: string      // Player name
  dinero: number      // Current balance in euros
  cartas: number      // Current hand size (5-10, default 5)
}
```

### EstadoPartida (persisted)
```typescript
interface EstadoPartida {
  pantalla: Pantalla                // 'setup' | 'juego' | 'fin'
  jugadoresSetup: string[]          // Names for next game
  jugadores: Jugador[]              // Current game state
  seleccionados: string[]           // IDs of current payers
  cantidadCuenta: string            // Bill amount to pay
  jugadorQueAumentoMano: string | null  // Who has +1 this round
  jugadorPerdedor: Jugador | null   // Player who lost
  historialJuego: HistorialSnapshot[]  // Undo stack
  transacciones: Transaccion[]          // Transaction history
}
```

### Transaccion
```typescript
interface Transaccion {
  ronda: number
  tipo: 'pago' | '+1' | 'deshacer'
  jugadorId?: string
  descripcion: string
  timestamp: string  // HH:MM:SS format
}
```

### HistorialSnapshot
```typescript
interface HistorialSnapshot {
  jugadores: Jugador[]
  seleccionados: string[]
  cantidadCuenta: string
  jugadorQueAumentoMano: string | null
}
```

### Pantalla type
```typescript
type Pantalla = 'setup' | 'juego' | 'fin'
```

### Initial money by player count
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

## core game logic

### payment splitting
```typescript
const precioPorPersona = cantidad / seleccionados.length

const nuevosJugadores = jugadores.map((j) => {
  if (seleccionados.includes(j.id)) {
    return { ...j, dinero: j.dinero - precioPorPersona }
  }
  return j
})
```

### card system (+1 per round)
- Players start with 5 cards
- One player per round can increase hand by +1 card
- If another player activates +1, it removes from previous player
- Reset after payment (jugadorQueAumentoMano = null)
- Max 10 cards per player
- If player with +1 is deselected, +1 is removed automatically

### undo system
- Full state snapshot saved BEFORE each payment
- "↩️ Deshacer" button restores last snapshot
- Only payments can be undone, not player selections or card changes
- History persisted in localStorage

### round counter
- Displayed top-right of game screen
- Clickable: toggles full transaction history modal
- Calculated as: `historialJuego.length + 1`

### transaction history
- Modal triggered by clicking round counter
- Records: payments, +1 assignments, undos
- Format: `R1: Juan pagó -50€    14:32:45`
- Personal history shown below each player's name on cards

## validations
- ✅ Min 3 players, max 8
- ✅ Bill amount >= 0 (0€ allowed; empty or negative rejected)
- ✅ At least 1 player selected to pay
- ✅ Player with ≤0€ ends game
- ✅ Max 10 cards per player
- ✅ Only 1 card increase (+1) per round
- ✅ If +1 is active, that player MUST be selected to pay
- ✅ Deselecting player with +1 removes it automatically
- ✅ Confirmation dialog when abandoning game

## styling conventions

### colors
- **Positive (money)**: `text-green-600`, `bg-green-500`, `bg-green-600`
- **Negative (no money)**: `text-red-600`, `bg-red-500`
- **Neutral**: `bg-gray-100`, `text-gray-800`
- **Action/Selection**: `bg-indigo-600`, `text-indigo-400`
- **Success**: `bg-green-600`
- **Warning**: `bg-orange-500`
- **+1 button normal**: `bg-emerald-700`
- **+1 button active**: `bg-orange-600`
- **Selected card**: `bg-indigo-500`

### common structures
```html
<!-- Page container -->
<div className="flex flex-col items-center justify-center min-h-screen 
  bg-gradient-to-br from-blue-50 to-indigo-100 
  dark:from-gray-900 dark:to-gray-800 p-4">
  <div className="w-full max-w-2xl">
    ...
  </div>
</div>

<!-- Card -->
<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
  ...
</div>
```

## persistence (localStorage)
- **Key**: `ac_lacuenta_game`
- **Auto-save**: Every state change via useEffect
- **Auto-load**: On app mount
- **Clear**: When returning to setup screen
- **Structure**: EstadoPartida interface

## code conventions

### naming
- **Components**: PascalCase (App, JugadorCard)
- **Variables**: camelCase (jugadores, cantidadCuenta)
- **Constants**: UPPER_SNAKE_CASE (DINERO_INICIAL)
- **Interfaces**: PascalCase (Jugador, EstadoPartida)

### file structure
```typescript
// 1. Imports
import { useState } from 'react'

// 2. Types/Interfaces
interface Jugador { ... }

// 3. Constants
const DINERO_INICIAL = { ... }

// 4. Component
function App() {
  // 5. States
  const [jugadores, setJugadores] = useState(...)
  
  // 6. Helper functions
  const agregarJugador = () => { ... }
  
  // 7. Render
  return ( ... )
}

export default App
```

### comments
- Comment complex logic only
- Use section titles: `// ===== PANTALLA SETUP =====`
- Avoid obvious comments

## round flow
1. Select players (click on card)
2. Optionally increase someone's cards (click +1)
3. Enter bill amount
4. Click "Pagar"
5. System validates and deducts money proportionally
6. Transaction recorded per player (-50€, etc.)
7. +1 action recorded when assigned
8. Can undo payment via "↩️ Deshacer"
9. Detect loser if applicable
10. If no loser:
    - Click round number to view full history
    - Each card shows personal history
    - Cards show current money and cards

## what NOT to do
- ❌ Don't change App.tsx structure without solid architectural reason
- ❌ Don't use custom CSS if Tailwind can do it
- ❌ Don't ignore TypeScript errors
- ❌ Don't make changes without updating README.md or AGENTS.md if relevant
- ❌ Don't use state libraries (Redux, etc.) without consulting
- ❌ Don't change data interfaces without documenting the change
- ❌ Don't add new dependencies unless crucial

## change checklist
- [ ] Code follows naming conventions?
- [ ] Everything typed with TypeScript?
- [ ] Works on mobile and desktop?
- [ ] Dark theme looks good?
- [ ] Comments on complex logic?
- [ ] Updated README.md if feature changes?
- [ ] Updated AGENTS.md if conventions change?
- [ ] Tested functionality in browser?

---

**last updated**: 05/04/2026
**application**: AC_LaCuenta v1.0.0
