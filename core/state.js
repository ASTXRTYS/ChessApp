/**
 * State Management - Single Source of Truth
 *
 * This module manages all application state. All modules read from here
 * and update via dispatch actions. Subscribers are notified of changes.
 */

// Initial state shape
const initialState = {
  // Game state
  player1Time: 300,
  player2Time: 300,
  player1Moves: 0,
  player2Moves: 0,
  activePlayer: 0,  // 0 = none, 1 = player1, 2 = player2
  isPaused: true,
  defaultTime: 300,

  // Player profiles
  selectedPlayer1: null,
  selectedPlayer2: null,

  // Settings
  ambientMode: 'classic',  // Start with 2D classic mode
  audioEnabled: true,
  particlesEnabled: true,
  endgameBoostEnabled: true,

  // Visual settings
  player1Palette: 'royal',
  player2Palette: 'royal',

  // Gamification
  currentMatchStats: {
    startTime: null,
    moves: [],
    avgMoveTime: 0,
    longestThink: 0,
    fastestMove: 0
  },

  // Achievements
  unlockedAchievements: [],
  totalXP: 0,
  level: 1
}

// Current state (mutable, but only internally)
let state = { ...initialState }

// Subscribers: { key: [callback1, callback2, ...] }
const subscribers = {}

// Action types
export const ACTIONS = {
  SET_TIME: 'SET_TIME',
  DECREMENT_TIME: 'DECREMENT_TIME',
  SET_ACTIVE_PLAYER: 'SET_ACTIVE_PLAYER',
  INCREMENT_MOVES: 'INCREMENT_MOVES',
  TOGGLE_PAUSE: 'TOGGLE_PAUSE',
  SET_PAUSE: 'SET_PAUSE',
  RESET_GAME: 'RESET_GAME',
  SELECT_PLAYER: 'SELECT_PLAYER',
  UPDATE_SETTING: 'UPDATE_SETTING',
  ADD_ACHIEVEMENT: 'ADD_ACHIEVEMENT',
  ADD_XP: 'ADD_XP',
  UPDATE_MATCH_STATS: 'UPDATE_MATCH_STATS',
  SET_DEFAULT_TIME: 'SET_DEFAULT_TIME'
}

/**
 * Get entire state (read-only copy)
 */
export function getState() {
  return { ...state }
}

/**
 * Get specific state value
 * @param {string} key - State key
 */
export function get(key) {
  return state[key]
}

/**
 * Update state via action dispatch
 * @param {string} action - Action type from ACTIONS
 * @param {object} payload - Action payload
 */
