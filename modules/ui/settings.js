/**
 * UI Settings Module - Settings Panel
 *
 * Handles settings panel UI and user preferences
 */

import { emit, on } from '../../core/events.js'
import { get, subscribe, dispatch, ACTIONS } from '../../core/state.js'
import { CONFIG } from '../../core/config.js'

let initialized = false
const sceneButtons = new Map()

/**
 * Initialize settings panel
 */
export function init() {
  if (initialized) return

  console.log('[UI Settings] Initializing...')

  setupSettingsPanel()
  setupTimePresets()
  setupSceneOptions()
  setupProfileSelectors()
  setupAudioToggle()
  setupEventListeners()

  initialized = true
  console.log('[UI Settings] ✓ Initialized')
}

/**
 * Set up settings panel controls
 */
function setupSettingsPanel() {
  const closeSettings = document.getElementById('closeSettings')
  const panel = document.getElementById('settingsPanel')

  // Note: settingsBtn click handler is in controls.js
  // It emits 'ui:settings-clicked' which we listen to in setupEventListeners()

  if (panel) {
    panel.setAttribute('aria-hidden', panel.classList.contains('open') ? 'false' : 'true')
  }

  if (closeSettings && panel) {
    closeSettings.addEventListener('click', () => {
      hideSettings()
    })
  }
}

/**
 * Set up time preset buttons
 */
function setupTimePresets() {
  const container = document.getElementById('timePresets')
  if (!container) return

  const presets = CONFIG.TIME_PRESETS || [60, 180, 300, 600, 900, 1800]
  container.innerHTML = ''

  presets.forEach(seconds => {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'preset-button'
    button.textContent = formatPresetTime(seconds)
    button.addEventListener('click', () => {
      emit('ui:time-selected', { seconds })
      hideSettings()
    })
    container.appendChild(button)
  })
}

/**
 * Set up scene selection options
 */
function setupSceneOptions() {
  const container = document.getElementById('sceneOptions')
  if (!container) return

  const iconMap = {
    classic: '📱',
    stadium: '🏟️',
    zen: '🧘',
    cyberpunk: '🌌'
  }

  const availableScenes = new Set(CONFIG.ACTIVE_SCENES || CONFIG.AVAILABLE_SCENES || [])
  const modes = CONFIG.AMBIENT_MODES.filter(mode => availableScenes.size === 0 || availableScenes.has(mode.id))
  container.innerHTML = ''
  sceneButtons.clear()

  const currentMode = get('ambientMode') || modes[0]?.id

  modes.forEach(mode => {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'scene-button flex items-center justify-between'
    button.setAttribute('data-scene', mode.id)
    button.setAttribute('aria-pressed', mode.id === currentMode ? 'true' : 'false')
    button.innerHTML = `
      <span>${iconMap[mode.id] || '🎬'} ${mode.label}</span>
      <span class="text-xs opacity-70">${mode.description}</span>
    `

    button.addEventListener('click', () => {
      if (mode.id === get('ambientMode')) {
        hideSettings()
        return
      }
      dispatch(ACTIONS.UPDATE_SETTING, { key: 'ambientMode', value: mode.id })
      emit('ui:scene-changed', { sceneName: mode.id })
      hideSettings()
    })

    sceneButtons.set(mode.id, button)
    container.appendChild(button)
  })

  updateSceneButtonState(currentMode)

  subscribe('ambientMode', (mode) => {
    updateSceneButtonState(mode)
  })
}

/**
 * Set up profile selector dropdowns
 */
function setupProfileSelectors() {
  const player1Select = document.getElementById('player1Select')
  const player2Select = document.getElementById('player2Select')

  // Listen for profiles loaded event
  on('profiles:loaded', (data) => {
    populateProfileDropdowns(data.profiles)
  })

  if (player1Select) {
    player1Select.addEventListener('change', (e) => {
      const profileId = e.target.value ? parseInt(e.target.value) : null
      emit('ui:profile-selected', { playerNum: 1, profileId })
    })
  }

  if (player2Select) {
    player2Select.addEventListener('change', (e) => {
      const profileId = e.target.value ? parseInt(e.target.value) : null
      emit('ui:profile-selected', { playerNum: 2, profileId })
    })
  }
}

/**
 * Populate profile dropdowns
 */
function populateProfileDropdowns(profiles) {
  const player1Select = document.getElementById('player1Select')
  const player2Select = document.getElementById('player2Select')

  if (!player1Select || !player2Select) return

  const options = profiles.map(p =>
    `<option value="${p.id}">${p.name}</option>`
  ).join('')

  player1Select.innerHTML = `<option value="">Select Player</option>${options}`
  player2Select.innerHTML = `<option value="">Select Player</option>${options}`
}

/**
 * Set up audio toggle
 */
function setupAudioToggle() {
  const toggle = document.getElementById('audioToggle')
  if (!toggle) return

  toggle.checked = get('audioEnabled') !== false

  toggle.addEventListener('change', (e) => {
    dispatch(ACTIONS.UPDATE_SETTING, {
      key: 'audioEnabled',
      value: e.target.checked
    })
  })
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  on('ui:settings-clicked', toggleSettings)
}

/**
 * Toggle settings panel
 */
export function toggleSettings() {
  const panel = document.getElementById('settingsPanel')
  if (!panel) return

  if (panel.classList.contains('open')) {
    hideSettings()
  } else {
    showSettings()
  }
}

/**
 * Show settings panel
 */
export function showSettings() {
  const panel = document.getElementById('settingsPanel')
  const controlPanel = document.getElementById('controlPanel')

  if (panel) {
    panel.classList.add('open')
    panel.setAttribute('aria-hidden', 'false')
    const closeBtn = document.getElementById('closeSettings')
    if (closeBtn) {
      setTimeout(() => closeBtn.focus(), 150)
    }
  }

  if (controlPanel) {
    controlPanel.style.opacity = '0'
    controlPanel.style.pointerEvents = 'none'
  }
}

/**
 * Hide settings panel
 */
export function hideSettings() {
  const panel = document.getElementById('settingsPanel')
  const controlPanel = document.getElementById('controlPanel')

  if (panel) {
    panel.classList.remove('open')
    panel.setAttribute('aria-hidden', 'true')
  }

  if (controlPanel) {
    controlPanel.style.opacity = '1'
    controlPanel.style.pointerEvents = 'auto'
  }

  const settingsBtn = document.getElementById('settingsBtn')
  if (settingsBtn) {
    settingsBtn.focus()
  }
}

/**
 * Format preset time for display
 */
function formatPresetTime(seconds) {
  const minutes = seconds / 60
  if (minutes < 60) {
    return `${minutes} min`
  } else {
    const hours = minutes / 60
    return `${hours} hr`
  }
}

/**
 * Update aria-pressed state for scene filters
 */
function updateSceneButtonState(activeScene) {
  sceneButtons.forEach((button, id) => {
    button.setAttribute('aria-pressed', id === activeScene ? 'true' : 'false')
  })
}
