/**
 * Camera Controller - Camera Animations and Effects
 *
 * Provides smooth camera animations, shake effects, and orbital controls.
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js'

let camera = null
let scene = null
let originalPosition = new THREE.Vector3()
let originalTarget = new THREE.Vector3()
let isAnimating = false
let shakeActive = false

/**
 * Initialize camera controller
 * @param {THREE.Camera} cam - Three.js camera
 * @param {THREE.Scene} scn - Three.js scene
 */
export function init(cam, scn) {
  camera = cam
  scene = scn
  originalPosition.copy(camera.position)
  originalTarget.set(0, 0, 0)
  console.log('[Camera] Initialized')
}

/**
 * Animate camera to a new position
 * @param {THREE.Vector3} targetPosition - Target camera position
 * @param {THREE.Vector3} targetLookAt - Target look-at point
 * @param {number} duration - Animation duration in ms
 * @returns {Promise} Resolves when animation completes
 */
export function animateTo(targetPosition, targetLookAt, duration = 1000) {
  return new Promise((resolve) => {
    if (!camera) {
      console.warn('[Camera] Camera not initialized')
      resolve()
      return
    }

    isAnimating = true

    const startPosition = camera.position.clone()
    const startLookAt = originalTarget.clone()
    const startTime = Date.now()

    function animate() {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease in-out cubic
      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2

      // Interpolate position
      camera.position.lerpVectors(startPosition, targetPosition, eased)

      // Interpolate look-at
      const currentLookAt = new THREE.Vector3()
      currentLookAt.lerpVectors(startLookAt, targetLookAt, eased)
      camera.lookAt(currentLookAt)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        isAnimating = false
        originalPosition.copy(camera.position)
        originalTarget.copy(targetLookAt)
        resolve()
      }
    }

    animate()
  })
}

/**
 * Shake camera (for impact effects)
 * @param {number} intensity - Shake intensity (0.01 - 0.1)
 * @param {number} duration - Shake duration in ms
 * @returns {Promise} Resolves when shake completes
 */
export function shake(intensity = 0.05, duration = 500) {
  return new Promise((resolve) => {
    if (!camera || shakeActive) {
      resolve()
      return
    }

    shakeActive = true

    const basePosition = camera.position.clone()
    const startTime = Date.now()

    function shakeLoop() {
      const elapsed = Date.now() - startTime
      const progress = elapsed / duration

      if (progress >= 1) {
        // Reset to base position
        camera.position.copy(basePosition)
        shakeActive = false
        resolve()
        return
      }

      // Decay shake over time
      const decayFactor = 1 - progress

      // Random offset in all directions
      const offsetX = (Math.random() - 0.5) * intensity * decayFactor
      const offsetY = (Math.random() - 0.5) * intensity * decayFactor
      const offsetZ = (Math.random() - 0.5) * intensity * decayFactor

      camera.position.set(
        basePosition.x + offsetX,
        basePosition.y + offsetY,
        basePosition.z + offsetZ
      )

      requestAnimationFrame(shakeLoop)
    }

    shakeLoop()
  })
}

/**
 * Enable/disable orbital camera rotation
 * @param {boolean} enabled - Enable or disable orbit
 */
export function orbit(enabled) {
  // Simple orbit implementation
  if (enabled) {
    console.log('[Camera] Orbit enabled')
    // TODO: Implement smooth orbital rotation
  } else {
    console.log('[Camera] Orbit disabled')
  }
}

/**
 * Reset camera to original position
 * @param {number} duration - Animation duration in ms
 * @returns {Promise} Resolves when reset completes
 */
export function reset(duration = 1000) {
  return animateTo(originalPosition, originalTarget, duration)
}

/**
 * Zoom camera in/out
 * @param {number} factor - Zoom factor (< 1 = zoom in, > 1 = zoom out)
 * @param {number} duration - Animation duration in ms
 */
export function zoom(factor, duration = 500) {
  if (!camera) return

  const targetPosition = originalPosition.clone().multiplyScalar(factor)
  return animateTo(targetPosition, originalTarget, duration)
}

/**
 * Pan camera (move parallel to view plane)
 * @param {number} x - Horizontal pan amount
 * @param {number} y - Vertical pan amount
 * @param {number} duration - Animation duration in ms
 */
export function pan(x, y, duration = 500) {
  if (!camera) return

  const targetPosition = camera.position.clone()
  targetPosition.x += x
  targetPosition.y += y

  return animateTo(targetPosition, originalTarget, duration)
}

/**
 * Get current camera state
 */
export function getState() {
  if (!camera) return null

  return {
    position: camera.position.clone(),
    rotation: camera.rotation.clone(),
    isAnimating,
    shakeActive
  }
}

/**
 * Check if camera is currently animating
 */
export function isActive() {
  return isAnimating || shakeActive
}
