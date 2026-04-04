# AC_LaCuenta 🎮💰

**Aplicación web para automatizar los cálculos del juego de mesa "La Cuenta"**

Una aplicación interactiva y moderna diseñada específicamente para gestionar las partidas del juego de mesa **La Cuenta**. Automatiza la división de cuentas, gestión de cartas y seguimiento de saldos para que puedas enfocarte en disfrutar del juego con amigos, familia o compañeros de trabajo.

## ✨ Características

### 🎯 Fase de Setup
- Crear una nueva partida agregando jugadores
- Mínimo 3 jugadores, máximo 8
- Interfaz simple para gestionar la lista de participantes
- Validación automática de límites de jugadores

### 💵 Sistema Económico Dinámico
Dinero inicial automático basado en el número de jugadores:
- **3 jugadores**: 900€
- **4 jugadores**: 1000€
- **5 jugadores**: 1100€
- **6 jugadores**: 1200€
- **7 jugadores**: 1300€
- **8 jugadores**: 1400€

### 🎮 Pantalla de Juego
- **Tarjetas interactivas**: Haz clic en los jugadores para seleccionarlos (pagar)
- **Sistema de Cartas**: Cada jugador tiene entre 5-10 cartas
  - **+1 por ronda**: Un jugador puede aumentar su mano en 1 carta por ronda
  - **Toggle**: Pulsa el botón nuevamente para deshacer el aumento
  - **Auto-selección**: Al aumentar cartas, el jugador se añade automáticamente a los pagadores
- **División proporcional**: Escribe la cantidad y el sistema divide automáticamente
- **Vista previa en tiempo real**: Ve el cálculo antes de confirmar (cantidad ÷ seleccionados = por persona)
- **Selección múltiple**: Elige entre quién dividir la cuenta
- **Saldo visible**: Monitorea el dinero de cada jugador en tiempo real
- **Validaciones inteligentes**: El sistema valida que los +1 estén sincronizados con los pagadores

### 📊 Historial y Seguimiento
- **Historial de Transacciones**: Ver todas las rondas y pagos realizados con timestamps
- **Histórico Personal**: Cada tarjeta muestra un resumen de pagos y cartas de cada jugador
- **Contador de Rondas**: Acceso rápido al historial completo por ronda
- **Nombres en Negrita**: Fácil identificación de quién pagó en cada ronda
- **Cartas Anotadas**: Visualiza qué rondas tuvieron aumentos de cartas (+1)

### ↩️ Sistema de Deshacer
- **Deshacer Último Turno**: Revierte la última ronda completamente
- **Restauración de Estado**: Recupera jugadores seleccionados, cartas y saldos anteriores
- **Limpieza Automática**: Elimina transacciones de la ronda deshecha del historial personal
- **Botón Siempre Disponible**: Acceso rápido a deshacer durante el juego

### 💾 Persistencia Automática
- **Guardado en localStorage**: Toda la partida se guarda automáticamente
- **Carga al Reiniciar**: Continúa donde lo dejaste si refrescas la página
- **Sincronización en Tiempo Real**: Cambios guardados inmediatamente
- **Recuperación Completa**: Estado completo del juego, historial y selecciones se restauran

### 🏁 Final de Partida
- Detección automática cuando un jugador llega a 0€ o menos
- Pantalla de resumen con clasificación final
- Opción para iniciar una nueva partida
- Historial completo conservado hasta empezar nuevo juego

## 🛠️ Tecnologías

- **React 19** - Librería UI moderna y reactiva
- **TypeScript** - Tipado estático para mayor seguridad
- **Vite** - Bundler y servidor de desarrollo ultrarrápido
- **Tailwind CSS v4** - Estilos modernos y responsivos
- **PWA Plugin** - Capacidades offline (Progressive Web App)

## 💻 Requisitos

- Node.js 18+
- npm o yarn

## 🚀 Instalación y Ejecución

```bash
# Clonar el repositorio
git clone https://github.com/TU_USERNAME/AC_LaCuenta.git
cd AC_LaCuenta

# Instalar dependencias
npm install --legacy-peer-deps

# Ejecutar en desarrollo
npm run dev

# Acceder a la aplicación
# Abre http://localhost:5173 en tu navegador
```

## 📦 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Compilar para producción
npm run build

# Previsualizar build de producción
npm run preview

# Ejecutar linter
npm run lint
```

## 🎮 Cómo Usar

1. **Inicia la aplicación** y ve a la pantalla de setup
2. **Añade jugadores**: Escribe nombres y haz clic en "Añadir"
3. **Confirma jugadores**: Necesitas entre 3 y 8 jugadores
4. **Inicia la partida**: Se asigna dinero inicial automáticamente
5. **Durante el juego**:
   - Haz clic en las tarjetas de los jugadores para seleccionarlos
   - Escribe la cantidad a repartir
   - Haz clic en "Pagar" para completar la ronda
   - Si necesitas corregir, usa el botón "Deshacer"
   - Consulta el historial haciendo clic en el número de ronda
6. **Fin automático**: La partida termina cuando alguien llegue a 0€

## 🎨 Diseño

- Interfaz responsiva (funciona en móvil, tablet y escritorio)
- Tema oscuro automático según preferencias del sistema
- Tarjetas animadas que se expanden al seleccionar
- Colores intuitivos: verde para dinero, rojo para advertencias, azul para acciones
- Gradientes modernos y sombras elegantes
- Colores intuitivos: verde para positivo, rojo para negativo

## 📝 Estructura del Proyecto

```
src/
├── App.tsx          # Componente principal con toda la lógica
├── App.css          # Estilos específicos de la app
├── main.tsx         # Punto de entrada
├── index.css        # Estilos globales
└── vite-env.d.ts    # Tipos para Vite

root/
├── package.json     # Dependencias del proyecto
├── vite.config.ts   # Configuración de Vite
├── tailwind.config.js # Configuración de Tailwind
├── postcss.config.js # Configuración de PostCSS
└── tsconfig.json    # Configuración de TypeScript
```

## 🔧 Configuración

### Tailwind CSS
La aplicación utiliza Tailwind CSS v4 con PostCSS para generar estilos optimizados.

### TypeScript
Usa configuración estricta para asegurar código seguro y bien tipado.

## 📄 Licencia

Proyecto personal - AC_LaCuenta 2026

## 🤝 Contribuir

Este es un proyecto en desarrollo. Las mejoras y sugerencias son bienvenidas.

---

**Hecho con ❤️ por AC_LaCuenta**
