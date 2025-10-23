# Particles Module

**Owner**: Particle-Dev Agent
**Responsibility**: Particle effects (hit bursts, confetti, ambient effects)

## Your Files

You OWN and can ONLY modify these files:
- `modules/particles/system.js`
- `modules/particles/effects.js`

## What You're Building

Visual effects to enhance immersion:
1. Hit burst when timer is clicked (radial explosion of particles)
2. Victory confetti (celebratory particle cannon)
3. Ambient particles (floating embers in background)
4. Trail effects (future: motion trails)

## Public API

### `system.js`
```javascript
export function init(scene)  // Three.js scene OR canvas context
export function update(deltaTime)
export function setEnabled(enabled)
export function clearAll()
```

### `effects.js`
```javascript
export function createHitBurst(position, color)
export function createConfetti(winner)
export function createAmbientParticles()
export function createTrail(start, end, color)  // Future
```

## Events You Listen To

```javascript
import { on } from '../../core/events.js'

// Player clicks timer
on('game:player-switched', (data) => {
  // Create hit burst at timer position
  const position = getTimerPosition(data.from)
  const color = getPlayerColor(data.from)
  createHitBurst(position, color)
})

// Game over
on('game:victory', (data) => {
  // Confetti explosion for winner
  createConfetti(data.winner)
})

// Scene loaded
on('renderer:scene-loaded', (data) => {
  // Add ambient particles if 3D scene
  if (data.sceneName !== 'classic') {
    createAmbientParticles()
  }
})
```

## Events You Emit

```javascript
import { emit } from '../../core/events.js'

emit('particles:initialized')
emit('particles:burst-created', { position, count })
```

## State You Subscribe To

```javascript
import { subscribe } from '../../core/state.js'

subscribe('particlesEnabled', (enabled) => {
  setEnabled(enabled)
})
```

## Implementation Guide

### 1. System Setup (`system.js`)

```javascript
import { emit, on } from '../../core/events.js'
import { subscribe } from '../../core/state.js'
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js'

let scene = null
let particleSystem = null
let particles = []  // Active particles array
let enabled = true
let initialized = false

export function init(threeScene) {
  if (initialized) return

  scene = threeScene

  // Create particle system
  setupParticleSystem()

  // Set up event listeners
  setupEventListeners()
  setupStateSubscriptions()

  initialized = true
  emit('particles:initialized')
}

function setupParticleSystem() {
  // Create a pool of particles (object pooling for performance)
  const maxParticles = 1000
  const positions = new Float32Array(maxParticles * 3)
  const colors = new Float32Array(maxParticles * 3)
  const sizes = new Float32Array(maxParticles)

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

  const material = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  })

  particleSystem = new THREE.Points(geometry, material)
  scene.add(particleSystem)
}

function setupEventListeners() {
  on('game:player-switched', handlePlayerSwitch)
  on('game:victory', handleVictory)
  on('renderer:scene-loaded', handleSceneLoaded)
}

export function update(deltaTime) {
  if (!enabled || particles.length === 0) return

  const positions = particleSystem.geometry.attributes.position.array
  const colors = particleSystem.geometry.attributes.color.array
  const sizes = particleSystem.geometry.attributes.size.array

  // Update each active particle
  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i]

    particle.life -= deltaTime
    if (particle.life <= 0) {
      // Remove dead particle
      particles.splice(i, 1)
      continue
    }

    // Update position
    particle.x += particle.vx * deltaTime
    particle.y += particle.vy * deltaTime
    particle.z += particle.vz * deltaTime

    // Apply gravity
    particle.vy -= 9.8 * deltaTime

    // Fade out
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
  }

  // Mark buffers as needing update
  particleSystem.geometry.attributes.position.needsUpdate = true
  particleSystem.geometry.attributes.color.needsUpdate = true
  particleSystem.geometry.attributes.size.needsUpdate = true
}

export function setEnabled(enable) {
  enabled = enable
  if (!enabled) {
    clearAll()
  }
}

export function clearAll() {
  particles = []
}
```

### 2. Effects (`effects.js`)

