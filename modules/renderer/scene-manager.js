/**
 * Scene Manager - Three.js Renderer Controller
 *
 * Manages 3D scene loading, rendering, and lifecycle.
 * Coordinates between game state and visual representation.
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js'
import { emit, on } from '../../core/events.js'
import { subscribe, get } from '../../core/state.js'
import { init as initCamera, animateTo, shake } from './camera.js'
import { init as initParticles, update as updateParticles } from '../particles/system.js'

// Core Three.js objects
let renderer = null
let scene = null
let camera = null
let currentScene = null
let animationFrame = null
let canvas = null
let initialized = false
let clock = null
let loadingScene = null

/**
 * Initialize the renderer and set up Three.js
 * @param {HTMLCanvasElement} canvasElement - Canvas to render to
 */
export async function init(canvasElement) {
  if (initialized) {
    console.log('[Renderer] Already initialized')
    return
  }

  canvas = canvasElement

  try {
    console.log('[Renderer] Initializing Three.js...')

    // Set up Three.js renderer
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    // Create scene
    scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x000000, 0.015)

    // Initialize particle system with the scene
    initParticles(scene)

    // Create camera
    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.set(0, 0, 8)

    // Initialize camera controller
    initCamera(camera, scene)

    // Set up clock for delta time
    clock = new THREE.Clock()

    // Set up event listeners
    setupEventListeners()
    setupStateSubscriptions()

    // Handle resize
    window.addEventListener('resize', handleResize)

    initialized = true
    emit('renderer:initialized')

    console.log('[Renderer] ✅ Initialized successfully')

    // Load default scene
    const defaultScene = get('ambientMode') || 'classic'
    await loadScene(defaultScene)

  } catch (error) {
    console.error('[Renderer] ❌ Initialization failed:', error)
    emit('renderer:scene-error', { error: error.message })
    throw error
  }
}

/**
 * Set up event listeners from other modules
 */
function setupEventListeners() {
  on('game:started', handleGameStart)
  on('game:player-switched', handlePlayerSwitch)
  on('game:tick', handleTick)
  on('game:low-time', handleLowTime)
  on('game:critical-time', handleCriticalTime)
  on('game:victory', handleVictory)
  on('ui:scene-changed', (data) => loadScene(data.sceneName))
}

/**
 * Set up state subscriptions
 */
function setupStateSubscriptions() {
  subscribe('ambientMode', (sceneName) => {
    console.log('[Renderer] Scene changed via state:', sceneName)
    loadScene(sceneName)
  })

  subscribe('activePlayer', (player) => {
    if (currentScene && currentScene.setActivePlayer) {
      currentScene.setActivePlayer(player)
    }
  })
}

/**
 * Handle window resize
 */
function handleResize() {
  if (!camera || !renderer) return

  const width = window.innerWidth
  const height = window.innerHeight

  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)

  console.log('[Renderer] Resized to', width, 'x', height)
}

/**
 * Load a scene by name
 * @param {string} sceneName - Name of scene to load ('classic', 'stadium', etc.)
 */
export async function loadScene(sceneName) {
  // Prevent duplicate loads when both events and state updates fire
  if (loadingScene === sceneName) {
    console.log(`[Renderer] Scene "${sceneName}" is already loading. Skipping duplicate request.`)
    return
  }

  if (currentScene && currentScene.name === sceneName) {
    console.log(`[Renderer] Scene "${sceneName}" is already active.`)
    return
  }

  try {
    console.log('[Renderer] Loading scene:', sceneName)
    loadingScene = sceneName
    emit('renderer:scene-loading', { sceneName })

    // Unload current scene
    if (currentScene) {
      await unloadScene()
    }

    // Dynamically import scene module
    const sceneModule = await import(`./scenes/${sceneName}.js`)
    currentScene = sceneModule.default

    // Initialize new scene
    await currentScene.init(scene, camera)

    // Start render loop
    startRenderLoop()

    emit('renderer:scene-loaded', { sceneName })
    console.log('[Renderer] ✅ Scene loaded:', sceneName)

  } catch (error) {
    console.error(`[Renderer] ❌ Failed to load scene "${sceneName}":`, error)
    emit('renderer:scene-error', { error: error.message, sceneName })

    // Fall back to classic mode
    if (sceneName !== 'classic') {
      console.log('[Renderer] Falling back to classic mode...')
      loadingScene = null
      loadScene('classic')
    }
  } finally {
    if (loadingScene === sceneName) {
      loadingScene = null
    }
  }
}

