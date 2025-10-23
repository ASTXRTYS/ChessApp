# UI Shell Module

**Owner**: UI-Shell-Dev Agent
**Responsibility**: HTML structure, controls, settings panel, DOM updates

## Your Files

You OWN and can ONLY modify these files:
- `modules/ui/shell.js`
- `modules/ui/controls.js`
- `modules/ui/settings.js`
- `index.html` (you're the ONLY one who touches this)

## What You're Building

The user interface layer:
1. HTML structure (timers, controls, settings)
2. Control panel (play/pause/reset buttons)
3. Settings panel (time presets, scene selection, profiles)
4. DOM updates (timer display, move counter, active states)
5. Victory modal

## Public API

### `shell.js`
```javascript
export function init()
export function showVictoryModal(winner, stats)
export function hideVictoryModal()
export function updateTimerDisplay(player, timeString)
export function updateMovesDisplay(player, moves)
export function setActivePlayer(player)
```

### `controls.js`
```javascript
export function init()
export function showControls()
export function hideControls()
export function enableControls()
export function disableControls()
```

### `settings.js`
```javascript
export function init()
export function showSettings()
export function hideSettings()
export function loadSettings()
export function saveSettings()
```

## Events You Emit

```javascript
import { emit } from '../../core/events.js'

// User clicks controls
emit('ui:start-clicked')
emit('ui:pause-clicked')
emit('ui:reset-clicked')
emit('ui:settings-clicked')

// User clicks timer
emit('ui:player-clicked', { player: 1 })

// Settings changes
emit('ui:time-selected', { seconds: 300 })
emit('ui:scene-changed', { sceneName: 'stadium' })
emit('ui:setting-changed', { key: 'audioEnabled', value: true })

// Profile selection
emit('ui:profile-selected', { player: 1, profileId: 5 })
```

## Events You Listen To

```javascript
import { on } from '../../core/events.js'

// Game state changes
on('game:tick', (data) => { /* Update timer display */ })
on('game:player-switched', (data) => { /* Update active states */ })
on('game:victory', (data) => { /* Show victory modal */ })
on('game:low-time', (data) => { /* Add urgency styling */ })

// Renderer feedback
on('renderer:scene-loading', () => { /* Show loading */ })
on('renderer:scene-loaded', () => { /* Hide loading */ })
```

## State You Subscribe To

```javascript
import { subscribe } from '../../core/state.js'

// Update displays when state changes
subscribe('player1Time', (time) => updateTimerDisplay(1, formatTime(time)))
subscribe('player2Time', (time) => updateTimerDisplay(2, formatTime(time)))
subscribe('player1Moves', (moves) => updateMovesDisplay(1, moves))
subscribe('player2Moves', (moves) => updateMovesDisplay(2, moves))
subscribe('activePlayer', (player) => setActivePlayer(player))
subscribe('isPaused', (paused) => updatePauseButton(paused))
```

## HTML Structure (`index.html`)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chess Clock V2</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="styles.css">
</head>
<body class="bg-gray-900 text-white h-screen overflow-hidden">
    <!-- Settings Panel (slides from top) -->
    <div id="settingsPanel" class="settings-panel">
        <!-- Settings content -->
    </div>

    <!-- Main container -->
    <div class="h-screen flex flex-col">
        <!-- Player 2 Timer (top, rotated 180deg) -->
        <div id="player2" class="timer-container flex-1" data-player="2">
            <div class="timer-display rotate-180">
                <div id="player2Label" class="player-label">PLAYER 2</div>
                <div id="time2" class="time-text">05:00</div>
                <div id="moves2" class="moves-text">Moves: 0</div>
            </div>
        </div>

        <!-- 3D Canvas (rendered by renderer module) -->
        <canvas id="renderCanvas" class="absolute inset-0 pointer-events-none"></canvas>

        <!-- Control Panel (center) -->
        <div id="controlPanel" class="control-panel">
            <button id="settingsBtn" class="control-btn">⚙️</button>
            <button id="pauseBtn" class="control-btn">⏸️</button>
            <button id="resetBtn" class="control-btn">🔄</button>
        </div>

        <!-- Player 1 Timer (bottom) -->
        <div id="player1" class="timer-container flex-1" data-player="1">
            <div class="timer-display">
                <div id="moves1" class="moves-text">Moves: 0</div>
                <div id="time1" class="time-text">05:00</div>
                <div id="player1Label" class="player-label">PLAYER 1</div>
            </div>
        </div>
    </div>

    <!-- Victory Modal -->
    <div id="victoryModal" class="hidden victory-modal">
        <div class="modal-content">
            <h2 id="victoryTitle">Player 1 Wins!</h2>
            <div id="victoryStats"></div>
            <button id="closeVictoryBtn">Close</button>
        </div>
    </div>

    <!-- Load modules -->
    <script type="module">
        import { init as initUI } from './modules/ui/shell.js'
        import { init as initGame } from './modules/game/engine.js'
        import { init as initAudio } from './modules/audio/engine.js'
        import { init as initRenderer } from './modules/renderer/scene-manager.js'

        // Initialize all modules
        initUI()
        initGame()
        initAudio()
        initRenderer(document.getElementById('renderCanvas'))
    </script>
</body>
</html>
```

## Implementation Guide

### 1. Setup (`shell.js`)

```javascript
import { emit, on } from '../../core/events.js'
import { subscribe, get } from '../../core/state.js'
import { init as initControls } from './controls.js'
import { init as initSettings } from './settings.js'

let initialized = false

export function init() {
  if (initialized) return

  setupEventListeners()
  setupStateSubscriptions()
  setupTimerClicks()

  initControls()
  initSettings()

  initialized = true
}

function setupEventListeners() {
  // Listen to game events
  on('game:tick', handleTick)
  on('game:victory', handleVictory)
  on('game:player-switched', handlePlayerSwitch)
  on('game:low-time', handleLowTime)
}

function setupStateSubscriptions() {
  subscribe('player1Time', (time) => {
    updateTimerDisplay(1, formatTime(time))
  })
  subscribe('player2Time', (time) => {
    updateTimerDisplay(2, formatTime(time))
  })
  // ... more subscriptions
}

function setupTimerClicks() {
  document.getElementById('player1').addEventListener('click', () => {
    emit('ui:player-clicked', { player: 1 })
  })
  document.getElementById('player2').addEventListener('click', () => {
    emit('ui:player-clicked', { player: 2 })
  })
}
```

### 2. Display Updates

```javascript
export function updateTimerDisplay(player, timeString) {
  const element = document.getElementById(`time${player}`)
  if (element) {
    element.textContent = timeString
  }
}

export function updateMovesDisplay(player, moves) {
  const element = document.getElementById(`moves${player}`)
  if (element) {
    element.textContent = `Moves: ${moves}`
  }
}

export function setActivePlayer(player) {
  const player1El = document.getElementById('player1')
  const player2El = document.getElementById('player2')

  player1El.classList.toggle('timer-active', player === 1)
  player1El.classList.toggle('timer-inactive', player !== 1)
  player2El.classList.toggle('timer-active', player === 2)
  player2El.classList.toggle('timer-inactive', player !== 2)
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}
```

### 3. Controls (`controls.js`)

```javascript
import { emit } from '../../core/events.js'

export function init() {
  document.getElementById('pauseBtn').addEventListener('click', () => {
    emit('ui:pause-clicked')
  })

  document.getElementById('resetBtn').addEventListener('click', () => {
    emit('ui:reset-clicked')
  })

  document.getElementById('settingsBtn').addEventListener('click', () => {
    emit('ui:settings-clicked')
  })
}

export function showControls() {
  document.getElementById('controlPanel').style.opacity = '1'
}

export function hideControls() {
  document.getElementById('controlPanel').style.opacity = '0'
}
```

### 4. Settings (`settings.js`)

```javascript
import { emit } from '../../core/events.js'
import { CONFIG } from '../../core/config.js'

export function init() {
  setupTimePresets()
  setupSceneSelection()
  setupProfileSelection()
}

function setupTimePresets() {
  const presets = CONFIG.TIME_PRESETS
  const container = document.getElementById('timePresets')

  presets.forEach(seconds => {
    const button = document.createElement('button')
    button.textContent = `${seconds / 60} min`
    button.addEventListener('click', () => {
      emit('ui:time-selected', { seconds })
      hideSettings()
    })
    container.appendChild(button)
  })
}

export function showSettings() {
  document.getElementById('settingsPanel').style.transform = 'translateY(0)'
}

export function hideSettings() {
  document.getElementById('settingsPanel').style.transform = 'translateY(-100%)'
}
```

## Styling (`styles.css`)

Create basic styles:
```css
.timer-container {
  transition: all 0.3s ease;
  cursor: pointer;
  user-select: none;
}

.timer-active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  animation: pulse 2s infinite;
}

.timer-inactive {
  background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
  opacity: 0.7;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.control-panel {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 20;
  display: flex;
  gap: 1rem;
}

.control-btn {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  font-size: 1.5rem;
  background: rgba(15, 23, 42, 0.8);
  border: none;
  cursor: pointer;
  transition: transform 0.2s;
}

.control-btn:hover {
  transform: translateY(-2px);
}

.settings-panel {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(31, 41, 55, 0.95);
  transform: translateY(-100%);
  transition: transform 0.3s ease;
  z-index: 30;
  padding: 2rem;
}
```

## Testing

Open `index.html` in browser and test:
- [ ] Timers display correctly
- [ ] Clicking timer emits event
- [ ] Controls work (pause/reset/settings)
- [ ] Settings panel slides in/out
- [ ] Time presets work
- [ ] Active/inactive states update
- [ ] Victory modal shows

## Critical Rules

❌ DON'T call game logic directly
❌ DON'T access state directly (use subscribe)
❌ DON'T touch other modules' files
✅ DO emit events for all user actions
✅ DO subscribe to state for display updates
✅ DO handle all DOM manipulation
✅ DO test in browser

You own the HTML and all user interactions!
