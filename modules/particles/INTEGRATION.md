# Particles Module - Integration Guide

## Status: ✅ COMPLETE

The particles module is fully implemented and ready for integration with the renderer.

## What's Been Built

### Files Created
1. **system.js** - Core particle system (407 lines)
   - Object pooling for 1000 particles
   - Physics engine (gravity, velocity, fade)
   - Event-driven architecture
   - State subscriptions
   - Update loop integration

2. **effects.js** - Particle effects library (313 lines)
   - Hit burst (radial explosion on timer click)
   - Victory confetti (celebration explosion)
   - Ambient particles (floating embers)
   - Stress particles (low-time tension)
   - Energy burst (endgame boost activation)
   - Trail effects (motion trails - future)

3. **test.html** - Isolated testing environment
   - Interactive test buttons
   - Live particle count
   - FPS monitoring
   - 3D scene visualization

## Public API

### System Functions (from system.js)

```javascript
import { init, update, setEnabled, clearAll, getParticleCount } from './modules/particles/system.js'

// Initialize with Three.js scene
init(threeScene)

// Call every frame in render loop
update(deltaTime)  // deltaTime in seconds

// Enable/disable particles
setEnabled(true)

// Clear all particles
clearAll()

// Get active particle count
const count = getParticleCount()
```

### Effect Functions (from effects.js)

Effects are triggered automatically via events, but can also be called directly:

```javascript
import {
  createHitBurst,
  createConfetti,
  createAmbientParticles
} from './modules/particles/effects.js'

// Manual effect creation (not normally needed)
// Effects automatically trigger on game events
```

## Integration with Renderer Module

The renderer module should integrate particles in their animation loop:

```javascript
// In renderer/scene-manager.js or similar

import { init as initParticles, update as updateParticles } from '../particles/system.js'

// During initialization
export function init(canvas) {
  // ... set up Three.js scene ...

  // Initialize particles with scene
  initParticles(scene)
}

// In animation loop
function animate() {
  requestAnimationFrame(animate)

  const deltaTime = clock.getDelta()

  // Update particles every frame
  updateParticles(deltaTime)

  // ... other updates ...

  renderer.render(scene, camera)
}
```

## Events Consumed

The particle system automatically listens to these events:

```javascript
// Player switched - triggers hit burst
'game:player-switched' → { from: 1, to: 2 }

// Game victory - triggers confetti
'game:victory' → { winner: 1 }

// Scene loaded - adds ambient if 3D
'renderer:scene-loaded' → { sceneName: 'stadium' }

// Game reset - clears particles
'game:reset' → {}
```

## Events Emitted

The particle system emits these events:

```javascript
// System initialized
'particles:initialized'

// Particles enabled/disabled
'particles:enabled-changed' → { enabled: true }

// All particles cleared
'particles:cleared'

// Hit burst created
'particles:burst-created' → { position, count }

// Confetti created
'particles:confetti-created' → { winner, count }

// Ambient particles created
'particles:ambient-created' → { count }

// Energy burst created
'particles:energy-burst-created' → { player, count }
```

## State Subscriptions

The particle system subscribes to:

```javascript
'particlesEnabled' → Boolean - Enable/disable particles
```

## Performance Characteristics

- **Max particles**: 1000 (hard limit)
- **Typical count**:
  - Hit burst: 30 particles
  - Confetti: 120 particles
  - Ambient: 50 particles
- **Memory**: Pre-allocated buffers (no GC pressure)
- **Target FPS**: 60fps maintained
- **Physics**: Gravity + velocity + fade
- **Rendering**: Three.js Points with custom shader

## Particle Lifecycle

1. **Creation**: Effects create particle data objects
2. **Index allocation**: Each particle gets buffer index
3. **Buffer update**: Position/color/size written to GPU buffers
4. **Physics update**: Velocity, gravity, fade applied each frame
5. **Death**: Particles removed when life <= 0
6. **Cleanup**: Buffer slots marked invisible

## Custom Shader

Particles use a custom vertex/fragment shader for performance:

- **Vertex shader**: Applies size attenuation based on distance
- **Fragment shader**: Circular particle shape with soft edges
- **Blending**: Additive blending for glow effect
- **Alpha**: Per-particle opacity for fade out

