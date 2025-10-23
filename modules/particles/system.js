/**
 * Particle System - Visual Effects Engine
 *
 * Manages particle lifecycle, physics, and rendering integration.
 * Uses object pooling for performance (max 1000 particles).
 */

import { emit, on } from '../../core/events.js'
import { subscribe, get } from '../../core/state.js'
import { CONFIG } from '../../core/config.js'
import { createHitBurst, createConfetti, createAmbientParticles } from './effects.js'
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js'

// System state
let scene = null
let particleSystem = null
let particles = []  // Active particles
let particlePool = []  // Inactive particles for reuse
let enabled = true
let initialized = false
let nextParticleIndex = 0

// Constants
const MAX_PARTICLES = 1000
const GRAVITY = 9.8

/**
 * Initialize particle system
 * @param {THREE.Scene} threeScene - Three.js scene to add particles to
 */
export function init(threeScene) {
  if (initialized) {
    console.warn('[Particles] Already initialized')
    return
  }

  if (!threeScene) {
    console.error('[Particles] Invalid scene provided')
    return
  }

  scene = threeScene

  try {
    // Set up particle system with object pooling
    setupParticleSystem()

    // Set up event listeners
    setupEventListeners()

    // Set up state subscriptions
    setupStateSubscriptions()

    initialized = true
    emit('particles:initialized')

    console.log('[Particles] Initialized successfully')
  } catch (error) {
    console.error('[Particles] Initialization failed:', error)
    return
  }
}

/**
 * Create particle buffer geometry with object pooling
 * @private
 */
