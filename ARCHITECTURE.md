# Chess Clock V2 - Architecture & Technical Contracts

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Input                          │
│                    (Click, Touch, Keyboard)                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                        UI Module                            │
│              (Controls, Settings, Display)                  │
└────────────────────────┬────────────────────────────────────┘
                         │ Emits Events
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                       Event Bus                             │
│                  (core/events.js)                           │
└─────┬─────────┬─────────┬─────────┬─────────┬──────────────┘
      │         │         │         │         │
      ▼         ▼         ▼         ▼         ▼
   ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐
   │Game │  │Audio│  │3D   │  │Part │  │Gamif│
   │     │  │     │  │Scene│  │icles│  │icat │
   └─────┘  └─────┘  └─────┘  └─────┘  └─────┘
      │         │         │         │         │
      └─────────┴────┬────┴─────────┴─────────┘
                     │ Updates State
                     ▼
          ┌────────────────────────┐
          │   State Management     │
          │   (core/state.js)      │
          └────────────────────────┘
                     │ Notifies Subscribers
                     ▼
          ┌────────────────────────┐
          │  Modules React         │
          │  (Update Displays)     │
          └────────────────────────┘
```

## Core Infrastructure

### 1. State Management (`core/state.js`)

**Purpose**: Single source of truth for all application state

**State Shape**:
```javascript
{
  // Game state
  player1Time: 300,        // seconds
  player2Time: 300,
  player1Moves: 0,
  player2Moves: 0,
  activePlayer: 0,         // 0 = none, 1 = player1, 2 = player2
  isPaused: true,
  defaultTime: 300,

  // Player profiles
  selectedPlayer1: null,   // { id, name, palette, stats }
  selectedPlayer2: null,

  // Settings
  ambientMode: 'stadium',  // 'classic', 'stadium', 'zen', 'cyberpunk'
  audioEnabled: true,
  particlesEnabled: true,
  endgameBoostEnabled: true,

  // Visual settings
  player1Palette: 'royal',
  player2Palette: 'royal',

  // Gamification
  currentMatchStats: {
    startTime: null,
    moves: [],
    avgMoveTime: 0,
    longestThink: 0,
    fastestMove: 0
  },

  // Achievements
  unlockedAchievements: [],
  totalXP: 0,
  level: 1
}
```

**Public API**:
```javascript
// Read state
export function getState()
export function get(key)

// Update state (triggers subscribers)
export function dispatch(action, payload)

// Subscribe to changes
export function subscribe(key, callback)  // key or '*' for all
export function unsubscribe(key, callback)

// Actions
export const ACTIONS = {
  SET_TIME: 'SET_TIME',
  SET_ACTIVE_PLAYER: 'SET_ACTIVE_PLAYER',
  INCREMENT_MOVES: 'INCREMENT_MOVES',
  TOGGLE_PAUSE: 'TOGGLE_PAUSE',
  RESET_GAME: 'RESET_GAME',
  SELECT_PLAYER: 'SELECT_PLAYER',
  UPDATE_SETTING: 'UPDATE_SETTING',
  ADD_ACHIEVEMENT: 'ADD_ACHIEVEMENT',
  ADD_XP: 'ADD_XP'
}
```

### 2. Event Bus (`core/events.js`)

**Purpose**: Decoupled communication between modules

**Public API**:
```javascript
// Emit event
export function emit(eventName, data)

// Listen to event
export function on(eventName, callback)
export function once(eventName, callback)
export function off(eventName, callback)

