/**
 * Audio Engine Module
 *
 * Manages Web Audio API context, master volume, and event subscriptions.
 * All sound generation delegated to sounds.js.
 */

import { emit, on } from '../../core/events.js'
import { subscribe, get } from '../../core/state.js'
import { CONFIG } from '../../core/config.js'
import {
  playClick,
  playTick,
  startTickTock,
  stopTickTock,
  updateTickTockTempo,
  playWarning,
  playHeartbeat,
  playVictory
} from './sounds.js'

// Module state
let audioContext = null
let masterGain = null
let initialized = false
let muted = false

/**
 * Initialize audio engine
 * Must be called before any sounds can play.
 * Safari requires user interaction before AudioContext can be created.
 */
export function init() {
  if (initialized) {
    console.log('[Audio] Already initialized')
    return
  }

  try {
    // Create AudioContext (with webkit prefix for Safari)
    audioContext = new (window.AudioContext || window.webkitAudioContext)()

    // Resume context immediately (Safari auto-suspends)
    if (audioContext.state === 'suspended') {
      audioContext.resume()
    }

    // Create master gain node for volume control
    masterGain = audioContext.createGain()
    masterGain.connect(audioContext.destination)
    masterGain.gain.value = CONFIG.DEFAULT_VOLUME

    // Setup event listeners and state subscriptions
    setupEventListeners()
    setupStateSubscriptions()

    initialized = true
    console.log('[Audio] Initialized successfully')
    emit('audio:initialized')
  } catch (error) {
    console.error('[Audio] Initialization failed:', error)
    emit('audio:error', { message: error.message })
  }
}

/**
 * Setup event listeners for game events
 * @private
 */
function setupEventListeners() {
  // Player switched - play click
  on('game:player-switched', handlePlayerSwitch)

  // Tick event - update tick-tock tempo
  on('game:tick', handleTick)

  // Low time warning (60s)
  on('game:low-time', handleLowTime)

  // Critical time (10s)
  on('game:critical-time', handleCriticalTime)

  // Victory - play fanfare
  on('game:victory', handleVictory)

  // Game reset - stop all sounds
  on('game:reset', handleReset)

  // Game paused - stop tick-tock
  on('game:paused', handlePause)

  // Game resumed - resume tick-tock if needed
  on('game:resumed', handleResume)
}

/**
 * Setup state subscriptions
 * @private
 */
function setupStateSubscriptions() {
  // Listen to audioEnabled setting changes
  subscribe('audioEnabled', (enabled) => {
    if (enabled) {
      unmute()
    } else {
      mute()
    }
  })
}

/**
 * Event Handlers
 * @private
 */

function handlePlayerSwitch(data) {
  if (!isAudioActive()) return

  // Resume audio context on first interaction (Safari requirement)
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume()
  }

  playClick()
}

function handleTick(data) {
  // data = { player, timeRemaining }
  if (!isAudioActive()) return

  if (data && typeof data.timeRemaining === 'number') {
    updateTickTockTempo(data.timeRemaining)
  }
}

function handleLowTime(data) {
  // data = { player, timeRemaining }
  if (!isAudioActive()) return

  playWarning()
  startTickTock()
}

function handleCriticalTime(data) {
  // data = { player, timeRemaining }
  // Heartbeat starts playing continuously in sounds.js
  // We just need to signal it once
  if (!isAudioActive()) return

  playHeartbeat()
}

function handleVictory(data) {
  // data = { winner, loser }
  stopTickTock()
  if (!isAudioActive()) return

  playVictory()
}

function handleReset(data) {
  stopTickTock()
}

function handlePause(data) {
  stopTickTock()
}

function handleResume(data) {
  // Restart tick-tock if we're in low time
  // The tick handler will start it if needed
}

/**
 * Public API
 */

/**
 * Set master volume
 * @param {number} volume - Volume level (0-1)
 */
export function setMasterVolume(volume) {
  if (!masterGain) {
    console.warn('[Audio] Engine not initialized')
    return
  }

  const clampedVolume = Math.max(0, Math.min(1, volume))
  masterGain.gain.value = clampedVolume
  console.log(`[Audio] Master volume set to ${clampedVolume}`)
}

/**
 * Mute all audio
 */
export function mute() {
  if (!masterGain) return

  muted = true
  masterGain.gain.value = 0
  stopTickTock()
  console.log('[Audio] Muted')
}

/**
 * Unmute audio (restore volume)
 */
export function unmute() {
  if (!masterGain) return

  muted = false
  masterGain.gain.value = CONFIG.DEFAULT_VOLUME
  console.log('[Audio] Unmuted')
}

/**
 * Check if audio is muted
 * @returns {boolean} True if muted
 */
export function isMuted() {
  return muted
}

/**
 * Get AudioContext instance (for sounds.js)
 * @returns {AudioContext|null}
 */
export function getAudioContext() {
  return audioContext
}

function isAudioActive() {
  return !muted && get('audioEnabled') !== false
}

/**
 * Get master gain node (for sounds.js)
 * @returns {GainNode|null}
 */
export function getMasterGain() {
  return masterGain
}

/**
 * Check if audio is initialized
 * @returns {boolean}
 */
export function isInitialized() {
  return initialized
}
