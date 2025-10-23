# Particles Module API Reference

## system.js

### Public Functions

#### `init(threeScene)`
Initialize the particle system.

**Parameters:**
- `threeScene` (THREE.Scene) - Three.js scene to add particles to

**Returns:** void

**Events emitted:**
- `particles:initialized`

**Example:**
```javascript
import * as THREE from 'three'
import { init } from './modules/particles/system.js'

const scene = new THREE.Scene()
init(scene)
```

---

#### `update(deltaTime)`
Update all active particles. Call this every frame in your render loop.

**Parameters:**
- `deltaTime` (number) - Time elapsed since last frame in seconds

**Returns:** void

**Example:**
```javascript
const clock = new THREE.Clock()

function animate() {
  requestAnimationFrame(animate)
  const deltaTime = clock.getDelta()
  update(deltaTime)
  renderer.render(scene, camera)
}
```

---

#### `setEnabled(enable)`
Enable or disable the particle system.

**Parameters:**
- `enable` (boolean) - True to enable, false to disable

**Returns:** void

**Events emitted:**
- `particles:enabled-changed` with `{ enabled }`

**Example:**
```javascript
setEnabled(false)  // Turn off particles
```

---

#### `clearAll()`
Remove all active particles immediately.

**Returns:** void

**Events emitted:**
- `particles:cleared`

**Example:**
```javascript
clearAll()  // Clean slate
```

---

#### `getParticleCount()`
Get the current number of active particles.

**Returns:** number - Count of active particles

**Example:**
```javascript
console.log(`Active particles: ${getParticleCount()}`)
```

---

#### `isInitialized()`
Check if the particle system has been initialized.

**Returns:** boolean - True if initialized

**Example:**
```javascript
if (!isInitialized()) {
  init(scene)
}
```

---

## effects.js

### Public Functions

#### `createHitBurst(position, color, particles, getIndex)`
Create a radial burst of particles (timer hit effect).

**Parameters:**
- `position` (object) - Position `{ x, y, z }`
- `color` (object) - RGB color `{ r, g, b }` (values 0-1)
- `particles` (array) - Reference to active particles array
- `getIndex` (function) - Function to get next particle index

**Particle count:** 30

**Lifetime:** 0.8-1.3 seconds

**Events emitted:**
- `particles:burst-created` with `{ position, count }`

**Example:**
```javascript
createHitBurst(
  { x: 0, y: -3, z: 0 },
  { r: 0.4, g: 0.49, b: 0.92 },
  particles,
  getIndex
)
```

---

#### `createConfetti(winner, particles, getIndex)`
Create confetti explosion (victory effect).

**Parameters:**
- `winner` (number) - Player number (1 or 2)
- `particles` (array) - Reference to active particles array
- `getIndex` (function) - Function to get next particle index

**Particle count:** 120

**Lifetime:** 2.5-4 seconds

**Events emitted:**
- `particles:confetti-created` with `{ winner, count }`

**Colors:**
- Red, Gold, Blue, Pink, Green, Purple, Orange (random mix)

**Example:**
```javascript
createConfetti(1, particles, getIndex)
```

---

#### `createAmbientParticles(particles, getIndex)`
Create floating ambient particles (ember effect).

**Parameters:**
- `particles` (array) - Reference to active particles array
- `getIndex` (function) - Function to get next particle index

**Particle count:** 50

