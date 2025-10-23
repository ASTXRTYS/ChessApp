/**
 * Stadium Scene - Cinematic 3D Chess Clock Arena
 *
 * Features:
 * - Floating timer cylinders in 3D space
 * - Dynamic 3D text for time display
 * - Spotlights that highlight active player
 * - Arena floor with metallic finish
 * - Ambient floating particles (embers)
 * - Smooth animations and transitions
 */

import * as THREE from 'three'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'

// Scene objects
let timer1Mesh = null
let timer2Mesh = null
let timer1Text = null
let timer2Text = null
let spotlight1 = null
let spotlight2 = null
let ambientLight = null
let hemisphereLight = null
let font = null
let particles = null
let floor = null

// Animation state
let time = 0

export default {
  name: 'stadium',

  async init(scene, camera) {
    console.log('[Stadium] Initializing 3D arena...')

    try {
      // Load font for 3D timer text
      await loadFont()

      // Set up camera (slightly elevated, centered view)
      camera.position.set(0, 0, 10)
      camera.lookAt(0, 0, 0)

      // Lighting setup
      setupLighting(scene)

      // Create timer displays
      createTimer1(scene)
      createTimer2(scene)

      // Create arena floor
      createFloor(scene)

      // Create ambient particles
      createAmbientParticles(scene)

      // Optional: Add rim lights for depth
      createRimLights(scene)

      console.log('[Stadium] ✅ Scene initialized')

    } catch (error) {
      console.error('[Stadium] ❌ Initialization failed:', error)
      throw error
    }
  },

  update(deltaTime, gameState) {
    time += deltaTime

    // Gentle floating animation on timer cylinders
    if (timer1Mesh) {
      timer1Mesh.position.y = -2.5 + Math.sin(time * 0.8) * 0.1
      timer1Mesh.rotation.y += deltaTime * 0.2
    }

    if (timer2Mesh) {
      timer2Mesh.position.y = 2.5 + Math.sin(time * 0.8 + Math.PI) * 0.1
      timer2Mesh.rotation.y -= deltaTime * 0.2
    }

    // Sync text position with cylinders
    if (timer1Text && timer1Mesh) {
      timer1Text.position.y = timer1Mesh.position.y
    }

    if (timer2Text && timer2Mesh) {
      timer2Text.position.y = timer2Mesh.position.y
    }

    // Pulse active spotlight
    if (gameState.activePlayer === 1 && spotlight1) {
      spotlight1.intensity = 3 + Math.sin(time * 2) * 0.5
    }

    if (gameState.activePlayer === 2 && spotlight2) {
      spotlight2.intensity = 3 + Math.sin(time * 2) * 0.5
    }

    // Animate particles
    if (particles) {
      particles.rotation.y += deltaTime * 0.05

      // Animate particle positions (slow float)
      const positions = particles.geometry.attributes.position.array
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(time + i) * 0.001 // Subtle Y movement
      }
      particles.geometry.attributes.position.needsUpdate = true
    }
  },

  setActivePlayer(player) {
    console.log('[Stadium] Active player:', player)

    // Update spotlight intensity with smooth transition
    if (spotlight1 && spotlight2) {
      if (player === 1) {
        // Player 1 active
        spotlight1.intensity = 3
        spotlight2.intensity = 0.5

        // Update timer materials
        if (timer1Mesh && timer1Mesh.material) {
          timer1Mesh.material.emissiveIntensity = 0.5
        }
        if (timer2Mesh && timer2Mesh.material) {
          timer2Mesh.material.emissiveIntensity = 0.1
        }
      } else if (player === 2) {
        // Player 2 active
        spotlight1.intensity = 0.5
        spotlight2.intensity = 3

        // Update timer materials
        if (timer1Mesh && timer1Mesh.material) {
          timer1Mesh.material.emissiveIntensity = 0.1
        }
        if (timer2Mesh && timer2Mesh.material) {
          timer2Mesh.material.emissiveIntensity = 0.5
        }
      } else {
        // No active player
        spotlight1.intensity = 1
        spotlight2.intensity = 1

        if (timer1Mesh && timer1Mesh.material) {
          timer1Mesh.material.emissiveIntensity = 0.2
        }
        if (timer2Mesh && timer2Mesh.material) {
          timer2Mesh.material.emissiveIntensity = 0.2
        }
      }
    }
  },

  updateTimerDisplay(player, timeString) {
    const scene = timer1Text?.parent

    if (!scene || !font) return

    if (player === 1) {
      // Remove old text
      if (timer1Text) {
        scene.remove(timer1Text)
        timer1Text.geometry?.dispose()
        timer1Text.material?.dispose()
      }

      // Create new text
      timer1Text = createTimerText(timeString)
      timer1Text.position.set(-1.8, timer1Mesh?.position.y || -2.5, 0.35)
      scene.add(timer1Text)

    } else if (player === 2) {
      // Remove old text
      if (timer2Text) {
        scene.remove(timer2Text)
        timer2Text.geometry?.dispose()
        timer2Text.material?.dispose()
      }

      // Create new text
      timer2Text = createTimerText(timeString)
      timer2Text.position.set(-1.8, timer2Mesh?.position.y || 2.5, 0.35)
      timer2Text.rotation.z = Math.PI // Flip 180° for player 2
      scene.add(timer2Text)
    }
  },

  destroy() {
    console.log('[Stadium] Cleaning up scene...')

    // Dispose geometries and materials
    if (timer1Mesh) {
      timer1Mesh.geometry?.dispose()
      timer1Mesh.material?.dispose()
    }
    if (timer2Mesh) {
      timer2Mesh.geometry?.dispose()
      timer2Mesh.material?.dispose()
    }
    if (timer1Text) {
      timer1Text.geometry?.dispose()
      timer1Text.material?.dispose()
    }
    if (timer2Text) {
      timer2Text.geometry?.dispose()
      timer2Text.material?.dispose()
    }
    if (floor) {
      floor.geometry?.dispose()
      floor.material?.dispose()
    }
    if (particles) {
      particles.geometry?.dispose()
      particles.material?.dispose()
    }

    // Clear references
    timer1Mesh = null
    timer2Mesh = null
    timer1Text = null
    timer2Text = null
    spotlight1 = null
    spotlight2 = null
    ambientLight = null
    hemisphereLight = null
    floor = null
    particles = null

    console.log('[Stadium] ✅ Cleanup complete')
  }
}

