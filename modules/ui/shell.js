/**
 * UI Shell Module - Main UI Coordination
 *
 * Handles DOM updates, timer displays, and UI state management
 */

import { emit, on } from '../../core/events.js'
import { subscribe, get } from '../../core/state.js'
import { getPalette } from '../../core/config.js'
import { init as initControls } from './controls.js'
import { init as initSettings } from './settings.js'

let initialized = false
let statusAnnouncer = null

/**
 * Initialize UI shell
 */
export function init() {
  if (initialized) return

  console.log('[UI Shell] Initializing...')

  setupEventListeners()
  setupStateSubscriptions()
  setupTimerClicks()

  initControls()
  initSettings()

  statusAnnouncer = document.getElementById('statusAnnouncer')

  applyPalette(1, get('player1Palette') || 'royal')
  applyPalette(2, get('player2Palette') || 'royal')

  // Set initial scene mode
  const initialMode = get('ambientMode') || 'classic'
  updateSceneMode(initialMode)
  setActivePlayer(get('activePlayer'))

  initialized = true
  console.log('[UI Shell] ✓ Initialized')
}

/**
 * Set up event listeners for game events
 */
function setupEventListeners() {
  on('game:tick', handleTick)
  on('game:victory', handleVictory)
  on('game:player-switched', handlePlayerSwitch)
  on('game:low-time', handleLowTime)
  on('game:critical-time', handleCriticalTime)
  on('game:reset', handleReset)
  on('game:started', handleGameStarted)
  on('renderer:scene-loading', showLoading)
  on('renderer:scene-loaded', hideLoading)
}

/**
 * Set up state subscriptions for reactive updates
 */
function setupStateSubscriptions() {
  subscribe('player1Time', (time) => {
    updateTimerDisplay(1, formatTime(time))
  })

  subscribe('player2Time', (time) => {
    updateTimerDisplay(2, formatTime(time))
  })

  subscribe('player1Moves', (moves) => {
    updateMovesDisplay(1, moves)
  })

  subscribe('player2Moves', (moves) => {
    updateMovesDisplay(2, moves)
  })

  subscribe('activePlayer', (player) => {
    setActivePlayer(player)
  })

  subscribe('isPaused', (paused) => {
    updatePauseButton(paused)
  })

  subscribe('selectedPlayer1', (profile) => {
    updatePlayerLabel(1, profile)
  })

  subscribe('selectedPlayer2', (profile) => {
    updatePlayerLabel(2, profile)
  })

  subscribe('ambientMode', (mode) => {
    updateSceneMode(mode)
  })

  subscribe('player1Palette', (paletteId) => {
    applyPalette(1, paletteId)
  })

  subscribe('player2Palette', (paletteId) => {
    applyPalette(2, paletteId)
  })
}

/**
 * Set up timer click handlers
 */
function setupTimerClicks() {
  const player1 = document.getElementById('player1')
  const player2 = document.getElementById('player2')

  if (player1) {
    player1.addEventListener('click', () => {
      emit('ui:player-clicked', { player: 1 })
    })
  }

  if (player2) {
    player2.addEventListener('click', () => {
      emit('ui:player-clicked', { player: 2 })
    })
  }
}

/**
 * Update timer display
 */
export function updateTimerDisplay(player, timeString) {
  const element = document.getElementById(`time${player}`)
  if (element) {
    element.textContent = timeString
  }
}

/**
 * Update moves display
 */
export function updateMovesDisplay(player, moves) {
  const element = document.getElementById(`moves${player}`)
  if (element) {
    element.textContent = `Moves: ${moves}`
  }
}

/**
 * Set active player visual state
 */
export function setActivePlayer(player) {
  const player1El = document.getElementById('player1')
  const player2El = document.getElementById('player2')

  if (player1El && player2El) {
    player1El.classList.toggle('timer-active', player === 1)
    player1El.classList.toggle('timer-inactive', player !== 1)
    player1El.setAttribute('aria-pressed', player === 1 ? 'true' : 'false')
    player2El.classList.toggle('timer-active', player === 2)
    player2El.classList.toggle('timer-inactive', player !== 2)
    player2El.setAttribute('aria-pressed', player === 2 ? 'true' : 'false')
  }
}

/**
 * Update pause button state
 */
function updatePauseButton(paused) {
  const playIcon = document.getElementById('playIcon')
  const pauseIcon = document.getElementById('pauseIcon')

  if (playIcon && pauseIcon) {
    if (paused) {
      playIcon.classList.remove('hidden')
      pauseIcon.classList.add('hidden')
    } else {
      playIcon.classList.add('hidden')
      pauseIcon.classList.remove('hidden')
    }
  }
}

/**
 * Update player label
 */
function updatePlayerLabel(player, profile) {
  const labelElement = document.getElementById(`player${player}Label`)
  if (labelElement) {
    labelElement.textContent = profile ? profile.name.toUpperCase() : `PLAYER ${player}`
  }
}

/**
 * Update scene mode (show/hide 2D timers based on scene)
 */
