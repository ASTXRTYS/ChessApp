/**
 * Configuration - Shared Constants
 *
 * All configuration values in one place.
 * Modules import what they need.
 */

export const CONFIG = {
  // Time thresholds (seconds)
  LOW_TIME_THRESHOLD: 60,      // Start showing urgency
  ENDGAME_THRESHOLD: 30,       // Endgame boost activates
  CRITICAL_THRESHOLD: 10,      // Critical effects (shake, heartbeat)

  // Audio
  DEFAULT_VOLUME: 0.3,
  TICK_TOCK_ENABLED: true,
  TICK_INTERVALS: {
    ABOVE_60: null,            // No ticking above 60s
    AT_60: 1000,               // Every 1s at 60s
    AT_30: 500,                // Every 0.5s at 30s
    AT_10: 250                 // Every 0.25s at 10s
  },

  // Performance
  TARGET_FPS: 60,
  MAX_PARTICLES: 100,
  ENABLE_SHADOWS: true,        // Can be disabled for performance
  ENABLE_POSTPROCESSING: true,

  // Scene defaults
  DEFAULT_SCENE: 'classic',    // Start with 2D mode
  AVAILABLE_SCENES: ['classic', 'stadium', 'zen', 'cyberpunk'],
  ACTIVE_SCENES: ['classic', 'stadium', 'zen', 'cyberpunk'],

  // Gamification
  XP_PER_GAME: 10,
  XP_PER_ACHIEVEMENT: 50,
  XP_PER_LEVEL: 100,           // XP needed per level

  // Default time presets (seconds)
  TIME_PRESETS: [60, 180, 300, 600, 900, 1800],

  // Storage
  LOCAL_STORAGE_KEY: 'chessClockV2',
  STORAGE_VERSION: 1,

  // Color palettes
  PALETTES: [
    {
      id: 'royal',
      label: 'Royal',
      activeGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      inactiveGradient: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)'
    },
    {
      id: 'ember',
      label: 'Ember',
      activeGradient: 'linear-gradient(135deg, #f56565 0%, #ed8936 100%)',
      inactiveGradient: 'linear-gradient(135deg, #742a2a 0%, #7b341e 100%)'
    },
    {
      id: 'forest',
      label: 'Forest',
      activeGradient: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
      inactiveGradient: 'linear-gradient(135deg, #22543d 0%, #1c4532 100%)'
    },
    {
      id: 'ocean',
      label: 'Ocean',
      activeGradient: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
      inactiveGradient: 'linear-gradient(135deg, #1a365d 0%, #1a3a4a 100%)'
    },
    {
      id: 'sunset',
      label: 'Sunset',
      activeGradient: 'linear-gradient(135deg, #f6ad55 0%, #ed64a6 100%)',
      inactiveGradient: 'linear-gradient(135deg, #7b341e 0%, #702459 100%)'
    }
  ],

  // Ambient modes
  AMBIENT_MODES: [
    {
      id: 'classic',
      label: 'Classic',
      description: '2D mode with enhanced effects'
    },
    {
      id: 'stadium',
      label: 'Stadium',
      description: '3D arena with dramatic lighting'
    },
    {
      id: 'zen',
      label: 'Zen Garden',
      description: 'Peaceful minimalist 3D'
    },
    {
      id: 'cyberpunk',
      label: 'Cyberpunk',
      description: 'Neon-lit cyber grid'
    }
  ],

  // Achievement definitions
  ACHIEVEMENTS: [
    {
      id: 'first-blood',
      name: 'First Blood',
      description: 'Play your first game',
      xp: 10
    },
    {
      id: 'lightning-reflexes',
      name: 'Lightning Reflexes',
      description: '10 moves under 3 seconds',
      xp: 50
    },
    {
      id: 'time-bandit',
      name: 'Time Bandit',
      description: 'Win with 2+ minutes remaining',
      xp: 50
    },
    {
      id: 'comeback-king',
      name: 'Comeback King',
      description: 'Win after being down to 10 seconds',
      xp: 100
    },
    {
      id: 'marathon-master',
      name: 'Marathon Master',
      description: 'Complete a 50+ move game',
      xp: 50
    },
    {
      id: 'zen-master',
      name: 'Zen Master',
      description: 'No move over 10 seconds',
      xp: 75
    },
    {
      id: 'speed-demon',
      name: 'Speed Demon',
      description: 'Average move time under 5 seconds',
      xp: 50
    },
    {
      id: 'century',
      name: 'Century Club',
      description: 'Play 100 games',
      xp: 200
    }
  ],

  // Animation durations (ms)
  ANIMATION: {
    CAMERA_TRANSITION: 1000,
    SCENE_FADE: 500,
    UI_TRANSITION: 300,
    PARTICLE_LIFETIME: 2000
  },

  // Debug
  DEBUG_MODE: false,
  SHOW_FPS: false
}

/**
 * Get palette by ID
 * @param {string} id - Palette ID
 * @returns {object} Palette object or default
 */
export function getPalette(id) {
  return CONFIG.PALETTES.find(p => p.id === id) || CONFIG.PALETTES[0]
}

/**
 * Get ambient mode by ID
 * @param {string} id - Ambient mode ID
 * @returns {object} Ambient mode object or default
 */
export function getAmbientMode(id) {
  return CONFIG.AMBIENT_MODES.find(m => m.id === id) || CONFIG.AMBIENT_MODES[0]
}

/**
 * Get achievement by ID
 * @param {string} id - Achievement ID
 * @returns {object} Achievement object or null
 */
export function getAchievement(id) {
  return CONFIG.ACHIEVEMENTS.find(a => a.id === id) || null
}

/**
 * Get tick interval based on time remaining
 * @param {number} timeLeft - Seconds remaining
 * @returns {number|null} Interval in ms, or null if no ticking
 */
export function getTickInterval(timeLeft) {
  if (timeLeft <= CONFIG.CRITICAL_THRESHOLD) {
    return CONFIG.TICK_INTERVALS.AT_10
  }
  if (timeLeft <= CONFIG.ENDGAME_THRESHOLD) {
    return CONFIG.TICK_INTERVALS.AT_30
  }
  if (timeLeft <= CONFIG.LOW_TIME_THRESHOLD) {
    return CONFIG.TICK_INTERVALS.AT_60
  }
  return CONFIG.TICK_INTERVALS.ABOVE_60
}