// Helper Functions

/**
 * Load font for 3D text
 */
async function loadFont() {
  return new Promise((resolve, reject) => {
    const loader = new FontLoader()
    loader.load(
      'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json',
      (loadedFont) => {
        font = loadedFont
        console.log('[Stadium] Font loaded')
        resolve()
      },
      undefined,
      (error) => {
        console.error('[Stadium] Font loading failed:', error)
        reject(error)
      }
    )
  })
}

/**
 * Set up scene lighting
 */
function setupLighting(scene) {
  // Ambient light (dim base illumination)
  ambientLight = new THREE.AmbientLight(0xffffff, 0.2)
  scene.add(ambientLight)

  // Hemisphere light (sky and ground colors)
  hemisphereLight = new THREE.HemisphereLight(0x667eea, 0x0f172a, 0.4)
  scene.add(hemisphereLight)

  // Spotlight for Player 1 (bottom timer)
  spotlight1 = new THREE.SpotLight(0x667eea, 3, 20, Math.PI / 6, 0.5, 2)
  spotlight1.position.set(0, -4, 5)
  spotlight1.target.position.set(0, -2.5, 0)
  spotlight1.castShadow = true
  spotlight1.shadow.mapSize.width = 1024
  spotlight1.shadow.mapSize.height = 1024
  scene.add(spotlight1)
  scene.add(spotlight1.target)

  // Spotlight for Player 2 (top timer)
  spotlight2 = new THREE.SpotLight(0x667eea, 0.5, 20, Math.PI / 6, 0.5, 2)
  spotlight2.position.set(0, 4, 5)
  spotlight2.target.position.set(0, 2.5, 0)
  spotlight2.castShadow = true
  spotlight2.shadow.mapSize.width = 1024
  spotlight2.shadow.mapSize.height = 1024
  scene.add(spotlight2)
  scene.add(spotlight2.target)
}

/**
 * Create Player 1 timer (bottom)
 */
function createTimer1(scene) {
  timer1Mesh = createTimerMesh()
  timer1Mesh.position.set(0, -2.5, 0)  // Moved up slightly
  timer1Mesh.castShadow = true
  timer1Mesh.receiveShadow = true
  scene.add(timer1Mesh)

  // Initial text - larger and centered on cylinder
  timer1Text = createTimerText('05:00')
  timer1Text.position.set(-1.8, -2.5, 0.35)  // Centered on cylinder
  scene.add(timer1Text)
}