function updateSceneMode(mode) {
  const player1 = document.getElementById('player1')
  const player2 = document.getElementById('player2')

  if (document.body) {
    document.body.dataset.scene = mode
  }

  const hideHtml = mode !== 'classic'

  if (hideHtml) {
    // Completely hide HTML UI in 3D mode, keep containers for clicks
    if (player1) {
      player1.style.setProperty('background', 'transparent')
      // Hide all text content, keep container for clicks
      const children = player1.querySelectorAll('*')
      children.forEach(el => el.style.opacity = '0')
    }
    if (player2) {
      player2.style.setProperty('background', 'transparent')
      const children = player2.querySelectorAll('*')
      children.forEach(el => el.style.opacity = '0')
    }
    console.log(`[UI] Switched to ${mode} mode (3D) - HTML UI hidden`)
  } else {
    // Show 2D timers in classic mode
    if (player1) {
      player1.style.removeProperty('background')
      const children = player1.querySelectorAll('*')
      children.forEach(el => el.style.opacity = '1')
    }
    if (player2) {
      player2.style.removeProperty('background')
      const children = player2.querySelectorAll('*')
      children.forEach(el => el.style.opacity = '1')
    }
    console.log('[UI] Switched to Classic mode (2D) - HTML UI visible')
  }
}

/**
 * Format time (seconds to MM:SS)
 */
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

/**
 * Show victory modal
 */
export function showVictoryModal(winner, stats) {
  const modal = document.getElementById('victoryModal')
  const title = document.getElementById('victoryTitle')
  const statsDiv = document.getElementById('victoryStats')

  if (modal && title && statsDiv) {
    const winnerProfile = get(`selectedPlayer${winner}`)
    const winnerName = winnerProfile ? winnerProfile.name : `Player ${winner}`

    title.textContent = `🏆 ${winnerName} Wins!`

    statsDiv.innerHTML = `
      <div class="space-y-2">
        <p><strong>Total Moves:</strong> ${stats.moves.length}</p>
        <p><strong>Average Move Time:</strong> ${stats.avgMoveTime.toFixed(1)}s</p>
        <p><strong>Fastest Move:</strong> ${stats.fastestMove.toFixed(1)}s</p>
        <p><strong>Longest Think:</strong> ${stats.longestThink.toFixed(1)}s</p>
      </div>
    `

    modal.classList.remove('hidden')
    modal.setAttribute('aria-hidden', 'false')

    const closeBtn = document.getElementById('closeVictoryBtn')
    if (closeBtn) {
      setTimeout(() => closeBtn.focus(), 100)
    }
  }
}

/**
 * Hide victory modal
 */
export function hideVictoryModal() {
  const modal = document.getElementById('victoryModal')
  if (modal) {
    modal.classList.add('hidden')
    modal.setAttribute('aria-hidden', 'true')
  }
}

/**
 * Show loading indicator
 */
function showLoading() {
  const loading = document.getElementById('loading')
  if (loading && loading.parentElement) {
    loading.style.display = 'block'
  }
}

/**
 * Hide loading indicator
 */
function hideLoading() {
  const loading = document.getElementById('loading')
  if (loading) {
    loading.style.display = 'none'
  }
}

/**
 * Event Handlers
 */

function handleTick(data) {
  // Already handled by state subscriptions
}

function handleGameStarted(data) {
  const profile = get(`selectedPlayer${data.player}`)
  const label = profile ? profile.name : `Player ${data.player}`
  announce(`Game started. ${label} on the clock`)
}

function handleVictory(data) {
  const stats = get('currentMatchStats')
  showVictoryModal(data.winner, stats)

  const profile = get(`selectedPlayer${data.winner}`)
  const winnerName = profile ? profile.name : `Player ${data.winner}`
  announce(`${winnerName} wins the match`)
}

function handlePlayerSwitch(data) {
  // Handled by state subscription
  const activeProfile = get(`selectedPlayer${data.to}`)
  const playerName = activeProfile ? activeProfile.name : `Player ${data.to}`
  announce(`${playerName} to move`)
}

function handleLowTime(data) {
  // Add urgency styling
  const playerEl = document.getElementById(`player${data.player}`)
  if (playerEl) {
    playerEl.classList.add('low-time-urgency')
  }

  const profile = get(`selectedPlayer${data.player}`)
  const label = profile ? profile.name : `Player ${data.player}`
  announce(`${label} has ${formatTime(data.timeRemaining)} remaining`)
}

function handleCriticalTime(data) {
  // Add critical styling
  const playerEl = document.getElementById(`player${data.player}`)
  if (playerEl) {
    playerEl.classList.add('critical-time-urgency')
  }

  const profile = get(`selectedPlayer${data.player}`)
  const label = profile ? profile.name : `Player ${data.player}`
  announce(`${label} is in critical time`)
}

function handleReset() {
  // Clear urgency classes
  const player1 = document.getElementById('player1')
  const player2 = document.getElementById('player2')

  if (player1) {
    player1.classList.remove('low-time-urgency', 'critical-time-urgency')
  }
  if (player2) {
    player2.classList.remove('low-time-urgency', 'critical-time-urgency')
  }

  announce('Clock reset')
  hideVictoryModal()
}

function applyPalette(player, paletteId) {
  const palette = getPalette(paletteId)
  const element = document.getElementById(`player${player}`)
  if (!palette || !element) return

  element.style.setProperty('--timer-active-gradient', palette.activeGradient)
  element.style.setProperty('--timer-inactive-gradient', palette.inactiveGradient)
}

function announce(message) {
  if (!statusAnnouncer) return

  // Reset text content so repeat announcements fire reliably
  statusAnnouncer.textContent = ''
  requestAnimationFrame(() => {
    statusAnnouncer.textContent = message
  })
}