/**
 * Unload current scene and clean up resources
 */
export async function unloadScene() {
  if (!currentScene) return

  console.log('[Renderer] Unloading scene:', currentScene.name)

  stopRenderLoop()

  if (currentScene.destroy) {
    await currentScene.destroy()
  }

  currentScene = null

  // Clear scene (remove all objects)
  while (scene.children.length > 0) {
    const child = scene.children[0]
    scene.remove(child)

    // Dispose geometries and materials
    if (child.geometry) child.geometry.dispose()
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach(mat => mat.dispose())
      } else {
        child.material.dispose()
      }
    }
  }
}

/**
 * Start the render loop
 */
export function startRenderLoop() {
  if (animationFrame) {
    console.log('[Renderer] Render loop already running')
    return
  }

  console.log('[Renderer] Starting render loop')

  function animate() {
    animationFrame = requestAnimationFrame(animate)

    const deltaTime = clock.getDelta()

    // Update particles
    updateParticles(deltaTime)

    // Update current scene
    if (currentScene && currentScene.update) {
      const gameState = {
        player1Time: get('player1Time'),
        player2Time: get('player2Time'),
        activePlayer: get('activePlayer'),
        isPaused: get('isPaused')
      }
      currentScene.update(deltaTime, gameState)
    }

    // Render
    if (renderer && scene && camera) {
      renderer.render(scene, camera)
    }
  }

  animate()
}

/**
 * Stop the render loop
 */
export function stopRenderLoop() {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
    animationFrame = null
    console.log('[Renderer] Render loop stopped')
  }
}

/**
 * Update timer display (delegates to current scene)
 * @param {number} player - Player number (1 or 2)
 * @param {string} timeString - Formatted time string
 */
export function updateTimerDisplay(player, timeString) {
  if (currentScene && currentScene.updateTimerDisplay) {
    currentScene.updateTimerDisplay(player, timeString)
  }
}

/**
 * Set active player (delegates to current scene)
 * @param {number} player - Player number (1 or 2)
 */
export function setActivePlayer(player) {
  if (currentScene && currentScene.setActivePlayer) {
    currentScene.setActivePlayer(player)
  }
}

/**
 * Handle game start event
 */
function handleGameStart(data) {
  console.log('[Renderer] Game started')
  // Optionally animate camera or scene
}

/**
 * Handle player switch event
 */
function handlePlayerSwitch(data) {
  console.log('[Renderer] Player switched:', data.from, '→', data.to)
  setActivePlayer(data.to)
  // Optionally add camera transition
}

/**
 * Handle tick event (timer update)
 */
function handleTick(data) {
  // Format time as MM:SS
  const minutes = Math.floor(data.timeRemaining / 60)
  const seconds = data.timeRemaining % 60
  const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  updateTimerDisplay(data.player, timeString)
}

/**
 * Handle low time warning
 */
function handleLowTime(data) {
  console.log('[Renderer] Low time warning:', data)
  // Optionally add visual urgency effects
}

/**
 * Handle critical time warning
 */
function handleCriticalTime(data) {
  console.log('[Renderer] Critical time warning:', data)
  // Shake camera for urgency
  shake(0.02, 300)
}

/**
 * Handle victory event
 */
function handleVictory(data) {
  console.log('[Renderer] Victory:', data.winner)
  // Optionally add victory camera animation
  // animateTo(new THREE.Vector3(0, 3, 10), new THREE.Vector3(0, 0, 0), 2000)
}

/**
 * Handle window resize event
 */
export function resize() {
  handleResize()
}

/**
 * Clean up renderer
 */
export function destroy() {
  stopRenderLoop()
  unloadScene()
  window.removeEventListener('resize', handleResize)

  if (renderer) {
    renderer.dispose()
    renderer = null
  }

  initialized = false
  console.log('[Renderer] Destroyed')
}
