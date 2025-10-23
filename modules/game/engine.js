/**
 * Game Engine - Core Chess Clock Timer
 *
 * Manages the timer countdown, player switching, and game state.
 * Communicates via events and state management only.
 */

import { dispatch, get, ACTIONS } from '../../core/state.js'
import { emit, on } from '../../core/events.js'
import { CONFIG } from '../../core/config.js'
import { canPlayerSwitch, isValidTime } from './rules.js'

// Internal state
let timerInterval = null
let initialized = false
let thresholdFlags = {
  player1: { low: false, critical: false },
  player2: { low: false, critical: false }
}

/**
 * Initialize the game engine
 * Sets up event listeners and prepares the engine
 * @param {object} config - Optional config overrides (not used currently)
 */
export function init(config = {}) {
  if (initialized) {
    console.warn('[Game] Already initialized')
    return
  }

  setupEventListeners()
  initialized = true
  emit('game:initialized')

  console.log('[Game] Engine initialized')
}

/**
 * Setup event listeners for UI events
 * @private
 */
function setupEventListeners() {
  on('ui:start-clicked', handleStart)
  on('ui:pause-clicked', handlePause)
  on('ui:reset-clicked', resetGame)
  on('ui:player-clicked', handlePlayerClick)
  on('ui:time-selected', handleTimeSelected)
}

/**
 * Handle start button click
 * @private
 */
function handleStart() {
  const activePlayer = get('activePlayer')
  const isPaused = get('isPaused')

  // If game hasn't started yet, do nothing (wait for player to click their timer)
  // If game is paused, resume
  if (activePlayer !== 0 && isPaused) {
    dispatch(ACTIONS.SET_PAUSE, { paused: false })
    startTimer()
    emit('game:resumed')
  }
}

/**
 * Handle pause button click
 * Toggles pause state
 * @private
 */
function handlePause() {
  const isPaused = get('isPaused')
  const activePlayer = get('activePlayer')

  // Can only pause if game is active
  if (activePlayer === 0) return

  if (isPaused) {
    // Resume
    dispatch(ACTIONS.SET_PAUSE, { paused: false })
    startTimer()
    emit('game:resumed')
  } else {
    // Pause
    dispatch(ACTIONS.SET_PAUSE, { paused: true })
    stopTimer()
    emit('game:paused')
  }
}

/**
 * Handle player clicking their timer
 * @param {object} data - { player: 1 or 2 }
 */
export function handlePlayerClick(data) {
  const { player } = data
  const activePlayer = get('activePlayer')
  const isPaused = get('isPaused')

  // Check if player can switch (from rules.js)
  if (!canPlayerSwitch(player, activePlayer)) {
    // Invalid move - ignore silently
    return
  }

  // Ignore clicks while the clock is paused mid-game
  if (isPaused && activePlayer !== 0) {
    return
  }

  // First move - start the game
  if (activePlayer === 0) {
    dispatch(ACTIONS.SET_ACTIVE_PLAYER, { player })
    dispatch(ACTIONS.SET_PAUSE, { paused: false })
    startTimer()
    emit('game:started', { player })
    console.log(`[Game] Game started by player ${player}`)
    return
  }

  // Normal turn switch
  const newPlayer = player === 1 ? 2 : 1
  const moveNumber = get(`player${player}Moves`) + 1

  // Increment the current player's move count (they just made their move)
  dispatch(ACTIONS.INCREMENT_MOVES, { player })

  // Switch to the other player
  dispatch(ACTIONS.SET_ACTIVE_PLAYER, { player: newPlayer })

  emit('game:player-switched', {
    from: player,
    to: newPlayer,
    moveNumber
  })

  console.log(`[Game] Player ${player} switched to player ${newPlayer} (move ${moveNumber})`)
}

/**
 * Handle time selection from UI
 * @param {object} data - { seconds: number }
 */
function handleTimeSelected(data) {
  const { seconds } = data

  if (!isValidTime(seconds)) {
    console.error('[Game] Invalid time selected:', seconds)
    return
  }

  setTime(seconds)
}

/**
 * Set time for both players
 * @param {number} seconds - Time in seconds
 */
