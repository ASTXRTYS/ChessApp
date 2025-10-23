# Renderer Module

**Owner**: Renderer-Dev Agent
**Responsibility**: Three.js scene management, 3D environments, camera control

## Your Files

You OWN and can ONLY modify these files:
- `modules/renderer/scene-manager.js`
- `modules/renderer/camera.js`
- `modules/renderer/scenes/classic.js` (2D fallback)
- `modules/renderer/scenes/stadium.js` (3D arena - **BUILD THIS FIRST**)
- `modules/renderer/scenes/zen.js` (future)
- `modules/renderer/scenes/cyberpunk.js` (future)

## What You're Building

Immersive 3D scenes:
1. Scene management system (load/unload scenes)
2. Classic mode (enhanced 2D with Canvas - progressive enhancement)
3. **Stadium mode** (3D arena with floating timers - START HERE)
4. Camera animations and transitions
5. Dynamic lighting based on active player
6. Post-processing effects (bloom, DOF)

## Public API

### `scene-manager.js`
```javascript
export function init(canvasElement)
export function loadScene(sceneName)  // 'classic', 'stadium', 'zen'
export function unloadScene()
export function updateTimerDisplay(player, time)
export function setActivePlayer(player)
export function startRenderLoop()
export function stopRenderLoop()
export function resize()  // Handle window resize
```

### `camera.js`
```javascript
export function init(camera, scene)
export function animateTo(position, target, duration)
export function shake(intensity, duration)
export function orbit(enabled)  // Enable/disable orbital rotation
```

### Scene Interface (all scenes must implement)
```javascript
export default {
  name: 'stadium',

  async init(scene, camera) {
    // Set up 3D objects, lights, materials
  },

  update(deltaTime, gameState) {
    // Called every frame - animate scene
  },

  setActivePlayer(player) {
    // Update visual state (highlight active timer)
  },

  updateTimerDisplay(player, timeString) {
    // Update 3D timer text
  },

  destroy() {
    // Clean up resources
  }
}
```

## Events You Listen To

```javascript
import { on } from '../../core/events.js'

// Game events
on('game:started', (data) => {
  // Animate camera, start effects
})

on('game:player-switched', (data) => {
  setActivePlayer(data.to)
  // Camera transition, timer highlight
})

on('game:tick', (data) => {
  updateTimerDisplay(data.player, formatTime(data.timeRemaining))
})

on('game:low-time', (data) => {
  // Add urgency effects (pulsing, color shift)
})

on('game:critical-time', (data) => {
  shakeCamera(0.05, 500)  // Shake intensity
})

on('game:victory', (data) => {
  // Victory camera animation, effects
})

// UI events
on('ui:scene-changed', (data) => {
  loadScene(data.sceneName)
})
```

## Events You Emit

```javascript
import { emit } from '../../core/events.js'

emit('renderer:initialized')
emit('renderer:scene-loading', { sceneName: 'stadium' })
emit('renderer:scene-loaded', { sceneName: 'stadium' })
emit('renderer:scene-error', { error: error.message })
```

## State You Subscribe To

```javascript
import { subscribe } from '../../core/state.js'

subscribe('ambientMode', (sceneName) => {
  loadScene(sceneName)
})

subscribe('activePlayer', (player) => {
  if (currentScene) {
    currentScene.setActivePlayer(player)
  }
})
```

## Implementation Guide

### 1. Scene Manager Setup (`scene-manager.js`)

```javascript
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js'
import { emit, on } from '../../core/events.js'
import { subscribe, get } from '../../core/state.js'
import { init as initCamera } from './camera.js'

let renderer = null
let scene = null
let camera = null
let currentScene = null
let animationFrame = null
let canvas = null
let initialized = false

export async function init(canvasElement) {
  if (initialized) return

  canvas = canvasElement

  try {
    // Set up Three.js renderer
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Create scene
    scene = new THREE.Scene()

    // Create camera
    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.z = 5

    // Initialize camera controller
    initCamera(camera, scene)

    // Set up event listeners
    setupEventListeners()
    setupStateSubscriptions()

    // Handle resize
    window.addEventListener('resize', handleResize)

    initialized = true
    emit('renderer:initialized')

    // Load default scene
    const defaultScene = get('ambientMode') || 'classic'
    await loadScene(defaultScene)

  } catch (error) {
    console.error('[Renderer] Initialization failed:', error)
    emit('renderer:scene-error', { error: error.message })
  }
}

function setupEventListeners() {
  on('game:player-switched', handlePlayerSwitch)
  on('game:tick', handleTick)
  on('game:victory', handleVictory)
  on('ui:scene-changed', (data) => loadScene(data.sceneName))
}

function handleResize() {
  if (!camera || !renderer) return

  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}
```

