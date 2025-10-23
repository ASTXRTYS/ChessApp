/**
 * Classic Scene - 2D Fallback Mode
 *
 * A minimal 3D scene that serves as a fallback for devices without
 * WebGL support or when the stadium scene fails to load.
 *
 * This scene is intentionally simple - the UI module handles the
 * visual timer display in 2D mode.
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js'

let ambientLight = null
let directionalLight = null

export default {
  name: 'classic',

  async init(scene, camera) {
    console.log('[Classic] Initializing 2D fallback scene...')

    // Simple camera setup (just looking forward)
    camera.position.set(0, 0, 5)
    camera.lookAt(0, 0, 0)

    // Basic lighting
    ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
    directionalLight.position.set(0, 5, 5)
    scene.add(directionalLight)

    // Optional: Add a subtle animated background element
    createBackgroundElement(scene)

    console.log('[Classic] ✅ Scene initialized (2D mode)')
  },

  update(deltaTime, gameState) {
    // Minimal animation - just for visual interest
    // The UI module handles all timer display in this mode
  },

  setActivePlayer(player) {
    // UI module handles visual feedback in 2D mode
    console.log('[Classic] Active player (handled by UI):', player)
  },

  updateTimerDisplay(player, timeString) {
    // UI module handles timer display in 2D mode
    // This scene doesn't render 3D timers
  },

  destroy() {
    console.log('[Classic] Cleaning up scene...')

    // Minimal cleanup needed
    ambientLight = null
    directionalLight = null

    console.log('[Classic] ✅ Cleanup complete')
  }
}

/**
 * Create a subtle animated background element
 * (just so the canvas isn't completely empty)
 */
function createBackgroundElement(scene) {
  // Create a subtle gradient plane or particle effect
  // This is optional - just adds visual polish

  const geometry = new THREE.PlaneGeometry(20, 20)
  const material = new THREE.MeshBasicMaterial({
    color: 0x0f172a,
    transparent: true,
    opacity: 0.3
  })

  const plane = new THREE.Mesh(geometry, material)
  plane.position.z = -5
  scene.add(plane)

  // Optional: Add some floating particles for ambience
  const particleCount = 30
  const positions = []

  for (let i = 0; i < particleCount; i++) {
    positions.push(
      (Math.random() - 0.5) * 15,
      (Math.random() - 0.5) * 15,
      (Math.random() - 0.5) * 10 - 5
    )
  }

  const particleGeometry = new THREE.BufferGeometry()
  particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))

  const particleMaterial = new THREE.PointsMaterial({
    color: 0x667eea,
    size: 0.05,
    transparent: true,
    opacity: 0.3
  })

  const particles = new THREE.Points(particleGeometry, particleMaterial)
  scene.add(particles)
}