function setupParticleSystem() {
  // Pre-allocate buffers for max particles
  const positions = new Float32Array(MAX_PARTICLES * 3)
  const colors = new Float32Array(MAX_PARTICLES * 3)
  const sizes = new Float32Array(MAX_PARTICLES)
  const alphas = new Float32Array(MAX_PARTICLES)

  // Initialize all to invisible
  for (let i = 0; i < MAX_PARTICLES; i++) {
    alphas[i] = 0
    sizes[i] = 0
  }

  // Create geometry with attributes
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
  geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1))

  // Create shader material for better control
  const material = new THREE.ShaderMaterial({
    uniforms: {},
    vertexShader: `
      attribute float size;
      attribute float alpha;
      attribute vec3 color;
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        vColor = color;
        vAlpha = alpha;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        // Circular particle shape
        float dist = length(gl_PointCoord - vec2(0.5, 0.5));
        if (dist > 0.5) discard;

        // Soft edges
        float alpha = vAlpha * (1.0 - smoothstep(0.3, 0.5, dist));

        gl_FragColor = vec4(vColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  })

  // Create particle system
  particleSystem = new THREE.Points(geometry, material)
  scene.add(particleSystem)

  console.log('[Particles] System created with', MAX_PARTICLES, 'particle capacity')
}

/**
 * Set up event listeners for game events
 * @private
 */
function setupEventListeners() {
  // Player switched - create hit burst
  on('game:player-switched', handlePlayerSwitch)

  // Victory - create confetti
  on('game:victory', handleVictory)

  // Scene loaded - add ambient particles if 3D
  on('renderer:scene-loaded', handleSceneLoaded)

  // Game reset - clear particles
  on('game:reset', clearAll)
}

/**
 * Set up state subscriptions
 * @private
 */
function setupStateSubscriptions() {
  // Particles enabled/disabled
  subscribe('particlesEnabled', (enabled) => {
    setEnabled(enabled)
  })
}

/**
 * Handle player switch event - create hit burst
 * @private
 */
function handlePlayerSwitch(data) {
  if (!enabled || !initialized) return

  const { from, to } = data

  // Get timer position for hit burst
  const position = getTimerPosition(from)
  const color = getPlayerColor(from)

  createHitBurst(position, color, particles, () => getNextParticleIndex())
}

/**
 * Handle victory event - create confetti
 * @private
 */
function handleVictory(data) {
  if (!enabled || !initialized) return

  const { winner } = data
  createConfetti(winner, particles, () => getNextParticleIndex())
}

/**
 * Handle scene loaded event - add ambient particles if needed
 * @private
 */
function handleSceneLoaded(data) {
  if (!enabled || !initialized) return

  const { sceneName } = data

  // Only add ambient particles in 3D scenes (not classic 2D)
  if (sceneName !== 'classic') {
    createAmbientParticles(particles, () => getNextParticleIndex())
  }
}

/**
 * Get next available particle index (with pooling)
 * @private
 */
function getNextParticleIndex() {
  if (particles.length >= MAX_PARTICLES) {
    console.warn('[Particles] Max particles reached')
    return -1
  }
  return nextParticleIndex++
}

/**
 * Get timer position based on player
 * @param {number} player - Player number (1 or 2)
 * @returns {object} Position { x, y, z }
 * @private
 */
function getTimerPosition(player) {
  // Position timers vertically along Y axis
  // Player 1 is bottom (-3), Player 2 is top (+3)
  return {
    x: 0,
    y: player === 1 ? -3 : 3,
    z: 0
  }
}

/**
 * Get player color from state or default
 * @param {number} player - Player number (1 or 2)
 * @returns {object} RGB color { r, g, b }
 * @private
 */
function getPlayerColor(player) {
  // Get palette from state
  const paletteId = player === 1 ? get('player1Palette') : get('player2Palette')

  // For now, use royal purple for both
  // This can be expanded to parse gradients from CONFIG.PALETTES
  return { r: 0.4, g: 0.49, b: 0.92 }  // Royal purple
}

/**
 * Update all active particles
 * @param {number} deltaTime - Time elapsed since last frame (seconds)
 */
export function update(deltaTime) {
  if (!enabled || !initialized || particles.length === 0) return

  // Get buffer references
  const positions = particleSystem.geometry.attributes.position.array
  const colors = particleSystem.geometry.attributes.color.array
  const sizes = particleSystem.geometry.attributes.size.array
  const alphas = particleSystem.geometry.attributes.alpha.array

  // Update each particle (iterate backwards for safe removal)
  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i]

    // Decrement lifetime
    particle.life -= deltaTime

    // Remove dead particles
    if (particle.life <= 0) {
      // Clear from buffer
      const idx = particle.index
      alphas[idx] = 0
      sizes[idx] = 0

      // Remove from active array
      particles.splice(i, 1)
      continue
    }

    // Update physics
    particle.x += particle.vx * deltaTime
    particle.y += particle.vy * deltaTime
    particle.z += particle.vz * deltaTime

    // Apply gravity (unless ambient particle)
    if (!particle.ambient) {
      particle.vy -= GRAVITY * deltaTime
    }

    // Apply damping for ambient particles
    if (particle.ambient) {
      particle.vx *= 0.99
      particle.vz *= 0.99
    }

    // Wrap ambient particles around boundaries
    if (particle.ambient) {
      if (particle.y > 10) particle.y = -10
      if (particle.x > 10) particle.x = -10
      if (particle.x < -10) particle.x = 10
      if (particle.z > 10) particle.z = -10
      if (particle.z < -10) particle.z = 10
    }

    // Calculate fade based on lifetime
    particle.opacity = particle.life / particle.maxLife

    // Update buffer
    const idx = particle.index
    positions[idx * 3] = particle.x
    positions[idx * 3 + 1] = particle.y
    positions[idx * 3 + 2] = particle.z

    colors[idx * 3] = particle.r
    colors[idx * 3 + 1] = particle.g
    colors[idx * 3 + 2] = particle.b

    sizes[idx] = particle.size * particle.opacity
    alphas[idx] = particle.opacity
  }

  // Mark buffers as needing update
  particleSystem.geometry.attributes.position.needsUpdate = true
  particleSystem.geometry.attributes.color.needsUpdate = true
  particleSystem.geometry.attributes.size.needsUpdate = true
  particleSystem.geometry.attributes.alpha.needsUpdate = true
}

/**
 * Enable or disable particle system
 * @param {boolean} enable - True to enable, false to disable
 */
export function setEnabled(enable) {
  enabled = enable

  if (!enabled) {
    clearAll()
  }

  emit('particles:enabled-changed', { enabled })
}

/**
 * Clear all active particles
 */
export function clearAll() {
  if (!initialized) return

  // Clear buffer
  const alphas = particleSystem.geometry.attributes.alpha.array
  const sizes = particleSystem.geometry.attributes.size.array

  for (let i = 0; i < particles.length; i++) {
    const idx = particles[i].index
    alphas[idx] = 0
    sizes[idx] = 0
  }

  // Clear active particles array
  particles.length = 0

  // Mark buffers as needing update
  particleSystem.geometry.attributes.alpha.needsUpdate = true
  particleSystem.geometry.attributes.size.needsUpdate = true

  emit('particles:cleared')
}

/**
 * Get current particle count
 * @returns {number} Number of active particles
 */
export function getParticleCount() {
  return particles.length
}

/**
 * Check if system is initialized
 * @returns {boolean} True if initialized
 */
export function isInitialized() {
  return initialized
}

/**
 * Get particles array reference (for effects module)
 * @returns {Array} Reference to particles array
 * @private - Only for use by effects.js
 */
export function _getParticlesArray() {
  return particles
}

/**
 * Get next particle index function (for effects module)
 * @returns {function} Function to get next index
 * @private - Only for use by effects.js
 */
export function _getIndexFunction() {
  return getNextParticleIndex
}

// Expose for testing
if (typeof window !== 'undefined') {
  window.testParticles = particles
  window.testGetIndex = getNextParticleIndex
}