### 2. Scene Loading

```javascript
export async function loadScene(sceneName) {
  try {
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

  } catch (error) {
    console.error(`[Renderer] Failed to load scene "${sceneName}":`, error)
    emit('renderer:scene-error', { error: error.message })

    // Fall back to classic mode
    if (sceneName !== 'classic') {
      loadScene('classic')
    }
  }
}

export async function unloadScene() {
  if (currentScene) {
    stopRenderLoop()
    await currentScene.destroy()
    currentScene = null

    // Clear scene
    while(scene.children.length > 0) {
      scene.remove(scene.children[0])
    }
  }
}
```

### 3. Render Loop

```javascript
export function startRenderLoop() {
  if (animationFrame) return

  const clock = new THREE.Clock()

  function animate() {
    animationFrame = requestAnimationFrame(animate)

    const deltaTime = clock.getDelta()

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
    renderer.render(scene, camera)
  }

  animate()
}

export function stopRenderLoop() {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
    animationFrame = null
  }
}
```

### 4. **PRIORITY**: Stadium Scene (`scenes/stadium.js`)

This is your main deliverable. Build this FIRST.

```javascript
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js'
import { FontLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/geometries/TextGeometry.js'

let timer1Mesh, timer2Mesh
let timer1Text, timer2Text
let spotlight1, spotlight2
let ambientLight
let font

export default {
  name: 'stadium',

  async init(scene, camera) {
    // Load font for timer text
    const loader = new FontLoader()
    font = await new Promise((resolve, reject) => {
      loader.load(
        'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json',
        resolve,
        undefined,
        reject
      )
    })

    // Camera position (low angle looking up)
    camera.position.set(0, -2, 8)
    camera.lookAt(0, 0, 0)

    // Ambient light (dim)
    ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
    scene.add(ambientLight)

    // Spotlights for timers
    spotlight1 = new THREE.SpotLight(0x667eea, 2)
    spotlight1.position.set(0, -5, 5)
    spotlight1.target.position.set(0, -3, 0)
    spotlight1.angle = Math.PI / 6
    spotlight1.penumbra = 0.5
    scene.add(spotlight1)
    scene.add(spotlight1.target)

    spotlight2 = new THREE.SpotLight(0x667eea, 0.5)  // Inactive
    spotlight2.position.set(0, 5, 5)
    spotlight2.target.position.set(0, 3, 0)
    spotlight2.angle = Math.PI / 6
    spotlight2.penumbra = 0.5
    scene.add(spotlight2)
    scene.add(spotlight2.target)

    // Timer 1 (bottom)
    timer1Mesh = createTimerMesh()
    timer1Mesh.position.set(0, -3, 0)
    scene.add(timer1Mesh)

    // Timer 1 text
    timer1Text = createTimerText('05:00')
    timer1Text.position.set(-1.5, -3, 0.6)
    scene.add(timer1Text)

    // Timer 2 (top, rotated)
    timer2Mesh = createTimerMesh()
    timer2Mesh.position.set(0, 3, 0)
    timer2Mesh.rotation.z = Math.PI  // Flip 180°
    scene.add(timer2Mesh)

    // Timer 2 text (also rotated)
    timer2Text = createTimerText('05:00')
    timer2Text.position.set(-1.5, 3, 0.6)
    timer2Text.rotation.z = Math.PI
    scene.add(timer2Text)

    // Arena floor
    const floorGeometry = new THREE.PlaneGeometry(20, 20)
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.5,
      roughness: 0.8
    })
    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -5
    scene.add(floor)

    // Particle effects (ambient floating embers)
    createAmbientParticles(scene)
  },

  update(deltaTime, gameState) {
    // Gentle floating animation on timers
    if (timer1Mesh) {
      timer1Mesh.position.y = -3 + Math.sin(Date.now() * 0.001) * 0.1
    }
    if (timer2Mesh) {
      timer2Mesh.position.y = 3 + Math.sin(Date.now() * 0.001 + Math.PI) * 0.1
    }

    // Pulse active spotlight
    if (gameState.activePlayer === 1 && spotlight1) {
      spotlight1.intensity = 2 + Math.sin(Date.now() * 0.003) * 0.5
    }
    if (gameState.activePlayer === 2 && spotlight2) {
      spotlight2.intensity = 2 + Math.sin(Date.now() * 0.003) * 0.5
    }
  },

  setActivePlayer(player) {
    // Update spotlight intensity
    if (spotlight1 && spotlight2) {
      if (player === 1) {
        spotlight1.intensity = 2
        spotlight2.intensity = 0.5
      } else if (player === 2) {
        spotlight1.intensity = 0.5
        spotlight2.intensity = 2
      } else {
        spotlight1.intensity = 0.5
        spotlight2.intensity = 0.5
      }
    }
  },

  updateTimerDisplay(player, timeString) {
    // Update 3D text
    const textMesh = player === 1 ? timer1Text : timer2Text
    if (textMesh && font) {
      // Remove old text
      textMesh.parent.remove(textMesh)

      // Create new text
      const newText = createTimerText(timeString)
      newText.position.copy(textMesh.position)
      newText.rotation.copy(textMesh.rotation)

      if (player === 1) {
        timer1Text = newText
      } else {
        timer2Text = newText
      }
    }
  },

  destroy() {
    // Clean up resources
    // (Three.js objects will be removed by scene-manager)
  }
}

// Helper functions
function createTimerMesh() {
  const geometry = new THREE.CylinderGeometry(2, 2, 0.5, 32)
  const material = new THREE.MeshStandardMaterial({
    color: 0x2d3748,
    metalness: 0.7,
    roughness: 0.3,
    emissive: 0x667eea,
    emissiveIntensity: 0.2
  })
  return new THREE.Mesh(geometry, material)
}

function createTimerText(text) {
  const geometry = new TextGeometry(text, {
    font: font,
    size: 0.8,
    height: 0.2
  })
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 0.5
  })
  return new THREE.Mesh(geometry, material)
}

function createAmbientParticles(scene) {
  const particleCount = 50
  const positions = []

  for (let i = 0; i < particleCount; i++) {
    positions.push(
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20
    )
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))

  const material = new THREE.PointsMaterial({
    color: 0xff6600,
    size: 0.1,
    transparent: true,
    opacity: 0.6
  })

  const particles = new THREE.Points(geometry, material)
  scene.add(particles)
}
```