// Debug
export function enableDebug()  // Logs all events
```

**Event Naming Convention**: `module:action`
- `game:start`
- `game:pause`
- `game:victory`
- `ui:setting-changed`
- `audio:mute`
- `renderer:scene-loaded`

### 3. Config (`core/config.js`)

**Purpose**: Shared configuration constants

```javascript
export const CONFIG = {
  // Time thresholds
  LOW_TIME_THRESHOLD: 60,
  ENDGAME_THRESHOLD: 30,
  CRITICAL_THRESHOLD: 10,

  // Audio
  DEFAULT_VOLUME: 0.3,
  TICK_TOCK_ENABLED: true,

  // Performance
  TARGET_FPS: 60,
  MAX_PARTICLES: 100,

  // Scene
  DEFAULT_SCENE: 'classic',  // Start with 2D
  ENABLE_POSTPROCESSING: true,

  // Gamification
  XP_PER_GAME: 10,
  XP_PER_ACHIEVEMENT: 50,

  // Storage
  LOCAL_STORAGE_KEY: 'chessClockV2'
}
```

## Module Contracts

### Module 1: Game Engine (`modules/game/`)

**Responsibility**: Core chess clock logic (timers, rules, win conditions)

**Files**:
- `engine.js` - Main timer logic
- `rules.js` - Game rules (who can click when, win conditions)

**Public API**:
```javascript
// engine.js
export function init(config)
export function startTimer()
export function stopTimer()
export function tick()  // Called every second
export function switchPlayer(player)
export function resetGame()
export function setTime(seconds)
```

**Events Emitted**:
- `game:initialized`
- `game:started` - { player }
- `game:paused`
- `game:resumed`
- `game:tick` - { player, timeRemaining }
- `game:player-switched` - { from, to, moveNumber }
- `game:low-time` - { player, timeRemaining }
- `game:critical-time` - { player, timeRemaining }
- `game:victory` - { winner, loser, timeRemaining }
- `game:reset`

**Events Listened**:
- `ui:start-clicked`
- `ui:pause-clicked`
- `ui:reset-clicked`
- `ui:player-clicked` - { player }
- `ui:time-selected` - { seconds }

**State Updates**:
- `player1Time`, `player2Time`
- `player1Moves`, `player2Moves`
- `activePlayer`
- `isPaused`

---

### Module 2: Renderer (`modules/renderer/`)

**Responsibility**: Three.js scene management, 3D environments, camera control

**Files**:
- `scene-manager.js` - Scene switching, initialization
- `camera.js` - Camera animations and transitions
- `scenes/classic.js` - Enhanced 2D mode (Canvas fallback)
- `scenes/stadium.js` - 3D stadium environment
- `scenes/zen.js` - Zen garden scene (future)
- `scenes/cyberpunk.js` - Cyberpunk scene (future)

**Public API**:
```javascript
// scene-manager.js
export function init(canvasElement)
export function loadScene(sceneName)  // 'classic', 'stadium', 'zen'
export function unloadScene()
export function setActivePlayer(player)  // Visual updates
export function setTimeDisplay(player, time)
export function startRenderLoop()
export function stopRenderLoop()

// camera.js
export function animateCameraTo(position, target, duration)
export function shake(intensity)
```

**Events Emitted**:
- `renderer:initialized`
- `renderer:scene-loading` - { sceneName }
- `renderer:scene-loaded` - { sceneName }
- `renderer:scene-error` - { error }

**Events Listened**:
- `game:started` - Animate camera, start effects
- `game:player-switched` - Camera transition, timer visuals
- `game:tick` - Update timer displays
- `game:low-time` - Add urgency effects
- `game:critical-time` - Shake camera
- `game:victory` - Victory camera animation
- `ui:scene-changed` - { sceneName }

**State Subscriptions**:
- `activePlayer` - Update active timer highlight
- `player1Time`, `player2Time` - Update 3D timer displays
- `ambientMode` - Load appropriate scene

---

### Module 3: Audio Engine (`modules/audio/`)

**Responsibility**: Sound effects, music, spatial audio, reactive audio

**Files**:
- `engine.js` - Audio context management
- `sounds.js` - Sound effect generation (Web Audio API)
- `music.js` - Ambient music (future)

**Public API**:
```javascript
// engine.js
export function init()
export function setMasterVolume(volume)  // 0-1
export function mute()
export function unmute()

// sounds.js
export function playClick()
export function playTick(pitch)  // Low/high alternating
export function playVictory()
export function playWarning()
export function playCountdown()
```

**Events Emitted**:
- `audio:initialized`
- `audio:error` - { error }

**Events Listened**:
- `game:player-switched` - Play click sound
- `game:tick` - Play tick-tock (under 60s)
- `game:low-time` - Play warning sound
- `game:critical-time` - Play heartbeat
- `game:victory` - Play victory fanfare
- `ui:mute-toggled`

**State Subscriptions**:
- `audioEnabled` - Mute/unmute all

---

### Module 4: Particles (`modules/particles/`)

**Responsibility**: Particle effects (hit bursts, confetti, ambient)

**Files**:
- `system.js` - Particle system coordinator
- `effects.js` - Individual effects (burst, confetti, etc)

**Public API**:
```javascript
// system.js
export function init(scene)  // Three.js scene or canvas
export function update(deltaTime)
export function setEnabled(enabled)

