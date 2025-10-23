# Game Module

**Owner**: Game-Engine-Dev Agent
**Responsibility**: Core chess clock logic - timer mechanics, rules, win conditions

## Your Files

You OWN and can ONLY modify these files:
- `modules/game/engine.js`
- `modules/game/rules.js`

## What You're Building

A rock-solid timer engine that:
1. Manages player times (counts down every second)
2. Enforces chess clock rules (only active player can switch)
3. Detects win conditions (time runs out)
4. Tracks move counts
5. Handles pause/resume/reset

## Public API

Create these functions in `engine.js`:

```javascript
/**
 * Initialize the game engine
 * @param {object} config - Optional config overrides
 */
export function init(config = {})

/**
 * Start the timer (begins countdown)
 */
export function startTimer()

/**
 * Stop the timer (pauses countdown)
 */
export function stopTimer()

/**
 * Handle player clicking their timer
 * @param {number} player - 1 or 2
 */
export function handlePlayerClick(player)

/**
 * Reset game to default state
 */
export function resetGame()

/**
 * Set time for both players
 * @param {number} seconds - Time in seconds
 */
export function setTime(seconds)
```

## State You Update

Via `dispatch()` from `../../core/state.js`:

- `player1Time`, `player2Time` - Current time (decrement each second)
- `player1Moves`, `player2Moves` - Move counter (increment on switch)
- `activePlayer` - Who's turn it is (0, 1, or 2)
- `isPaused` - Game paused state

## Events You Emit

```javascript
import { emit } from '../../core/events.js'

// When initialized
emit('game:initialized')

// When game starts (first player clicks)
emit('game:started', { player: 1 })

// Every second while running
emit('game:tick', { player: activePlayer, timeRemaining: time })

// When player switches
emit('game:player-switched', { from: 1, to: 2, moveNumber: 5 })

// Time thresholds
emit('game:low-time', { player: 1, timeRemaining: 45 })
emit('game:critical-time', { player: 1, timeRemaining: 8 })

// Game over
emit('game:victory', { winner: 2, loser: 1, winnerTimeRemaining: 120 })

// Pause/resume
emit('game:paused')
emit('game:resumed')

// Reset
emit('game:reset')
```

## Events You Listen To

```javascript
import { on } from '../../core/events.js'

// From UI module
on('ui:start-clicked', () => { /* Start game */ })
on('ui:pause-clicked', () => { /* Toggle pause */ })
on('ui:reset-clicked', () => { /* Reset */ })
on('ui:player-clicked', (data) => { /* Handle player click */ })
on('ui:time-selected', (data) => { /* Set new time */ })
```

## Implementation Guide

### 1. Setup (`engine.js`)

```javascript
import { dispatch, subscribe, get, ACTIONS } from '../../core/state.js'
import { emit, on } from '../../core/events.js'
import { CONFIG } from '../../core/config.js'
import { canPlayerSwitch } from './rules.js'

let timerInterval = null
let initialized = false

export function init(config = {}) {
  if (initialized) return

  setupEventListeners()
  initialized = true
  emit('game:initialized')
}

function setupEventListeners() {
  on('ui:start-clicked', handleStart)
  on('ui:pause-clicked', handlePause)
  on('ui:reset-clicked', resetGame)
  on('ui:player-clicked', handlePlayerClick)
  on('ui:time-selected', handleTimeSelected)
}
```

### 2. Timer Logic

```javascript
function tick() {
  const activePlayer = get('activePlayer')
  const player1Time = get('player1Time')
  const player2Time = get('player2Time')

  if (activePlayer === 0) return

  // Decrement time
  dispatch(ACTIONS.DECREMENT_TIME, { player: activePlayer })

  // Get updated time
  const timeRemaining = activePlayer === 1 ? player1Time - 1 : player2Time - 1

  // Emit tick event
  emit('game:tick', { player: activePlayer, timeRemaining })

  // Check thresholds
  checkTimeThresholds(activePlayer, timeRemaining)

  // Check win condition
  if (timeRemaining <= 0) {
    const winner = activePlayer === 1 ? 2 : 1
    handleVictory(winner)
  }
}

export function startTimer() {
  if (timerInterval) return
  timerInterval = setInterval(tick, 1000)
}

export function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}
```

