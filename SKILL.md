# SKILL.md - Referencia Rápida de AC_LaCuenta

## 📱 Estructura de Pantallas

### 1. Pantalla SETUP (`setup`)
**Propósito**: Crear una nueva partida con jugadores.

**Estados clave**:
- `nombreNuevo`: string (input del usuario)
- `jugadoresSetup`: string[] (lista de nombres)

**Funciones**:
- `agregarJugadorSetup()`: Valida duplicados y añade a lista
- `eliminarJugadorSetup(index)`: Elimina por índice
- `iniciarPartida()`: Valida 3-8 jugadores, asigna dinero inicial y cartas

**Restricciones**:
- Mínimo 3 jugadores, máximo 8
- No permite duplicados

---

### 2. Pantalla JUEGO (`juego`)
**Propósito**: Gestionar la partida en curso.

**Estados clave**:
```typescript
jugadores: Jugador[]           // Estado principal de la partida
cantidadCuenta: string         // Input del usuario
seleccionados: string[]        // IDs de jugadores que pagan
jugadorQueAumentoMano: string | null  // Quién tiene el +1 esta ronda
```

**Funciones principales**:
- `toggleSeleccion(id)`: Añade/quita jugador de los pagadores
  - Si lo deseleccionas y tiene +1 → se le quita automáticamente
  
- `aumentarCartas(id)`: Maneja el sistema de +1
  - Si no está seleccionado → lo selecciona automáticamente
  - Toggle on: incrementa cartas, marca con +1
  - Toggle off: decrementa cartas, limpia +1
  - Máximo 10 cartas, solo 1 +1 por ronda

- `pagarCuenta()`: Resta dinero proporcional
  - **GUARDA SNAPSHOT antes del cambio para deshacer**
  - Validaciones:
    - Cantidad > 0
    - Al menos 1 seleccionado
    - Si hay +1, ese jugador debe estar seleccionado
  - Resetea `jugadorQueAumentoMano`
  - Detecta fin de partida (jugador con ≤0€)

- `deshacer()`: ⏮️ **NUEVA** - Restaura el último estado guardado
  - Restaura: jugadores, seleccionados, cantidadCuenta, jugadorQueAumentoMano
  - Botón deshabilitado si no hay historial
  - Se guarda automáticamente en localStorage

**Datos mostrados en tarjetas**:
- Nombre + Cartas en línea (ej: "Juan 5 🃏")
- Dinero en grande (ej: "900.00€")
- Botón grande (+1/-1) en la derecha

---

### 3. Pantalla FIN (`fin`)
**Propósito**: Mostrar resultados y permitir nueva partida.

**Estados clave**:
- `jugadorPerdedor`: Jugador (quien llegó a ≤0€)
- `jugadores`: Mostrados ordenados por dinero

**Funciones**:
- `volverAlSetup()`: Limpia estados excepto `jugadoresSetup` (reutiliza nombres)

---

## 💰 Dinero Inicial por Jugadores
```
3 → 900€
4 → 1000€
5 → 1100€
6 → 1200€
7 → 1300€
8 → 1400€
```

---

## 🎴 Sistema de Cartas
**Rango**: 5-10 cartas por jugador
**+1 por ronda**: 
- Un jugador puede aumentar su mano en 1 carta
- Si otro pulsa +1, se quita automáticamente del anterior
- Al pagar, se resetea para la siguiente ronda
- Si deseleccionas el jugador con +1, se le quita

---

## 🎨 Colores
- **Verde apagado** (`bg-emerald-700`): Botón +1 normal
- **Naranja rojizo** (`bg-orange-600`): Botón −1 (con +1 activado)
- **Indigo** (`bg-indigo-500`): Tarjeta seleccionada (pagador)
- **Verde** (`text-green-600`): Dinero positivo
- **Rojo** (`text-red-600`): Dinero ≤0€ (perdedor)

---

## 🔄 Flujo de Una Ronda
1. Selecciona jugadores (clic en tarjeta)
2. Opcionalmente aumenta cartas a alguien (clic en +1)
3. Escribe cantidad a pagar
4. Haz clic en "Pagar"
5. Sistema valida todo y resta dinero proporcional
6. **Se registra una transacción POR JUGADOR con su cantidad (-50€, etc.)**
7. **Se registra acción de +1 cuando se asigna**
8. **Puedes deshacer este pago clicando "↩️ Deshacer" (se registra también)**
9. Detecta perdedor si es necesario
10. Si nadie perdió:
    - Click en número de Ronda para ver historial completo
    - Cada tarjeta muestra el histórico personal del jugador
    - Cada tarjeta muestra el dinero y cartas actuales

---

## 🔢 Contador de Rondas ✅ IMPLEMENTADO
- Aparece en la esquina superior derecha de la pantalla de juego
- **ES CLICKEABLE**: Al hacer click se despliega/cierra el historial
- Muestra: `1`, `2`, etc.
- Se calcula como: `historialJuego.length + 1`
- Visible en todo momento

---

## 📋 Historial de Transacciones ✅ MEJORADO
- **Modal emergente**: Aparece cuando se cliquea en el número de rondas
- **Contenido**: Registra todas las acciones:
  - Pagos (con nombre del jugador)
  - Asignaciones de +1
  - Deshaceres
- **Cierre**: Botón ✕ en la esquina superior derecha del modal
- **Ejemplo**:
  ```
  R1: Juan pagó -50€           14:32:45
  R1: María pagó -50€          14:32:45
  R1: Ana recibió +1 carta     14:32:46
  R2: Juan pagó -30€           14:33:20
  R2: ↩️ Se deshizo la ronda   14:33:25
  ```

---

## 👤 Histórico Personal en Tarjetas ✅ NUEVO
- **Ubicación**: Debajo del nombre de cada jugador
- **Formato**: Texto pequeño, gris claro
- **Contenido**: Todas las acciones del jugador
  - Pagos: `-100€`, `-50€` (en gris)
  - +1: `+1🃏`
  - Separados por espacios
- **Ejemplo visual**:
  ```
  Juan
  -50€ +1🃏 -25€
  850€
  ```

---

## 📝 Datos a Persistir (localStorage) ✅ IMPLEMENTADO
```typescript
interface HistorialSnapshot {
  jugadores: Jugador[]
  seleccionados: string[]
  cantidadCuenta: string
  jugadorQueAumentoMano: string | null
}

interface Transaccion {
  ronda: number
  tipo: 'pago' | '+1' | 'deshacer'
  jugadorId?: string            // Para filtrar por jugador personal
  descripcion: string
  timestamp: string
}

interface EstadoPartida {
  pantalla: Pantalla
  jugadoresSetup: string[]
  jugadores: Jugador[]
  cantidadCuenta: string
  seleccionados: string[]
  jugadorQueAumentoMano: string | null
  jugadorPerdedor: Jugador | null
  historialJuego: HistorialSnapshot[]  // ⏮️ Stack de estados para deshacer
  transacciones: Transaccion[]          // 📋 Historial de acciones
}
```

**Comportamiento**:
- ✅ Guarda automáticamente cada cambio
- ✅ Carga estado al abrir la app
- ✅ Se limpia cuando el usuario vuelve al setup
- ✅ **Snapshots guardados antes de cada pago para poder deshacer**
- ✅ **Transacciones registran cada acción con timestamp y ronda**
- ✅ Storage key: `ac_lacuenta_game`

---

## 🚀 Próximas Features (TODO)
1. ☐ Modo claro/oscuro manual
2. ☐ Deshacer último pago
3. ☐ Historial de transacciones
4. ☐ Contador de rondas

---

**Última actualización**: 04/04/2026