### 5. Classic Scene (2D Fallback)

```javascript
// scenes/classic.js
// This is a canvas 2D fallback for devices without WebGL

export default {
  name: 'classic',

  async init(scene, camera) {
    // No 3D objects - just set up camera for 2D overlay
    camera.position.set(0, 0, 5)
  },

  update(deltaTime, gameState) {
    // No animation needed
  },

  setActivePlayer(player) {
    // UI module handles this in 2D mode
  },

  updateTimerDisplay(player, timeString) {
    // UI module handles this
  },

  destroy() {
    // Nothing to clean up
  }
}
```

## Testing

1. Open `index.html` in browser
2. Check console for renderer initialization
3. Verify stadium scene loads
4. Test timer updates in 3D
5. Test active player spotlight switching
6. Test camera animations
7. Check FPS (should be 60fps)

## Completion Checklist

- [ ] Scene manager initializes Three.js
- [ ] Stadium scene loads successfully
- [ ] Floating timer cylinders render
- [ ] 3D timer text displays correctly
- [ ] Timer text updates each second
- [ ] Spotlights highlight active player
- [ ] Camera animations work
- [ ] Ambient particles float
- [ ] Render loop maintains 60fps
- [ ] Scene switching works (classic ↔ stadium)
- [ ] Resize handling works
- [ ] Falls back to classic on error

## Critical Rules

❌ DON'T touch DOM outside canvas
❌ DON'T modify game state
❌ DON'T import from modules other than core/
✅ DO use Three.js from CDN
✅ DO clean up resources in destroy()
✅ DO handle errors gracefully
✅ DO maintain 60fps
✅ DO emit scene-loading/loaded events

Build the stadium scene FIRST - make it jaw-dropping! 🏟️
