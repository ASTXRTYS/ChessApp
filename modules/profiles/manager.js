/**
 * Profile Manager - Player Profile CRUD Operations
 *
 * Manages player profiles with stats tracking, achievements,
 * and localStorage persistence.
 */

import { emit, on } from '../../core/events.js'
import { dispatch, get, ACTIONS } from '../../core/state.js'
import { save, load } from './storage.js'
import { CONFIG } from '../../core/config.js'

let profiles = []
let initialized = false

/**
 * Initialize the profiles module
 */
export function init() {
  if (initialized) return

  loadProfiles()
  setupEventListeners()

  initialized = true
}

/**
 * Setup event listeners for profile-related events
 * @private
 */
function setupEventListeners() {
  on('ui:profile-selected', handleProfileSelected)
  on('game:victory', handleVictory)
  on('gamification:achievement-unlocked', handleAchievementUnlocked)
}

/**
 * Load profiles from localStorage
 * If none exist, create default profiles
 * @returns {Array} Array of profiles
 */
export function loadProfiles() {
  profiles = load('profiles') || []

  if (profiles.length === 0) {
    // Create default profiles with unique palettes
    profiles = [
      { id: 1, name: 'Jason', palette: 'royal' },
      { id: 2, name: 'Anthony', palette: 'forest' },
      { id: 3, name: 'TaTa', palette: 'sunset' },
      { id: 4, name: 'Papi', palette: 'ocean' },
      { id: 5, name: 'Mama', palette: 'ember' }
    ]

    // Initialize stats for each profile
    profiles.forEach(profile => {
      profile.stats = {
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        totalXP: 0,
        achievements: []
      }
      profile.createdAt = Date.now()
      profile.updatedAt = Date.now()
    })

    saveProfiles()
  }

  emit('profiles:loaded', { profiles })
  return profiles
}

/**
 * Save profiles to localStorage
 * @private
 */
function saveProfiles() {
  save('profiles', profiles)
}

/**
 * Create a new profile
 * @param {string} name - Profile name
 * @returns {object} Created profile
 */
export function createProfile(name) {
  if (!name || name.trim().length === 0) {
    console.error('[Profiles] Cannot create profile with empty name')
    return null
  }

  const newId = profiles.length > 0
    ? Math.max(...profiles.map(p => p.id)) + 1
    : 1

  const profile = {
    id: newId,
    name: name.trim(),
    palette: 'royal',  // Default palette
    stats: {
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      totalXP: 0,
      achievements: []
    },
    createdAt: Date.now(),
    updatedAt: Date.now()
  }

  profiles.push(profile)
  saveProfiles()

  emit('profiles:created', { profile })
  return profile
}

/**
 * Delete a profile
 * @param {number} id - Profile ID
 * @returns {boolean} Success status
 */
export function deleteProfile(id) {
  const profileExists = profiles.some(p => p.id === id)
  if (!profileExists) {
    console.error('[Profiles] Cannot delete non-existent profile:', id)
    return false
  }

  profiles = profiles.filter(p => p.id !== id)
  saveProfiles()

  // Clear selection if this profile was selected
  const player1 = get('selectedPlayer1')
  const player2 = get('selectedPlayer2')

  if (player1 && player1.id === id) {
    dispatch(ACTIONS.SELECT_PLAYER, { playerNum: 1, profile: null })
  }
  if (player2 && player2.id === id) {
    dispatch(ACTIONS.SELECT_PLAYER, { playerNum: 2, profile: null })
  }

  emit('profiles:deleted', { id })
  return true
}

/**
 * Update a profile
 * @param {number} id - Profile ID
 * @param {object} data - Fields to update
 * @returns {object|null} Updated profile or null
 */
export function updateProfile(id, data) {
  const profile = profiles.find(p => p.id === id)
  if (!profile) {
    console.error('[Profiles] Cannot update non-existent profile:', id)
    return null
  }

  Object.assign(profile, data)
  profile.updatedAt = Date.now()

  saveProfiles()

  emit('profiles:updated', { profile })
  return profile
}

/**
 * Get a profile by ID
 * @param {number} id - Profile ID
 * @returns {object|null} Profile or null
 */
export function getProfile(id) {
  return profiles.find(p => p.id === id) || null
}

/**
 * Get all profiles
 * @returns {Array} All profiles (copy)
 */
export function getAllProfiles() {
  return [...profiles]
}

/**
 * Select a profile for a player
 * @param {number} playerNum - 1 or 2
 * @param {number|null} profileId - Profile ID or null to deselect
 */
export function selectPlayer(playerNum, profileId) {
  if (playerNum !== 1 && playerNum !== 2) {
    console.error('[Profiles] Invalid player number:', playerNum)
    return
  }

  const profile = profileId ? getProfile(profileId) : null

  dispatch(ACTIONS.SELECT_PLAYER, { playerNum, profile })

  // Apply profile's color palette
  if (profile && profile.palette) {
    dispatch(ACTIONS.UPDATE_SETTING, {
      key: `player${playerNum}Palette`,
      value: profile.palette
    })
  }

  emit('profiles:selected', { playerNum, profile })
}

/**
 * Handle game victory event
 * Updates win/loss records for both players
 * @private
 */
function handleVictory(data) {
  const player1 = get('selectedPlayer1')
  const player2 = get('selectedPlayer2')

  if (!player1 && !player2) {
    // No profiles selected, nothing to update
    return
  }

  // Update winner's stats
  if (data.winner === 1 && player1) {
    updateProfileStats(player1.id, { wins: 1, gamesPlayed: 1 })
  } else if (data.winner === 2 && player2) {
    updateProfileStats(player2.id, { wins: 1, gamesPlayed: 1 })
  }

  // Update loser's stats
  const loser = data.winner === 1 ? player2 : player1
  if (loser) {
    updateProfileStats(loser.id, { losses: 1, gamesPlayed: 1 })
  }
}

/**
 * Handle achievement unlocked event
 * Adds achievement to current players' profiles
 * @private
 */
function handleAchievementUnlocked(data) {
  const player1 = get('selectedPlayer1')
  const player2 = get('selectedPlayer2')

  if (!data || !data.achievement || !data.achievement.id) {
    console.error('[Profiles] Invalid achievement data:', data)
    return
  }

  // Add achievement to both active players
  if (player1) {
    addAchievementToProfile(player1.id, data.achievement.id)
  }
  if (player2) {
    addAchievementToProfile(player2.id, data.achievement.id)
  }
}

/**
 * Handle profile selection from UI
 * @private
 */
function handleProfileSelected(data) {
  if (!data || !data.playerNum) {
    console.error('[Profiles] Invalid profile selection data:', data)
    return
  }

  selectPlayer(data.playerNum, data.profileId)
}

/**
 * Update profile stats (incremental)
 * @param {number} id - Profile ID
 * @param {object} increments - Stats to increment
 * @private
 */
function updateProfileStats(id, increments) {
  const profile = getProfile(id)
  if (!profile) return

  Object.keys(increments).forEach(key => {
    if (profile.stats[key] !== undefined) {
      profile.stats[key] += increments[key]
    }
  })

  updateProfile(id, profile)
}

/**
 * Add achievement to profile
 * @param {number} id - Profile ID
 * @param {string} achievementId - Achievement ID
 * @private
 */
function addAchievementToProfile(id, achievementId) {
  const profile = getProfile(id)
  if (!profile) return

  if (!profile.stats.achievements.includes(achievementId)) {
    profile.stats.achievements.push(achievementId)
    updateProfile(id, profile)
  }
}