### 3. Rules (`rules.js`)

```javascript
/**
 * Check if player can click their timer
 * @param {number} player - Player number (1 or 2)
 * @param {number} activePlayer - Currently active player
 * @returns {boolean} - Can switch
 */
export function canPlayerSwitch(player, activePlayer) {
  // First move: either player can start
  if (activePlayer === 0) return true

  // Only active player can click to switch
  return activePlayer === player
}

/**
 * Check if game is over
 * @param {number} player1Time
 * @param {number} player2Time
 * @returns {object|null} - { winner, loser } or null
 */
export function checkGameOver(player1Time, player2Time) {
  if (player1Time <= 0) return { winner: 2, loser: 1 }
  if (player2Time <= 0) return { winner: 1, loser: 2 }
  return null
}
```

### 4. Player Switching

```javascript
export function handlePlayerClick(data) {
  const { player } = data
  const activePlayer = get('activePlayer')
  const player1Time = get('player1Time')
  const player2Time = get('player2Time')

  // Check if player can switch (from rules.js)
  if (!canPlayerSwitch(player, activePlayer)) {
    return  // Invalid move, do nothing
  }

  // First move - start game
  if (activePlayer === 0) {
    dispatch(ACTIONS.SET_ACTIVE_PLAYER, { player })
    dispatch(ACTIONS.SET_PAUSE, { paused: false })
    startTimer()
    emit('game:started', { player })
    return
  }

  // Switch turn
  const newPlayer = player === 1 ? 2 : 1
  const moveNumber = get(`player${player}Moves`) + 1

  dispatch(ACTIONS.INCREMENT_MOVES, { player })
  dispatch(ACTIONS.SET_ACTIVE_PLAYER, { player: newPlayer })

  emit('game:player-switched', {
    from: player,
    to: newPlayer,
    moveNumber
  })
}
```

### 5. Threshold Checking

```javascript
function checkTimeThresholds(player, timeRemaining) {
  // Only emit once per threshold
  if (timeRemaining === CONFIG.LOW_TIME_THRESHOLD) {
    emit('game:low-time', { player, timeRemaining })
  }
  if (timeRemaining === CONFIG.CRITICAL_THRESHOLD) {
    emit('game:critical-time', { player, timeRemaining })
  }
}
```

## Testing

Create `modules/game/test.html`:

```html
<!DOCTYPE html>
<html>
<head><title>Game Module Test</title></head>
<body>
  <h1>Game Module Test</h1>
  <div id="output"></div>
  <script type="module">
    import { init, startTimer, handlePlayerClick, setTime } from './engine.js'
    import { on } from '../../core/events.js'
    import { subscribe } from '../../core/state.js'

    const output = document.getElementById('output')

    // Log events
    on('*', (data) => {
      output.innerHTML += `<p>Event: ${JSON.stringify(data)}</p>`
    })

    // Log state changes
    subscribe('*', (value, key) => {
      output.innerHTML += `<p>State: ${key} = ${value}</p>`
    })

    // Test: Start with 5 seconds, play a few moves
    init()
    setTime(5)
    handlePlayerClick({ player: 1 })  // Start
    setTimeout(() => handlePlayerClick({ player: 1 }), 2000)  // Switch
    setTimeout(() => handlePlayerClick({ player: 2 }), 4000)  // Switch back
  </script>
</body>
</html>
```

## Completion Checklist

- [ ] `engine.js` exports all required functions
- [ ] Timer counts down every second
- [ ] Player switching works correctly
- [ ] Move counter increments
- [ ] Win detection works (time = 0)
- [ ] All events are emitted at right times
- [ ] All UI events are handled
- [ ] Rules are enforced (can't click opponent's timer)
- [ ] Pause/resume works
- [ ] Reset works
- [ ] Test file passes

## Critical Rules

❌ DON'T touch files outside `modules/game/`
❌ DON'T directly modify DOM
❌ DON'T import from other modules (except core/)
✅ DO use state for all data
✅ DO emit events for all actions
✅ DO handle errors gracefully
✅ DO test thoroughly

Need help? Check `ARCHITECTURE.md` or `CLAUDE.md`