// effects.js
export function createHitBurst(position, color)
export function createConfetti(player)
export function createAmbientParticles()  // Floating embers
export function clearAll()
```

**Events Emitted**:
- `particles:initialized`

**Events Listened**:
- `game:player-switched` - Hit burst at timer
- `game:victory` - Confetti explosion
- `renderer:scene-loaded` - Add ambient particles

**State Subscriptions**:
- `particlesEnabled` - Enable/disable system

---

### Module 5: UI Shell (`modules/ui/`)

**Responsibility**: HTML controls, settings panel, DOM manipulation

**Files**:
- `shell.js` - Main UI coordination
- `controls.js` - Play/pause/reset buttons
- `settings.js` - Settings panel logic

**Public API**:
```javascript
// shell.js
export function init()
export function showSettings()
export function hideSettings()
export function updateTimerDisplay(player, time)
export function updateMovesDisplay(player, moves)
export function showVictoryModal(winner)

// controls.js
export function enableControls()
export function disableControls()
export function showControlPanel()
export function hideControlPanel()

// settings.js
export function loadSettings()
export function saveSettings()
```

**Events Emitted**:
- `ui:start-clicked`
- `ui:pause-clicked`
- `ui:reset-clicked`
- `ui:player-clicked` - { player }
- `ui:time-selected` - { seconds }
- `ui:scene-changed` - { sceneName }
- `ui:setting-changed` - { key, value }
- `ui:profile-selected` - { player, profileId }

**Events Listened**:
- `game:tick` - Update displays
- `game:victory` - Show victory modal
- `game:low-time` - Add urgency styling

**State Subscriptions**:
- `player1Time`, `player2Time` - Update displays
- `player1Moves`, `player2Moves` - Update move counters
- `activePlayer` - Update active/inactive states
- `isPaused` - Update pause button icon

**DOM Ownership**:
- All HTML in `index.html`
- All controls and settings UI

---

### Module 6: Gamification (`modules/gamification/`)

**Responsibility**: Achievements, XP, stats tracking

**Files**:
- `achievements.js` - Achievement definitions and checking
- `xp.js` - XP calculation and leveling
- `stats.js` - Match statistics tracking

**Public API**:
```javascript
// achievements.js
export function checkAchievements(matchData)
export function unlockAchievement(achievementId)
export function getUnlockedAchievements()

// xp.js
export function calculateXP(matchData)
export function addXP(amount)
export function getLevel()
export function getXPForNextLevel()

// stats.js
export function startMatch()
export function recordMove(player, time)
export function endMatch(winner)
export function getMatchStats()
export function getAllTimeStats()
```

**Events Emitted**:
- `gamification:achievement-unlocked` - { achievement }
- `gamification:level-up` - { level, xp }
- `gamification:xp-gained` - { amount }

**Events Listened**:
- `game:started` - Start tracking
- `game:player-switched` - Record move
- `game:victory` - Calculate stats, check achievements, award XP

**State Updates**:
- `currentMatchStats`
- `unlockedAchievements`
- `totalXP`
- `level`

---

### Module 7: Profiles (`modules/profiles/`)

**Responsibility**: Player profile management, localStorage persistence

**Files**:
- `manager.js` - Profile CRUD operations
- `storage.js` - localStorage abstraction

**Public API**:
```javascript
// manager.js
export function loadProfiles()
export function createProfile(name)
export function deleteProfile(id)
export function updateProfile(id, data)
export function getProfile(id)
export function selectPlayer(playerNum, profileId)

