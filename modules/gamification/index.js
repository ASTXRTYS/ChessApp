/**
 * Gamification Module - Public API
 *
 * Achievement system, XP, leveling, and stats tracking.
 * This is the main entry point for the gamification module.
 */

import * as achievements from './achievements.js'
import * as xp from './xp.js'
import * as stats from './stats.js'

/**
 * Initialize the entire gamification module
 */
export function init() {
  achievements.init()
  xp.init()
  stats.init()
  console.log('[Gamification] Module initialized')
}

// Re-export all public APIs
export {
  // Achievements
  achievements,

  // XP
  xp,

  // Stats
  stats
}

// Convenience exports for common functions
export const {
  checkAchievements,
  unlockAchievement,
  getUnlockedAchievements,
  getAchievementProgress
} = achievements

export const {
  calculateMatchXP,
  addXP,
  getLevel,
  getXPForNextLevel,
  getLevelProgress,
  getTotalXP
} = xp

export const {
  startMatch,
  recordMove,
  endMatch,
  getMatchStats,
  getAllTimeStats,
  updateAllTimeStats
} = stats
