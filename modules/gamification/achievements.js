/**
 * Achievements Module
 *
 * Checks gameplay conditions and unlocks achievements.
 * Awards XP for each achievement unlocked.
 */

import { emit, on } from '../../core/events.js'
import { dispatch, get, ACTIONS } from '../../core/state.js'
import { CONFIG } from '../../core/config.js'

let initialized = false

/**
 * Initialize achievements system
 */
export function init() {
  if (initialized) return

  setupEventListeners()
  initialized = true
  console.log('[Achievements] Initialized')
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  on('game:victory', handleVictory)
}

/**
 * Handle victory event - check all achievements
 */
function handleVictory(data) {
  const matchStats = get('currentMatchStats')
  checkAchievements(matchStats, data)
}

/**
 * Check if any achievements were unlocked
 * @param {object} matchStats - Match statistics
 * @param {object} gameData - Game end data (winner, loser, times)
 * @returns {Array<string>} Array of newly unlocked achievement IDs
 */
export function checkAchievements(matchStats, gameData) {
  const unlocked = get('unlockedAchievements')
  const newAchievements = []

  // Get all-time stats from localStorage for century achievement
  const storageData = JSON.parse(localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY) || '{}')
  const totalGames = storageData.profiles?.reduce((sum, p) => sum + (p.stats?.gamesPlayed || 0), 0) || 0

  // 1. First Blood - Play first game
  if (!unlocked.includes('first-blood')) {
    unlockAchievement('first-blood')
    newAchievements.push('first-blood')
  }

  // 2. Lightning Reflexes - 10 moves under 3 seconds
  const fastMoves = matchStats.moves.filter(m => m.time > 0 && m.time < 3).length
  if (fastMoves >= 10 && !unlocked.includes('lightning-reflexes')) {
    unlockAchievement('lightning-reflexes')
    newAchievements.push('lightning-reflexes')
  }

  // 3. Time Bandit - Win with 2+ minutes remaining
  if (gameData.winnerTimeRemaining >= 120 && !unlocked.includes('time-bandit')) {
    unlockAchievement('time-bandit')
    newAchievements.push('time-bandit')
  }

  // 4. Comeback King - Win after being down to 10 seconds
  const winnerMoves = matchStats.moves.filter(m => m.player === gameData.winner)
  const minWinnerTime = winnerMoves.length > 0
    ? Math.min(...winnerMoves.map(m => m.timeRemaining))
    : Infinity
  if (minWinnerTime <= 10 && !unlocked.includes('comeback-king')) {
    unlockAchievement('comeback-king')
    newAchievements.push('comeback-king')
  }

  // 5. Marathon Master - 50+ moves
  if (matchStats.moves.length >= 50 && !unlocked.includes('marathon-master')) {
    unlockAchievement('marathon-master')
    newAchievements.push('marathon-master')
  }

  // 6. Zen Master - No move over 10 seconds
  const validMoves = matchStats.moves.filter(m => m.time > 0)
  const allMovesUnder10 = validMoves.length > 0 && validMoves.every(m => m.time <= 10)
  if (allMovesUnder10 && !unlocked.includes('zen-master')) {
    unlockAchievement('zen-master')
    newAchievements.push('zen-master')
  }

  // 7. Speed Demon - Average move time under 5 seconds
  if (matchStats.avgMoveTime > 0 && matchStats.avgMoveTime < 5 && !unlocked.includes('speed-demon')) {
    unlockAchievement('speed-demon')
    newAchievements.push('speed-demon')
  }

  // 8. Century Club - Play 100 games
  if (totalGames >= 100 && !unlocked.includes('century')) {
    unlockAchievement('century')
    newAchievements.push('century')
  }

  return newAchievements
}

/**
 * Unlock an achievement
 * @param {string} achievementId - Achievement ID from CONFIG.ACHIEVEMENTS
 */
export function unlockAchievement(achievementId) {
  const achievement = CONFIG.ACHIEVEMENTS.find(a => a.id === achievementId)
  if (!achievement) {
    console.warn(`[Achievements] Achievement not found: ${achievementId}`)
    return
  }

  // Update state
  dispatch(ACTIONS.ADD_ACHIEVEMENT, { achievementId })

  // Award XP
  dispatch(ACTIONS.ADD_XP, { amount: achievement.xp })

  // Emit event for UI to show notification
  emit('gamification:achievement-unlocked', { achievement })

  console.log(`[Achievements] Unlocked: ${achievement.name} (+${achievement.xp} XP)`)
}

/**
 * Get all unlocked achievements
 * @returns {Array<string>} Array of achievement IDs
 */
export function getUnlockedAchievements() {
  return get('unlockedAchievements')
}

/**
 * Get achievement progress
 * @returns {object} Progress stats
 */
export function getAchievementProgress() {
  const unlocked = get('unlockedAchievements')
  const total = CONFIG.ACHIEVEMENTS.length
  return {
    unlocked: unlocked.length,
    total,
    percentage: Math.round((unlocked.length / total) * 100)
  }
}
