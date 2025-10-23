/**
 * Sound Generation Module
 *
 * Procedural audio generation using Web Audio API.
 * All sounds are generated dynamically - no audio files needed.
 */

import { getAudioContext, getMasterGain } from './engine.js'
import { CONFIG, getTickInterval } from '../../core/config.js'

// Tick-tock state
let tickTockInterval = null
let tickLow = false  // Alternates between high/low pitch
let currentTempo = null

// Heartbeat state
let heartbeatInterval = null

/**
 * Play click sound (when timer is hit)
 * Sharp, satisfying "tap" sound
 */
export function playClick() {
  const ctx = getAudioContext()
  const gain = getMasterGain()
  if (!ctx || !gain) return

  try {
    const osc = ctx.createOscillator()
    const oscGain = ctx.createGain()

    osc.connect(oscGain)
    oscGain.connect(gain)

    // Sharp descending click (800Hz -> 400Hz)
    osc.frequency.setValueAtTime(800, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.02)

    // Quick envelope
    oscGain.gain.setValueAtTime(0.3, ctx.currentTime)
    oscGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.1)
  } catch (error) {
    console.error('[Audio] Click sound failed:', error)
  }
}

/**
 * Play tick sound (single tick or tock)
 * @param {boolean} isLowPitch - Alternate between high (tick) and low (tock)
 */
export function playTick(isLowPitch = false) {
  const ctx = getAudioContext()
  const gain = getMasterGain()
  if (!ctx || !gain) return

  try {
    const osc = ctx.createOscillator()
    const oscGain = ctx.createGain()

    osc.connect(oscGain)
    oscGain.connect(gain)

    // Alternating pitch for tick-tock effect
    const frequency = isLowPitch ? 600 : 800
    osc.frequency.setValueAtTime(frequency, ctx.currentTime)

    // Subtle, non-intrusive volume
    oscGain.gain.setValueAtTime(0.15, ctx.currentTime)
    oscGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.05)
  } catch (error) {
    console.error('[Audio] Tick sound failed:', error)
  }
}

/**
 * Start tick-tock loop with initial tempo
 * Tempo will be updated via updateTickTockTempo()
 */
export function startTickTock() {
  if (tickTockInterval) {
    return  // Already running
  }

  // Start with 60s tempo (1 second interval)
  currentTempo = CONFIG.TICK_INTERVALS.AT_60

  tickTockInterval = setInterval(() => {
    playTick(tickLow)
    tickLow = !tickLow  // Alternate pitch
  }, currentTempo)

  console.log('[Audio] Tick-tock started')
}

/**
 * Stop tick-tock loop
 */
export function stopTickTock() {
  if (tickTockInterval) {
    clearInterval(tickTockInterval)
    tickTockInterval = null
    tickLow = false  // Reset alternation
    currentTempo = null
    console.log('[Audio] Tick-tock stopped')
  }
}

/**
 * Update tick-tock tempo based on remaining time
 * Accelerates as time runs out
 * @param {number} timeRemaining - Seconds left
 */
export function updateTickTockTempo(timeRemaining) {
  const newInterval = getTickInterval(timeRemaining)

  // Should we be ticking at all?
  if (newInterval === null) {
    // Above 60s - stop ticking
    if (tickTockInterval) {
      stopTickTock()
    }
    return
  }

  // Should we start ticking?
  if (!tickTockInterval) {
    startTickTock()
    return
  }

  // Should we change tempo?
  if (newInterval !== currentTempo) {
    // Restart with new tempo
    stopTickTock()
    currentTempo = newInterval

    tickTockInterval = setInterval(() => {
      playTick(tickLow)
      tickLow = !tickLow
    }, currentTempo)

    console.log(`[Audio] Tick-tock tempo changed to ${currentTempo}ms`)
  }
}

/**
 * Play warning sound (entering low time zone)
 * Rising alarm to alert player
 */