export function setTime(seconds) {
  dispatch(ACTIONS.SET_DEFAULT_TIME, { time: seconds })
  dispatch(ACTIONS.SET_TIME, { player: 1, time: seconds })
  dispatch(ACTIONS.SET_TIME, { player: 2, time: seconds })

  // Reset threshold flags
  thresholdFlags = {
    player1: { low: false, critical: false },
    player2: { low: false, critical: false }
  }

  console.log(`[Game] Time set to ${seconds} seconds`)
}

/**
 * Start the timer interval
 * Begins countdown for active player
 */
export function startTimer() {
  if (timerInterval) return // Already running

  timerInterval = setInterval(tick, 1000)
  console.log('[Game] Timer started')
}

/**
 * Stop the timer interval
 * Pauses countdown
 */
export function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
    console.log('[Game] Timer stopped')
  }
}

/**
 * Timer tick - called every second
 * Decrements active player's time and checks conditions
 * @private
 */
function tick() {
  const activePlayer = get('activePlayer')
  const isPaused = get('isPaused')

  // Don't tick if no active player or paused
  if (activePlayer === 0 || isPaused) return

  // Decrement active player's time
  dispatch(ACTIONS.DECREMENT_TIME, { player: activePlayer })

  // Get updated time from state (dispatch ensures it never goes negative)
  const timeRemaining = get(activePlayer === 1 ? 'player1Time' : 'player2Time')

  // Emit tick event
  emit('game:tick', { player: activePlayer, timeRemaining })

  // Check time thresholds
  checkTimeThresholds(activePlayer, timeRemaining)

  // Check win condition
  if (timeRemaining <= 0) {
    const winner = activePlayer === 1 ? 2 : 1
    handleVictory(winner)
  }
}

/**
 * Check if time has crossed important thresholds
 * Emits events when thresholds are crossed (only once)
 * @param {number} player - Player number
 * @param {number} timeRemaining - Seconds remaining
 * @private
 */
function checkTimeThresholds(player, timeRemaining) {
  const playerKey = `player${player}`

  // Low time threshold (60s)
  if (timeRemaining === CONFIG.LOW_TIME_THRESHOLD && !thresholdFlags[playerKey].low) {
    thresholdFlags[playerKey].low = true
    emit('game:low-time', { player, timeRemaining })
    console.log(`[Game] Player ${player} reached low time (${timeRemaining}s)`)
  }

  // Critical threshold (10s)
  if (timeRemaining === CONFIG.CRITICAL_THRESHOLD && !thresholdFlags[playerKey].critical) {
    thresholdFlags[playerKey].critical = true
    emit('game:critical-time', { player, timeRemaining })
    console.log(`[Game] Player ${player} reached critical time (${timeRemaining}s)`)
  }
}

/**
 * Handle victory condition
 * @param {number} winner - Winning player (1 or 2)
 * @private
 */
function handleVictory(winner) {
  stopTimer()

  const loser = winner === 1 ? 2 : 1
  const winnerTimeRemaining = get(`player${winner}Time`)

  // Freeze the clock and clear active player before notifying modules
  dispatch(ACTIONS.SET_PAUSE, { paused: true })
  dispatch(ACTIONS.SET_ACTIVE_PLAYER, { player: 0 })

  emit('game:victory', {
    winner,
    loser,
    winnerTimeRemaining
  })

  console.log(`[Game] Victory! Player ${winner} wins with ${winnerTimeRemaining}s remaining`)
}

/**
 * Reset the game to initial state
 */
export function resetGame() {
  stopTimer()

  // Reset state via action
  dispatch(ACTIONS.RESET_GAME)

  // Reset threshold flags
  thresholdFlags = {
    player1: { low: false, critical: false },
    player2: { low: false, critical: false }
  }

  emit('game:reset')

  console.log('[Game] Game reset')
}

/**
 * Get current game status
 * @returns {object} Status info
 */
export function getStatus() {
  return {
    initialized,
    running: timerInterval !== null,
    activePlayer: get('activePlayer'),
    isPaused: get('isPaused'),
    player1Time: get('player1Time'),
    player2Time: get('player2Time'),
    player1Moves: get('player1Moves'),
    player2Moves: get('player2Moves')
  }
}