**Lifetime:** Infinity (ambient particles don't die)

**Events emitted:**
- `particles:ambient-created` with `{ count }`

**Colors:**
- Orange, red-orange, yellow-orange, deep red (warm embers)

**Example:**
```javascript
createAmbientParticles(particles, getIndex)
```

---

#### `createTrail(start, end, color, particles, getIndex)`
Create particle trail between two points (future feature).

**Parameters:**
- `start` (object) - Start position `{ x, y, z }`
- `end` (object) - End position `{ x, y, z }`
- `color` (object) - RGB color `{ r, g, b }`
- `particles` (array) - Reference to active particles array
- `getIndex` (function) - Function to get next particle index

**Particle count:** 20

**Lifetime:** 0.5-0.8 seconds

**Events emitted:**
- `particles:trail-created` with `{ start, end, count }`

---

#### `createStressParticles(player, particles, getIndex)`
Create stress particles for low-time tension.

**Parameters:**
- `player` (number) - Player number (1 or 2)
- `particles` (array) - Reference to active particles array
- `getIndex` (function) - Function to get next particle index

**Particle count:** 10

**Lifetime:** 1-1.5 seconds

**Events emitted:**
- `particles:stress-created` with `{ player, count }`

**Color:** Red (1, 0.2, 0.2)

---

#### `createEnergyBurst(player, particles, getIndex)`
Create energy burst for endgame boost activation.

**Parameters:**
- `player` (number) - Player number (1 or 2)
- `particles` (array) - Reference to active particles array
- `getIndex` (function) - Function to get next particle index

**Particle count:** 40

**Lifetime:** 0.8-1.3 seconds

**Events emitted:**
- `particles:energy-burst-created` with `{ player, count }`

**Color:** Electric blue/cyan (0.2, 0.8, 1)

---

## Events

### Events Consumed (Listening)

The particle system automatically listens to these events:

```javascript
// Player switched timers
'game:player-switched'
// Payload: { from: number, to: number }
// Effect: Creates hit burst at from player's timer

// Game victory
'game:victory'
// Payload: { winner: number }
// Effect: Creates confetti at winner's timer

// Scene loaded
'renderer:scene-loaded'
// Payload: { sceneName: string }
// Effect: Adds ambient particles if not 'classic' mode

// Game reset
'game:reset'
// Payload: {}
// Effect: Clears all particles
```

### Events Emitted (Broadcasting)

The particle system emits these events:

```javascript
// System initialized
'particles:initialized'
// Payload: none

// Particles enabled/disabled
'particles:enabled-changed'
// Payload: { enabled: boolean }

// All particles cleared
'particles:cleared'
// Payload: none

// Hit burst created
'particles:burst-created'
// Payload: { position: object, count: number }

// Confetti created
'particles:confetti-created'
// Payload: { winner: number, count: number }

// Ambient particles created
'particles:ambient-created'
// Payload: { count: number }

// Trail created
'particles:trail-created'
// Payload: { start: object, end: object, count: number }

// Stress particles created
'particles:stress-created'
// Payload: { player: number, count: number }

// Energy burst created
'particles:energy-burst-created'
// Payload: { player: number, count: number }
```

---

## State

### Subscriptions

The particle system subscribes to these state changes:

```javascript
'particlesEnabled' (boolean)
// When true: particles are enabled
// When false: particles are disabled and cleared
```

---

## Data Structures

### Particle Object

```javascript
{
  index: number,       // Buffer slot (0-999)
  x: number,          // Position X
  y: number,          // Position Y
  z: number,          // Position Z
  vx: number,         // Velocity X
  vy: number,         // Velocity Y
  vz: number,         // Velocity Z
  r: number,          // Color red (0-1)
  g: number,          // Color green (0-1)
  b: number,          // Color blue (0-1)
  size: number,       // Particle size
  life: number,       // Remaining lifetime (seconds)
  maxLife: number,    // Original lifetime
  opacity: number,    // Current opacity (0-1)
  ambient: boolean    // Ambient particle flag
}
```

---

## Constants

```javascript
MAX_PARTICLES = 1000     // Maximum particle capacity
GRAVITY = 9.8           // Gravity acceleration (m/s²)
```

---

## Physics

### Velocity Integration
```javascript
position += velocity * deltaTime
```

### Gravity (non-ambient particles)
```javascript
velocity.y -= GRAVITY * deltaTime
```

### Damping (ambient particles)
```javascript
velocity.x *= 0.99
velocity.z *= 0.99
```

### Fade
```javascript
opacity = life / maxLife
```

---

## Performance

- **Memory**: Pre-allocated Float32Arrays for 1000 particles
- **GC pressure**: None (object pooling)
- **GPU updates**: Only when particles active
- **Target FPS**: 60fps
- **Typical count**:
  - Hit burst: 30 particles
  - Confetti: 120 particles
  - Ambient: 50 particles
  - Max total: 1000 particles

---

## Usage Examples

### Basic Setup

```javascript
import * as THREE from 'three'
import { init, update } from './modules/particles/system.js'

// Scene setup
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight)
const renderer = new THREE.WebGLRenderer()

// Initialize particles
init(scene)

// Render loop
const clock = new THREE.Clock()
function animate() {
  requestAnimationFrame(animate)
  update(clock.getDelta())
  renderer.render(scene, camera)
}
animate()
```

### Responding to Events

```javascript
import { on } from './core/events.js'

on('particles:burst-created', (data) => {
  console.log(`Burst at (${data.position.x}, ${data.position.y})`)
  console.log(`${data.count} particles created`)
})
```

### Toggling Particles

```javascript
import { setEnabled } from './modules/particles/system.js'
import { dispatch, ACTIONS } from './core/state.js'

// Via state (recommended)
dispatch(ACTIONS.UPDATE_SETTING, {
  key: 'particlesEnabled',
  value: false
})

// Or directly
setEnabled(false)
```

---

## Browser Compatibility

- **Requires**: WebGL support (Three.js dependency)
- **Tested**: Chrome, Firefox, Safari (latest)
- **Mobile**: iOS Safari, Chrome Mobile
- **Minimum**: ES6 modules, Float32Array

---

## Debugging

### Enable Event Logging
```javascript
import { enableDebug } from './core/events.js'
enableDebug()
```

### Monitor Particle Count
```javascript
setInterval(() => {
  console.log('Particles:', getParticleCount())
}, 1000)
```

### Check Initialization
```javascript
import { isInitialized } from './modules/particles/system.js'
console.log('Initialized:', isInitialized())
```

---

## Error Handling

All functions include try-catch blocks and log errors:

```javascript
try {
  // Particle operations
} catch (error) {
  console.error('[Particles] Error:', error)
}
```

Events are wrapped in error handlers to prevent crashes.