```javascript
import { emit } from '../../core/events.js'
import { CONFIG } from '../../core/config.js'

let particleIndex = 0
const particles = []  // Reference to system's particles array

export function setParticlesArray(particlesRef) {
  particles.length = 0
  particles.push(...particlesRef)
}

/**
 * Create radial burst of particles
 * @param {object} position - { x, y, z }
 * @param {object} color - { r, g, b }
 */
export function createHitBurst(position, color) {
  const count = 30
  const speed = 5

  for (let i = 0; i < count; i++) {
    // Random direction in hemisphere
    const theta = Math.random() * Math.PI * 2
    const phi = Math.random() * Math.PI / 2

    const vx = Math.sin(phi) * Math.cos(theta) * speed
    const vy = Math.random() * 2 + 1  // Slight upward bias
    const vz = Math.sin(phi) * Math.sin(theta) * speed

    particles.push({
      index: particleIndex++,
      x: position.x,
      y: position.y,
      z: position.z,
      vx, vy, vz,
      r: color.r,
      g: color.g,
      b: color.b,
      size: 0.15,
      life: 1.0,
      maxLife: 1.0,
      opacity: 1.0
    })
  }

  emit('particles:burst-created', { position, count })
}

/**
 * Create confetti explosion for winner
 * @param {number} winner - Player number (1 or 2)
 */
export function createConfetti(winner) {
  const count = 100
  const position = {
    x: 0,
    y: winner === 1 ? -3 : 3,
    z: 0
  }

  for (let i = 0; i < count; i++) {
    // Random colors (festive)
    const colors = [
      { r: 1, g: 0, b: 0 },      // Red
      { r: 1, g: 0.84, b: 0 },   // Gold
      { r: 0, g: 0.5, b: 1 },    // Blue
      { r: 1, g: 0.4, b: 0.7 },  // Pink
      { r: 0.5, g: 1, b: 0 }     // Green
    ]
    const color = colors[Math.floor(Math.random() * colors.length)]

    // Explosive upward velocity
    const angle = Math.random() * Math.PI * 2
    const speed = Math.random() * 10 + 5

    particles.push({
      index: particleIndex++,
      x: position.x + (Math.random() - 0.5) * 2,
      y: position.y,
      z: position.z + (Math.random() - 0.5) * 2,
      vx: Math.cos(angle) * speed,
      vy: Math.random() * 15 + 10,  // Strong upward
      vz: Math.sin(angle) * speed,
      r: color.r,
      g: color.g,
      b: color.b,
      size: 0.2,
      life: 3.0,
      maxLife: 3.0,
      opacity: 1.0
    })
  }
}

/**
 * Create ambient floating particles (embers)
 */
export function createAmbientParticles() {
  const count = 50

  for (let i = 0; i < count; i++) {
    particles.push({
      index: particleIndex++,
      x: (Math.random() - 0.5) * 20,
      y: (Math.random() - 0.5) * 20,
      z: (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 0.5,
      vy: Math.random() * 0.5 + 0.2,  // Slow upward drift
      vz: (Math.random() - 0.5) * 0.5,
      r: 1,
      g: 0.4,
      b: 0,
      size: 0.08,
      life: Infinity,  // Never dies
      maxLife: Infinity,
      opacity: 0.6
    })
  }
}

/**
 * Get timer position based on player
 * @param {number} player
 * @returns {object} Position { x, y, z }
 */
function getTimerPosition(player) {
  return {
    x: 0,
    y: player === 1 ? -3 : 3,
    z: 0
  }
}

/**
 * Get player color
 * @param {number} player
 * @returns {object} RGB { r, g, b }
 */
function getPlayerColor(player) {
  // Get from state or use default
  return player === 1
    ? { r: 0.4, g: 0.49, b: 0.92 }  // Royal purple
    : { r: 0.4, g: 0.49, b: 0.92 }
}
```

### 3. Event Handlers

```javascript
function handlePlayerSwitch(data) {
  const position = {
    x: 0,
    y: data.from === 1 ? -3 : 3,
    z: 0
  }
  const color = { r: 0.4, g: 0.5, b: 0.9 }

  createHitBurst(position, color)
}

function handleVictory(data) {
  createConfetti(data.winner)
}

function handleSceneLoaded(data) {
  if (data.sceneName !== 'classic') {
    createAmbientParticles()
  }
}
```

## Integration with Renderer

The renderer module will call your `update()` function in its render loop:

```javascript
// In renderer/scene-manager.js
import { update as updateParticles } from '../particles/system.js'

function animate() {
  const deltaTime = clock.getDelta()

  // Update particles
  updateParticles(deltaTime)

  // ... rest of animation
}
```

## Testing

Create `modules/particles/test.html`:

```html
<!DOCTYPE html>
<html>
<head><title>Particles Test</title></head>
<body style="margin: 0; overflow: hidden;">
  <canvas id="canvas"></canvas>
  <div style="position: absolute; top: 10px; left: 10px; color: white;">
    <button id="burst">Hit Burst</button>
    <button id="confetti">Confetti</button>
    <button id="ambient">Ambient</button>
  </div>

  <script type="module">
    import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js'
    import { init, update } from './system.js'
    import { createHitBurst, createConfetti, createAmbientParticles } from './effects.js'

    // Set up Three.js
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 10

    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas') })
    renderer.setSize(window.innerWidth, window.innerHeight)

    // Initialize particles
    init(scene)

    // Test buttons
    document.getElementById('burst').onclick = () => {
      createHitBurst({ x: 0, y: 0, z: 0 }, { r: 1, g: 0, b: 0 })
    }
    document.getElementById('confetti').onclick = () => {
      createConfetti(1)
    }
    document.getElementById('ambient').onclick = () => {
      createAmbientParticles()
    }

    // Render loop
    const clock = new THREE.Clock()
    function animate() {
      requestAnimationFrame(animate)
      update(clock.getDelta())
      renderer.render(scene, camera)
    }
    animate()
  </script>
</body>
</html>
```

## Completion Checklist

- [ ] Particle system initializes
- [ ] Hit burst creates radial explosion
- [ ] Particles have physics (velocity, gravity)
- [ ] Particles fade out over time
- [ ] Confetti explodes upward
- [ ] Ambient particles float gently
- [ ] Object pooling for performance
- [ ] 60fps maintained with 100+ particles
- [ ] Events trigger correct effects
- [ ] Particles clean up when dead

## Critical Rules

❌ DON'T modify DOM
❌ DON'T modify game state
❌ DON'T create too many particles (max 1000)
✅ DO use object pooling for performance
✅ DO clean up dead particles
✅ DO maintain 60fps
✅ DO integrate with renderer's update loop

Make it rain! 🎊