/**
 * Create Player 2 timer (top, rotated)
 */
function createTimer2(scene) {
  timer2Mesh = createTimerMesh()
  timer2Mesh.position.set(0, 2.5, 0)  // Moved down slightly
  timer2Mesh.rotation.z = Math.PI // Flip 180°
  timer2Mesh.castShadow = true
  timer2Mesh.receiveShadow = true
  scene.add(timer2Mesh)

  // Initial text (also rotated) - larger and centered
  timer2Text = createTimerText('05:00')
  timer2Text.position.set(-1.8, 2.5, 0.35)  // Centered on cylinder
  timer2Text.rotation.z = Math.PI
  scene.add(timer2Text)
}

/**
 * Create a timer cylinder mesh
 */
function createTimerMesh() {
  const geometry = new THREE.CylinderGeometry(2.5, 2.5, 0.6, 64)
  const material = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.8,
    roughness: 0.2,
    emissive: 0x667eea,
    emissiveIntensity: 0.2
  })

  const mesh = new THREE.Mesh(geometry, material)
  return mesh
}

/**
 * Create 3D timer text
 */
function createTimerText(text) {
  if (!font) {
    console.warn('[Stadium] Font not loaded yet')
    return new THREE.Object3D()
  }

  const geometry = new TextGeometry(text, {
    font: font,
    size: 1.2,          // Increased from 0.9
    height: 0.25,       // Increased from 0.2
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.03,  // Increased from 0.02
    bevelSize: 0.03,       // Increased from 0.02
    bevelSegments: 5
  })

  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.3,
    roughness: 0.4,
    emissive: 0xffffff,
    emissiveIntensity: 0.8  // Increased from 0.6 for more glow
  })

  const mesh = new THREE.Mesh(geometry, material)
  mesh.castShadow = true
  return mesh
}

/**
 * Create arena floor
 */
function createFloor(scene) {
  const geometry = new THREE.PlaneGeometry(30, 30, 32, 32)
  const material = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.6,
    roughness: 0.7,
    side: THREE.DoubleSide
  })

  floor = new THREE.Mesh(geometry, material)
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -5
  floor.receiveShadow = true
  scene.add(floor)

  // Add grid overlay for arena effect
  const gridHelper = new THREE.GridHelper(30, 30, 0x667eea, 0x1e293b)
  gridHelper.position.y = -4.9
  gridHelper.material.opacity = 0.3
  gridHelper.material.transparent = true
  scene.add(gridHelper)
}

/**
 * Create ambient floating particles (embers/dust)
 */
function createAmbientParticles(scene) {
  const particleCount = 100
  const positions = []
  const colors = []
  const sizes = []

  for (let i = 0; i < particleCount; i++) {
    // Random positions in a sphere around origin
    const radius = 8 + Math.random() * 4
    const theta = Math.random() * Math.PI * 2
    const phi = Math.random() * Math.PI

    positions.push(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.sin(phi) * Math.sin(theta) - 1,
      radius * Math.cos(phi)
    )

    // Random colors (purple to orange)
    const color = new THREE.Color()
    color.setHSL(0.6 + Math.random() * 0.1, 0.8, 0.5)
    colors.push(color.r, color.g, color.b)

    // Random sizes
    sizes.push(Math.random() * 0.15 + 0.05)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1))

  const material = new THREE.PointsMaterial({
    size: 0.15,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  })

  particles = new THREE.Points(geometry, material)
  scene.add(particles)
}

/**
 * Add rim lights for cinematic depth
 */
function createRimLights(scene) {
  // Back light (left)
  const backLight1 = new THREE.PointLight(0xff6600, 0.5, 20)
  backLight1.position.set(-8, 0, -5)
  scene.add(backLight1)

  // Back light (right)
  const backLight2 = new THREE.PointLight(0x667eea, 0.5, 20)
  backLight2.position.set(8, 0, -5)
  scene.add(backLight2)

  // Top fill light
  const topLight = new THREE.PointLight(0xffffff, 0.3, 15)
  topLight.position.set(0, 8, 2)
  scene.add(topLight)
}