export function playWarning() {
  const ctx = getAudioContext()
  const gain = getMasterGain()
  if (!ctx || !gain) return

  try {
    const osc = ctx.createOscillator()
    const oscGain = ctx.createGain()

    osc.connect(oscGain)
    oscGain.connect(gain)

    // Rising alarm (400Hz -> 800Hz)
    osc.frequency.setValueAtTime(400, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2)

    // Medium volume, not too jarring
    oscGain.gain.setValueAtTime(0.2, ctx.currentTime)
    oscGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.3)

    console.log('[Audio] Warning played')
  } catch (error) {
    console.error('[Audio] Warning sound failed:', error)
  }
}

/**
 * Play heartbeat sound (critical time < 10s)
 * Two quick thumps to create tension
 * This starts a continuous heartbeat loop
 */
export function playHeartbeat() {
  const ctx = getAudioContext()
  const gain = getMasterGain()
  if (!ctx || !gain) return

  // Stop any existing heartbeat
  stopHeartbeat()

  // Play single heartbeat (two thumps)
  const playTwoThumps = () => {
    try {
      // First thump
      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()

      osc1.connect(gain1)
      gain1.connect(gain)

      osc1.frequency.setValueAtTime(100, ctx.currentTime)
      osc1.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.05)

      gain1.gain.setValueAtTime(0.3, ctx.currentTime)
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)

      osc1.start(ctx.currentTime)
      osc1.stop(ctx.currentTime + 0.1)

      // Second thump (slightly delayed)
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()

      osc2.connect(gain2)
      gain2.connect(gain)

      osc2.frequency.setValueAtTime(100, ctx.currentTime + 0.15)
      osc2.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.2)

      gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.15)
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25)

      osc2.start(ctx.currentTime + 0.15)
      osc2.stop(ctx.currentTime + 0.25)
    } catch (error) {
      console.error('[Audio] Heartbeat thump failed:', error)
    }
  }

  // Play immediately
  playTwoThumps()

  // Then loop every 1 second
  heartbeatInterval = setInterval(() => {
    playTwoThumps()
  }, 1000)

  console.log('[Audio] Heartbeat started')
}

/**
 * Stop heartbeat loop
 */
export function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval)
    heartbeatInterval = null
    console.log('[Audio] Heartbeat stopped')
  }
}

/**
 * Play victory fanfare
 * Ascending major chord (C-E-G-C)
 */
export function playVictory() {
  const ctx = getAudioContext()
  const gain = getMasterGain()
  if (!ctx || !gain) return

  try {
    // Stop any ongoing sounds
    stopTickTock()
    stopHeartbeat()

    // Major chord notes: C5, E5, G5, C6 (in Hz)
    const notes = [523.25, 659.25, 783.99, 1046.50]

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const oscGain = ctx.createGain()

      osc.connect(oscGain)
      oscGain.connect(gain)

      // Stagger note starts for arpeggio effect
      const startTime = ctx.currentTime + (i * 0.1)
      osc.frequency.setValueAtTime(freq, startTime)

      // Celebration volume!
      oscGain.gain.setValueAtTime(0.2, startTime)
      oscGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.6)

      osc.start(startTime)
      osc.stop(startTime + 0.6)
    })

    // Add a final flourish - octave jump
    const flourish = ctx.createOscillator()
    const flourishGain = ctx.createGain()

    flourish.connect(flourishGain)
    flourishGain.connect(gain)

    flourish.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.4)  // High C
    flourish.frequency.exponentialRampToValueAtTime(2093, ctx.currentTime + 0.5)  // Higher C

    flourishGain.gain.setValueAtTime(0.25, ctx.currentTime + 0.4)
    flourishGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8)

    flourish.start(ctx.currentTime + 0.4)
    flourish.stop(ctx.currentTime + 0.8)

    console.log('[Audio] Victory fanfare played')
  } catch (error) {
    console.error('[Audio] Victory fanfare failed:', error)
  }
}