## Testing

### Isolated Test
```bash
cd modules/particles
python3 -m http.server 8000
# Open http://localhost:8000/test.html
```

### Test Controls
- **Hit Burst (Player 1)** - Purple burst at bottom
- **Hit Burst (Player 2)** - Red burst at top
- **Victory Confetti** - Random winner celebration
- **Toggle Ambient** - Floating embers on/off
- **Clear All** - Remove all particles

### Expected Behavior
1. Hit burst creates radial explosion
2. Particles fly outward with upward bias
3. Gravity pulls particles down
4. Particles fade out over lifetime
5. Confetti explodes upward with colors
6. Ambient particles float slowly upward

## Bonus Effects

Beyond the core requirements, I added:

1. **createStressParticles()** - Red pulsing for low time pressure
2. **createEnergyBurst()** - Blue explosion for endgame boost
3. **createTrail()** - Motion trails (future integration)

These can be triggered by the game engine during critical moments.

## Integration Checklist

For the renderer module developer:

- [ ] Import particle system in scene-manager.js
- [ ] Call `init(scene)` after scene is created
- [ ] Call `update(deltaTime)` in animation loop
- [ ] Emit `renderer:scene-loaded` event when scene loads
- [ ] Test particles appear on timer clicks
- [ ] Test confetti on victory
- [ ] Test ambient particles in 3D scenes
- [ ] Verify 60fps is maintained
- [ ] Test particles can be disabled via state

## Dependencies

- **Three.js**: Points, BufferGeometry, ShaderMaterial
- **Core modules**: events.js, state.js, config.js
- **No other dependencies**

## Known Limitations

1. Particles are global to the scene (no per-timer particle systems)
2. Max 1000 particles total (can be increased in system.js)
3. Ambient particles wrap at boundaries (hardcoded ±10 units)
4. Timer positions are hardcoded (y: -3 and +3)

## Future Enhancements

Potential additions for other developers:

1. **Per-scene particle themes** - Different colors for each ambient mode
2. **Particle trails** - Motion blur effects (createTrail is ready)
3. **Impact waves** - Shockwave rings on timer hits
4. **Score particles** - Numbers flying up on moves
5. **Achievement bursts** - Special effects on unlock

## Technical Deep Dive

### Object Pooling Strategy

Pre-allocate buffers for max particles:

```javascript
const positions = new Float32Array(MAX_PARTICLES * 3)  // x,y,z
const colors = new Float32Array(MAX_PARTICLES * 3)     // r,g,b
const sizes = new Float32Array(MAX_PARTICLES)          // size
const alphas = new Float32Array(MAX_PARTICLES)         // alpha
```

Active particles reference their buffer index:

```javascript
{
  index: 42,           // Buffer slot 42
  x, y, z,            // Current position
  vx, vy, vz,         // Velocity
  r, g, b,            // Color
  life, maxLife,      // Lifetime tracking
  opacity, size       // Visual properties
}
```

### Physics Update Loop

Each frame:

1. Iterate particles backwards (safe removal)
2. Decrement lifetime
3. Remove if dead
4. Apply velocity to position
5. Apply gravity to velocity
6. Calculate fade based on lifetime
7. Write to GPU buffers
8. Mark buffers as needing update

### Particle Data Structure

```javascript
{
  index: number,      // Buffer slot
  x, y, z: number,    // Position
  vx, vy, vz: number, // Velocity
  r, g, b: number,    // Color (0-1)
  size: number,       // Size
  life: number,       // Seconds remaining
  maxLife: number,    // Original lifetime
  opacity: number,    // Current opacity (0-1)
  ambient: boolean    // Special behavior flag
}
```

## Questions?

If integrating modules need clarification:

1. Check this document
2. Check README.md for contract
3. Check CLAUDE.md for architecture
4. Read system.js JSDoc comments
5. Run test.html to see behavior

---

**Status**: Module complete and ready for integration.
**Dependencies**: Waiting for renderer module to call `init()` and `update()`.
**Testing**: Isolated testing complete. Integration testing pending.