export function dispatch(action, payload = {}) {
  const prevState = { ...state }

  switch (action) {
    case ACTIONS.SET_TIME:
      if (payload.player === 1) {
        state.player1Time = payload.time
        notify('player1Time', state.player1Time, prevState.player1Time)
      } else if (payload.player === 2) {
        state.player2Time = payload.time
        notify('player2Time', state.player2Time, prevState.player2Time)
      }
      break

    case ACTIONS.DECREMENT_TIME:
      if (payload.player === 1 && state.player1Time > 0) {
        state.player1Time--
        notify('player1Time', state.player1Time, prevState.player1Time)
      } else if (payload.player === 2 && state.player2Time > 0) {
        state.player2Time--
        notify('player2Time', state.player2Time, prevState.player2Time)
      }
      break

    case ACTIONS.SET_ACTIVE_PLAYER:
      state.activePlayer = payload.player
      notify('activePlayer', state.activePlayer, prevState.activePlayer)
      break

    case ACTIONS.INCREMENT_MOVES:
      if (payload.player === 1) {
        state.player1Moves++
        notify('player1Moves', state.player1Moves, prevState.player1Moves)
      } else if (payload.player === 2) {
        state.player2Moves++
        notify('player2Moves', state.player2Moves, prevState.player2Moves)
      }
      break

    case ACTIONS.TOGGLE_PAUSE:
      state.isPaused = !state.isPaused
      notify('isPaused', state.isPaused, prevState.isPaused)
      break

    case ACTIONS.SET_PAUSE:
      state.isPaused = payload.paused
      notify('isPaused', state.isPaused, prevState.isPaused)
      break

    case ACTIONS.RESET_GAME:
      state.player1Time = state.defaultTime
      state.player2Time = state.defaultTime
      state.player1Moves = 0
      state.player2Moves = 0
      state.activePlayer = 0
      state.isPaused = true
      state.currentMatchStats = {
        startTime: null,
        moves: [],
        avgMoveTime: 0,
        longestThink: 0,
        fastestMove: 0
      }
      // Notify all game-related changes
      notify('player1Time', state.player1Time, prevState.player1Time)
      notify('player2Time', state.player2Time, prevState.player2Time)
      notify('player1Moves', state.player1Moves, prevState.player1Moves)
      notify('player2Moves', state.player2Moves, prevState.player2Moves)
      notify('activePlayer', state.activePlayer, prevState.activePlayer)
      notify('isPaused', state.isPaused, prevState.isPaused)
      break

    case ACTIONS.SELECT_PLAYER:
      if (payload.playerNum === 1) {
        state.selectedPlayer1 = payload.profile
        notify('selectedPlayer1', state.selectedPlayer1, prevState.selectedPlayer1)
      } else if (payload.playerNum === 2) {
        state.selectedPlayer2 = payload.profile
        notify('selectedPlayer2', state.selectedPlayer2, prevState.selectedPlayer2)
      }
      break

    case ACTIONS.UPDATE_SETTING:
      if (state.hasOwnProperty(payload.key)) {
        state[payload.key] = payload.value
        notify(payload.key, state[payload.key], prevState[payload.key])
      }
      break

    case ACTIONS.ADD_ACHIEVEMENT:
      if (!state.unlockedAchievements.includes(payload.achievementId)) {
        state.unlockedAchievements.push(payload.achievementId)
        notify('unlockedAchievements', state.unlockedAchievements, prevState.unlockedAchievements)
      }
      break

    case ACTIONS.ADD_XP:
      state.totalXP += payload.amount
      // Check for level up (simple: 100 XP per level)
      const newLevel = Math.floor(state.totalXP / 100) + 1
      if (newLevel > state.level) {
        state.level = newLevel
        notify('level', state.level, prevState.level)
      }
      notify('totalXP', state.totalXP, prevState.totalXP)
      break

    case ACTIONS.UPDATE_MATCH_STATS:
      state.currentMatchStats = { ...state.currentMatchStats, ...payload }
      notify('currentMatchStats', state.currentMatchStats, prevState.currentMatchStats)
      break

    case ACTIONS.SET_DEFAULT_TIME:
      state.defaultTime = payload.time
      notify('defaultTime', state.defaultTime, prevState.defaultTime)
      break

    default:
      console.warn(`[State] Unknown action: ${action}`)
  }

  // Notify wildcard subscribers
  notify('*', state, prevState)
}

/**
 * Subscribe to state changes
 * @param {string} key - State key or '*' for all changes
 * @param {function} callback - Called with (newValue, oldValue)
 */
export function subscribe(key, callback) {
  if (!subscribers[key]) {
    subscribers[key] = []
  }
  subscribers[key].push(callback)

  // Return unsubscribe function
  return () => unsubscribe(key, callback)
}

/**
 * Unsubscribe from state changes
 * @param {string} key - State key
 * @param {function} callback - Callback to remove
 */
export function unsubscribe(key, callback) {
  if (subscribers[key]) {
    subscribers[key] = subscribers[key].filter(cb => cb !== callback)
  }
}

/**
 * Notify subscribers of state change
 * @private
 */
function notify(key, newValue, oldValue) {
  if (subscribers[key]) {
    subscribers[key].forEach(callback => {
      try {
        callback(newValue, oldValue)
      } catch (error) {
        console.error(`[State] Subscriber error for key "${key}":`, error)
      }
    })
  }
}

/**
 * Reset state to initial values
 */
export function resetState() {
  const prevState = { ...state }
  state = { ...initialState }
  // Notify all subscribers
  Object.keys(state).forEach(key => {
    if (state[key] !== prevState[key]) {
      notify(key, state[key], prevState[key])
    }
  })
  notify('*', state, prevState)
}

/**
 * Debug: Log current state
 */
export function debugState() {
  console.log('[State] Current state:', state)
  console.log('[State] Subscribers:', Object.keys(subscribers))
}
