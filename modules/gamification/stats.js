/**
 * Stats Tracking Module
 *
 * Tracks match statistics and all-time player stats.
 * Records move times, averages, and performance metrics.
 */

import { emit, on } from '../../core/events.js'
import { dispatch, get, ACTIONS } from '../../core/state.js'
import { CONFIG } from '../../core/config.js'

let matchStartTime = null
let lastMoveTime = null
let initialized = false

/**
 * Initialize stats tracking
 */
export function init() {
  if (initialized) return

  setupEventListeners()
  initialized = true
  console.log('[Stats] Initialized')
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  on('game:started', startMatch)
  on('game:player-switched', handlePlayerSwitch)
  on('game:victory', handleVictory)
}

/**
 * Start tracking a new match
 */
export function startMatch() {
  matchStartTime = Date.now()
  lastMoveTime = Date.now()

  dispatch(ACTIONS.UPDATE_MATCH_STATS, {
    startTime: matchStartTime,
    moves: [],
    avgMoveTime: 0,
    longestThink: 0,
    fastestMove: 0
  })

  console.log('[Stats] Match started')
}

/**
 * Record a move
 * @param {number} player - Player number (1 or 2)
 * @param {number} timeRemaining - Time left on player's clock
 */
export function recordMove(player, timeRemaining) {
  const moveTime = Date.now()
  const timeTaken = (moveTime - lastMoveTime) / 1000 // Convert to seconds

  lastMoveTime = moveTime

  const currentStats = get('currentMatchStats')
  const moves = [...currentStats.moves, {
    player,
    time: timeTaken,
    timeRemaining,
    timestamp: moveTime
  }]

  // Calculate stats (skip first move as it's the game start)
  const validMoves = moves.slice(1).filter(m => m.time > 0)

  const avgMoveTime = validMoves.length > 0
    ? validMoves.reduce((sum, m) => sum + m.time, 0) / validMoves.length
    : 0

  const longestThink = validMoves.length > 0
    ? Math.max(...validMoves.map(m => m.time))
    : 0

  const fastestMove = validMoves.length > 0
    ? Math.min(...validMoves.map(m => m.time))
    : 0

  dispatch(ACTIONS.UPDATE_MATCH_STATS, {
    moves,
    avgMoveTime,
    longestThink,
    fastestMove
  })
}

/**
 * Handle player switch event
 */
function handlePlayerSwitch(data) {
  const timeRemaining = get(`player${data.from}Time`)
  recordMove(data.from, timeRemaining)
}

/**
 * Handle victory event
 */
function handleVictory(data) {
  const matchStats = getMatchStats()
  emit('gamification:stats-updated', { matchStats })

  // Update all-time stats for both players
  const player1 = get('selectedPlayer1')
  const player2 = get('selectedPlayer2')

  if (player1) {
    updateAllTimeStats(player1.id, matchStats, data.winner === 1)
  }
  if (player2) {
    updateAllTimeStats(player2.id, matchStats, data.winner === 2)
  }

  console.log('[Stats] Match ended', matchStats)
}

/**
 * Get current match statistics
 * @returns {object} Match stats
 */
export function getMatchStats() {
  return get('currentMatchStats')
}

/**
 * Get all-time stats for a profile
 * @param {number} profileId - Profile ID
 * @returns {object} All-time stats
 */
export function getAllTimeStats(profileId) {
  const storageData = JSON.parse(localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY) || '{}')
  const profile = storageData.profiles?.find(p => p.id === profileId)

  return profile?.stats || {
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    totalMoves: 0,
    totalPlayTime: 0,
    bestAvgMoveTime: Infinity,
    fastestMove: Infinity
  }
}

/**
 * Update all-time stats for a profile
 * @param {number} profileId - Profile ID
 * @param {object} matchStats - Current match statistics
 * @param {boolean} won - Whether the player won
 */
export function updateAllTimeStats(profileId, matchStats, won) {
  const allTimeStats = getAllTimeStats(profileId)

  // Update counters
  allTimeStats.gamesPlayed++
  if (won) {
    allTimeStats.wins++
  } else {
    allTimeStats.losses++
  }

  // Update totals
  allTimeStats.totalMoves += matchStats.moves.length
  const matchDuration = (Date.now() - matchStats.startTime) / 1000
  allTimeStats.totalPlayTime += matchDuration

  // Update bests
  if (matchStats.avgMoveTime > 0) {
    if (allTimeStats.bestAvgMoveTime === Infinity || matchStats.avgMoveTime < allTimeStats.bestAvgMoveTime) {
      allTimeStats.bestAvgMoveTime = matchStats.avgMoveTime
    }
  }

  if (matchStats.fastestMove > 0) {
    if (allTimeStats.fastestMove === Infinity || matchStats.fastestMove < allTimeStats.fastestMove) {
      allTimeStats.fastestMove = matchStats.fastestMove
    }
  }

  // Save back to localStorage
  const storageData = JSON.parse(localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY) || '{}')
  if (!storageData.profiles) storageData.profiles = []

  const profileIndex = storageData.profiles.findIndex(p => p.id === profileId)
  if (profileIndex >= 0) {
    storageData.profiles[profileIndex].stats = allTimeStats
    localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY, JSON.stringify(storageData))
    console.log(`[Stats] Updated all-time stats for profile ${profileId}`)
  }
}

/**
 * End match and return stats
 * @param {number} winner - Winner player number
 * @param {number} loser - Loser player number
 * @returns {object} Final match stats
 */
export function endMatch(winner, loser) {
  const matchStats = getMatchStats()
  return matchStats
}
