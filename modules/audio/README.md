# Audio Engine Module

**Owner**: Audio-Dev Agent
**Responsibility**: Sound effects, spatial audio, reactive soundscapes

## Your Files

You OWN and can ONLY modify these files:
- `modules/audio/engine.js`
- `modules/audio/sounds.js`
- `modules/audio/music.js` (future)

## What You're Building

Immersive audio system:
1. Click sounds when timer is hit
2. Tick-tock sounds under 60 seconds (accelerating)
3. Warning sounds at critical times
4. Heartbeat audio under 10 seconds
5. Victory fanfare
6. Spatial audio (sound pans to active player's side)

## Public API

### `engine.js`
```javascript
export function init()
export function setMasterVolume(volume)  // 0-1
export function mute()
export function unmute()
export function isMuted()
```

### `sounds.js`
```javascript
export function playClick()
export function playTick(isLowPitch)  // Alternating high/low
export function startTickTock()
export function stopTickTock()
export function playWarning()
export function playHeartbeat()
export function playVictory()
```

## Events You Listen To

```javascript
import { on } from '../../core/events.js'

// Player actions
on('game:player-switched', () => { playClick() })

// Timer events
on('game:tick', (data) => {
  // Update tick-tock tempo based on time
  updateTickTockTempo(data.timeRemaining)
})

// Time thresholds
on('game:low-time', (data) => {
  playWarning()
  startTickTock()  // Begin ticking under 60s
})

on('game:critical-time', (data) => {
  playHeartbeat()  // Thump-thump under 10s
})

// Game events
on('game:victory', (data) => {
  stopTickTock()
  playVictory()
})

// Settings
on('ui:setting-changed', (data) => {
  if (data.key === 'audioEnabled') {
    data.value ? unmute() : mute()
  }
})
```

## Events You Emit

```javascript
import { emit } from '../../core/events.js'

emit('audio:initialized')
emit('audio:error', { message: 'AudioContext failed' })
```

## State You Subscribe To

```javascript
import { subscribe } from '../../core/state.js'

subscribe('audioEnabled', (enabled) => {
  enabled ? unmute() : mute()
})
```

## Implementation Guide

### 1. Setup (`engine.js`)

```javascript
import { emit, on } from '../../core/events.js'
import { subscribe } from '../../core/state.js'
import { CONFIG } from '../../core/config.js'

let audioContext = null
let masterGain = null
let initialized = false
let muted = false

export function init() {
  if (initialized) return

  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()

    // Create master gain node for volume control
    masterGain = audioContext.createGain()
    masterGain.connect(audioContext.destination)
    masterGain.gain.value = CONFIG.DEFAULT_VOLUME

    setupEventListeners()
    setupStateSubscriptions()

    initialized = true
    emit('audio:initialized')
  } catch (error) {
    console.error('[Audio] Initialization failed:', error)
    emit('audio:error', { message: error.message })
  }
}

function setupEventListeners() {
  on('game:player-switched', handlePlayerSwitch)
  on('game:tick', handleTick)
  on('game:low-time', handleLowTime)
  on('game:critical-time', handleCriticalTime)
  on('game:victory', handleVictory)
}

export function setMasterVolume(volume) {
  if (masterGain) {
    masterGain.gain.value = Math.max(0, Math.min(1, volume))
  }
}

export function mute() {
  muted = true
  if (masterGain) {
    masterGain.gain.value = 0
  }
}

export function unmute() {
  muted = false
  if (masterGain) {
    masterGain.gain.value = CONFIG.DEFAULT_VOLUME
  }
}

export function getAudioContext() {
  return audioContext
}

export function getMasterGain() {
  return masterGain
}
```

### 2. Sound Generation (`sounds.js`)

```javascript
import { getAudioContext, getMasterGain } from './engine.js'
import { CONFIG } from '../../core/config.js'

/**
 * Play click sound (timer hit)
 */
export function playClick() {
  const ctx = getAudioContext()
  const gain = getMasterGain()
  if (!ctx || !gain) return

  const osc = ctx.createOscillator()
  const oscGain = ctx.createGain()

  osc.connect(oscGain)
  oscGain.connect(gain)

  // Sharp "tap" sound
  osc.frequency.setValueAtTime(800, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.02)

  oscGain.gain.setValueAtTime(0.3, ctx.currentTime)
  oscGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)

  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.1)
}

/**
 * Play tick-tock sound (alternating pitch)
 * @param {boolean} isLowPitch - Alternate between high and low
 */
export function playTick(isLowPitch = false) {
  const ctx = getAudioContext()
  const gain = getMasterGain()
  if (!ctx || !gain) return

  const osc = ctx.createOscillator()
  const oscGain = ctx.createGain()

  osc.connect(oscGain)
  oscGain.connect(gain)

  // Alternating pitch for tick-tock effect
  const frequency = isLowPitch ? 600 : 800
  osc.frequency.setValueAtTime(frequency, ctx.currentTime)

  oscGain.gain.setValueAtTime(0.15, ctx.currentTime)
  oscGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)

  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.05)
}

let tickTockInterval = null
let tickLow = false

/**
 * Start tick-tock loop (accelerates with urgency)
 */
export function startTickTock() {
  stopTickTock()  // Clear any existing interval

  const tempo = 1000  // Start at 1 second
  tickTockInterval = setInterval(() => {
    playTick(tickLow)
    tickLow = !tickLow  // Alternate pitch
  }, tempo)
}

/**
 * Stop tick-tock loop
 */
export function stopTickTock() {
  if (tickTockInterval) {
    clearInterval(tickTockInterval)
    tickTockInterval = null
  }
}

/**
 * Update tick-tock tempo based on remaining time
 * @param {number} timeRemaining - Seconds left
 */
export function updateTickTockTempo(timeRemaining) {
  const interval = CONFIG.getTickInterval(timeRemaining)

  if (interval && !tickTockInterval) {
    startTickTock()
  } else if (!interval && tickTockInterval) {
    stopTickTock()
  } else if (interval && tickTockInterval) {
    // Restart with new tempo
    stopTickTock()
    tickTockInterval = setInterval(() => {
      playTick(tickLow)
      tickLow = !tickLow
    }, interval)
  }
}

/**
 * Play warning sound (entering low time)
 */
export function playWarning() {
  const ctx = getAudioContext()
  const gain = getMasterGain()
  if (!ctx || !gain) return

  const osc = ctx.createOscillator()
  const oscGain = ctx.createGain()

  osc.connect(oscGain)
  oscGain.connect(gain)

  // Rising alarm
  osc.frequency.setValueAtTime(400, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2)

  oscGain.gain.setValueAtTime(0.2, ctx.currentTime)
  oscGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)

  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.3)
}

/**
 * Play heartbeat sound (critical time)
 */
export function playHeartbeat() {
  const ctx = getAudioContext()
  const gain = getMasterGain()
  if (!ctx || !gain) return

  // Two quick thumps
  const playThump = (delay) => {
    const osc = ctx.createOscillator()
    const oscGain = ctx.createGain()

    osc.connect(oscGain)
    oscGain.connect(gain)

    osc.frequency.setValueAtTime(100, ctx.currentTime + delay)
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + delay + 0.05)

    oscGain.gain.setValueAtTime(0.3, ctx.currentTime + delay)
    oscGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.1)

    osc.start(ctx.currentTime + delay)
    osc.stop(ctx.currentTime + delay + 0.1)
  }

  playThump(0)      // First thump
  playThump(0.15)   // Second thump
}

/**
 * Play victory fanfare
 */
export function playVictory() {
  const ctx = getAudioContext()
  const gain = getMasterGain()
  if (!ctx || !gain) return

  // Ascending major chord
  const notes = [523, 659, 784, 1047]  // C, E, G, C

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const oscGain = ctx.createGain()

    osc.connect(oscGain)
    oscGain.connect(gain)

    const startTime = ctx.currentTime + (i * 0.1)
    osc.frequency.setValueAtTime(freq, startTime)

    oscGain.gain.setValueAtTime(0.2, startTime)
    oscGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5)

    osc.start(startTime)
    osc.stop(startTime + 0.5)
  })
}
```

### 3. Event Handlers

```javascript
function handlePlayerSwitch(data) {
  playClick()
}

function handleTick(data) {
  updateTickTockTempo(data.timeRemaining)
}

function handleLowTime(data) {
  playWarning()
  startTickTock()
}

function handleCriticalTime(data) {
  playHeartbeat()
  // Speed up tick-tock
  stopTickTock()
  tickTockInterval = setInterval(() => {
    playTick(tickLow)
    tickLow = !tickLow
  }, 250)  // Fast ticking
}

function handleVictory(data) {
  stopTickTock()
  playVictory()
}
```

## Testing

Create `modules/audio/test.html`:

```html
<!DOCTYPE html>
<html>
<head><title>Audio Test</title></head>
<body>
  <h1>Audio Module Test</h1>
  <button id="click">Click Sound</button>
  <button id="tick">Tick Sound</button>
  <button id="warning">Warning</button>
  <button id="heartbeat">Heartbeat</button>
  <button id="victory">Victory</button>
  <button id="mute">Mute/Unmute</button>

  <script type="module">
    import { init, mute, unmute } from './engine.js'
    import { playClick, playTick, playWarning, playHeartbeat, playVictory } from './sounds.js'

    init()

    document.getElementById('click').onclick = playClick
    document.getElementById('tick').onclick = () => playTick(false)
    document.getElementById('warning').onclick = playWarning
    document.getElementById('heartbeat').onclick = playHeartbeat
    document.getElementById('victory').onclick = playVictory

    let muted = false
    document.getElementById('mute').onclick = () => {
      muted = !muted
      muted ? mute() : unmute()
    }
  </script>
</body>
</html>
```

## Completion Checklist

- [ ] Audio context initializes
- [ ] Click sound plays
- [ ] Tick-tock alternates pitch
- [ ] Tick-tock accelerates with time
- [ ] Warning sound plays
- [ ] Heartbeat sound plays
- [ ] Victory fanfare plays
- [ ] Mute/unmute works
- [ ] No audio errors in console
- [ ] Works in Safari (Web Audio API quirks)

## Critical Rules

❌ DON'T touch DOM
❌ DON'T modify game state
❌ DON'T import from other modules (except core/)
✅ DO handle audio context suspension (Safari)
✅ DO clean up intervals/oscillators
✅ DO emit errors if audio fails
✅ DO gracefully degrade if Web Audio unavailable

Bring the drama with sound! 🔊
