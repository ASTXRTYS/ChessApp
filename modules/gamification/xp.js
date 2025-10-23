/**
 * XP System Module
 *
 * Manages XP earning and leveling.
 * Levels are calculated at 100 XP per level.
 */

import { emit } from '../../core/events.js'
import { dispatch, get, subscribe, ACTIONS } from '../../core/state.js'
import { CONFIG } from '../../core/config.js'

let initialized = false

/**
 * Initialize XP system
 */
export function init() {
  if (initialized) return

  // Subscribe to level changes
  subscribe('level', (newLevel, oldLevel) => {
    if (newLevel > oldLevel) {
      emit('gamification:level-up', {
        level: newLevel,
        xp: get('totalXP')
      })
      console.log(`[XP] Level Up! You are now level ${newLevel}`)
    }
  })

  initialized = true
  console.log('[XP] Initialized')
}

/**
 * Calculate XP earned from a match
 * @param {object} matchStats - Match statistics
 * @returns {number} XP earned
 */
export function calculateMatchXP(matchStats) {
  let xp = CONFIG.XP_PER_GAME  // Base XP (10)

  // Bonus for fast average move time (under 5 seconds)
  if (matchStats.avgMoveTime > 0 && matchStats.avgMoveTime < 5) {
    xp += 10
  }

  // Bonus for long game (30+ moves)
  if (matchStats.moves.length > 30) {
    xp += 5
  }

  return xp
}

/**
 * Add XP to player's total
 * @param {number} amount - XP to add
 * @param {string} reason - Why XP was awarded
 */
export function addXP(amount, reason = 'unknown') {
  dispatch(ACTIONS.ADD_XP, { amount })

  emit('gamification:xp-gained', {
    amount,
    reason
  })

  console.log(`[XP] +${amount} XP (${reason})`)
}

/**
 * Get current level
 * @returns {number} Current level
 */
export function getLevel() {
  return get('level')
}

/**
 * Get XP needed for next level
 * @returns {number} XP threshold for next level
 */
export function getXPForNextLevel() {
  const currentLevel = get('level')
  return currentLevel * CONFIG.XP_PER_LEVEL
}

/**
 * Get progress toward next level (0-1)
 * @returns {number} Progress as decimal (0.0 to 1.0)
 */
export function getLevelProgress() {
  const totalXP = get('totalXP')
  const currentLevel = get('level')
  const xpForCurrentLevel = (currentLevel - 1) * CONFIG.XP_PER_LEVEL
  const xpForNextLevel = currentLevel * CONFIG.XP_PER_LEVEL
  const xpInCurrentLevel = totalXP - xpForCurrentLevel

  return xpInCurrentLevel / CONFIG.XP_PER_LEVEL
}

/**
 * Get total XP earned
 * @returns {number} Total XP
 */
export function getTotalXP() {
  return get('totalXP')
}
