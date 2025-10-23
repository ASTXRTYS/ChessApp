/**
 * UI Controls Module - Button Handlers
 *
 * Handles control panel buttons (settings, pause, reset)
 */

import { emit } from '../../core/events.js'

let initialized = false

/**
 * Initialize controls
 */
export function init() {
  if (initialized) return

  console.log('[UI Controls] Initializing...')

  setupControlButtons()

  initialized = true
  console.log('[UI Controls] ✓ Initialized')
}

/**
 * Set up control button handlers
 */
function setupControlButtons() {
  const settingsBtn = document.getElementById('settingsBtn')
  const pauseBtn = document.getElementById('pauseBtn')
  const resetBtn = document.getElementById('resetBtn')
  const closeVictoryBtn = document.getElementById('closeVictoryBtn')

  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      emit('ui:settings-clicked')
    })
  }

  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      emit('ui:pause-clicked')
    })
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      emit('ui:reset-clicked')
    })
  }

  if (closeVictoryBtn) {
    closeVictoryBtn.addEventListener('click', () => {
      const modal = document.getElementById('victoryModal')
      if (modal) {
        modal.classList.add('hidden')
        modal.setAttribute('aria-hidden', 'true')
      }
    })
  }
}

/**
 * Show control panel
 */
export function showControls() {
  const panel = document.getElementById('controlPanel')
  if (panel) {
    panel.style.opacity = '1'
    panel.style.pointerEvents = 'auto'
  }
}

/**
 * Hide control panel
 */
export function hideControls() {
  const panel = document.getElementById('controlPanel')
  if (panel) {
    panel.style.opacity = '0'
    panel.style.pointerEvents = 'none'
  }
}