// storage.js
export function save(key, data)
export function load(key)
export function clear()
```

**Events Emitted**:
- `profiles:loaded`
- `profiles:created` - { profile }
- `profiles:deleted` - { id }
- `profiles:updated` - { profile }

**Events Listened**:
- `ui:profile-selected` - Update state
- `gamification:achievement-unlocked` - Update profile stats
- `game:victory` - Update win/loss record

**State Updates**:
- `selectedPlayer1`
- `selectedPlayer2`

**Storage Schema**:
```javascript
{
  profiles: [
    {
      id: 1,
      name: "Jason",
      palette: "royal",
      stats: {
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        totalXP: 0,
        achievements: []
      }
    }
  ],
  settings: { ... },
  achievements: [ ... ]
}
```

## Data Flow Examples

### Example 1: Starting the Game

1. **User clicks Play button** → UI Module
2. UI emits `ui:start-clicked`
3. Game Engine receives event
4. Game Engine dispatches `SET_ACTIVE_PLAYER: { player: 1 }`
5. State updates `activePlayer = 1`
6. State notifies subscribers
7. Renderer reacts to state change → highlights player 1 timer
8. Game Engine emits `game:started: { player: 1 }`
9. Audio reacts to event → plays start sound
10. Particles reacts to event → adds ambient effects

### Example 2: Time Runs Out

1. **Game Engine ticks** → `player1Time = 0`
2. Game Engine dispatches `SET_TIME: { player: 1, time: 0 }`
3. Game Engine checks victory condition → true
4. Game Engine emits `game:victory: { winner: 2, loser: 1 }`
5. **Multiple modules react in parallel**:
   - UI: Shows victory modal
   - Audio: Plays victory fanfare
   - Particles: Explodes confetti
   - Renderer: Animates camera celebration
   - Gamification: Calculates stats, checks achievements, awards XP
   - Profiles: Updates win/loss record
6. Gamification emits `gamification:achievement-unlocked` (if any)
7. UI shows achievement toast

### Example 3: Changing Scene

1. **User selects "Stadium" in settings** → UI Module
2. UI emits `ui:scene-changed: { sceneName: 'stadium' }`
3. Renderer receives event
4. Renderer emits `renderer:scene-loading: { sceneName: 'stadium' }`
5. UI shows loading indicator
6. Renderer loads Three.js assets
7. Renderer emits `renderer:scene-loaded: { sceneName: 'stadium' }`
8. UI hides loading indicator
9. Renderer starts render loop

## Integration Testing

### Test Scenario 1: Complete Match
```
1. Load page → All modules initialize
2. Select profiles → Profiles module updates state
3. Set time to 1 minute → Game module updates
4. Click Play → Game starts
5. Players alternate clicking → Moves increment
6. Time runs out → Victory triggered
7. Stats displayed → Gamification shows results
8. XP awarded → Profile updated
```

### Test Scenario 2: Scene Switching
```
1. Start in Classic mode (2D)
2. Open settings
3. Switch to Stadium (3D)
4. Verify smooth transition
5. Play a match in 3D
6. Switch back to Classic
7. Verify state persists
```

## Performance Considerations

### Critical Paths
1. **Game tick** (every second) - Must be <16ms
2. **Player switch** (every move) - Must be <50ms
3. **Render loop** (60fps) - Must be <16ms per frame

### Optimization Strategies
- **Debounce** rapid events (resize, scroll)
- **Throttle** frequent updates (particle systems)
- **Request Animation Frame** for visual updates
- **Web Workers** for heavy calculations (future)
- **Object pooling** for particles
- **Level of Detail** for 3D scenes
- **Lazy loading** for scenes

## Error Handling Strategy

### Module-Level Errors
```javascript
try {
  // Module code
} catch (error) {
  console.error('[ModuleName] Error:', error)
  emit('module:error', { module: 'game', error: error.message })
  // Graceful degradation
}
```

### Critical Failures
- Game Engine fails → Disable timer, show error
- Renderer fails → Fall back to 2D mode
- Audio fails → Continue silently
- Particles fails → Continue without effects
- Gamification fails → Continue without tracking

## Browser Compatibility

### Feature Detection
```javascript
// Check WebGL support
function hasWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
  } catch {
    return false
  }
}

// Check Web Audio API
function hasWebAudio() {
  return !!(window.AudioContext || window.webkitAudioContext)
}

// Progressive enhancement decision
if (hasWebGL() && !isLowEndDevice()) {
  loadScene('stadium')  // 3D
} else {
  loadScene('classic')  // 2D
}
```

## Security Considerations

- **LocalStorage**: Validate data before use
- **User Input**: Sanitize profile names, custom times
- **No eval()**: Never use eval or Function constructor
- **CSP Ready**: No inline scripts in production

## Future Extensibility

### Plugin System (Future)
```javascript
// modules/plugins/loader.js
export function registerPlugin(plugin) {
  plugin.init()
  plugin.registerEvents()
  plugin.registerState()
}
```

### Custom Scenes
```javascript
// Users can add scenes/custom.js
export default {
  name: 'custom',
  init(renderer) { },
  update(deltaTime) { },
  destroy() { }
}
```

---

**This architecture ensures**:
- ✅ Parallel development (no file conflicts)
- ✅ Loose coupling (modules independent)
- ✅ Easy testing (modules isolated)
- ✅ Scalability (add modules without breaking existing)
- ✅ Maintainability (clear responsibilities)
- ✅ Performance (optimized critical paths)
