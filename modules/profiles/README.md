# Profiles Module

**Owner**: Profile-Dev Agent
**Responsibility**: Player profile management, localStorage persistence

## Your Files

You OWN and can ONLY modify these files:
- `modules/profiles/manager.js`
- `modules/profiles/storage.js`

## What You're Building

Profile system for players:
1. Create/read/update/delete profiles
2. Store profiles in localStorage
3. Load profiles on init (pre-populated with Jason, Anthony, TaTa, Papi, Mama)
4. Persist profile stats (wins, losses, achievements)
5. Select profiles for player 1 and player 2

## Public API

### `manager.js`
```javascript
export function init()
export function loadProfiles()
export function createProfile(name)
export function deleteProfile(id)
export function updateProfile(id, data)
export function getProfile(id)
export function getAllProfiles()
export function selectPlayer(playerNum, profileId)
```

### `storage.js`
```javascript
export function save(key, data)
export function load(key)
export function clear(key)
export function getAllData()
```

## Events You Listen To

```javascript
import { on } from '../../core/events.js'

// UI profile selection
on('ui:profile-selected', (data) => {
  selectPlayer(data.playerNum, data.profileId)
})

// Achievement unlocked - update profile
on('gamification:achievement-unlocked', (data) => {
  // Add achievement to current players' profiles
})

// Victory - update win/loss
on('game:victory', (data) => {
  updateWinLoss(data.winner, data.loser)
})
```

## Events You Emit

```javascript
import { emit } from '../../core/events.js'

emit('profiles:loaded', { profiles: [...] })
emit('profiles:created', { profile: {...} })
emit('profiles:deleted', { id: 5 })
emit('profiles:updated', { profile: {...} })
emit('profiles:selected', { playerNum: 1, profile: {...} })
```

## State You Update

```javascript
import { dispatch, ACTIONS } from '../../core/state.js'

// When profile selected
dispatch(ACTIONS.SELECT_PLAYER, {
  playerNum: 1,
  profile: {
    id: 1,
    name: 'Jason',
    palette: 'royal',
    stats: { wins: 10, losses: 5 }
  }
})
```

## Storage Schema

```javascript
{
  version: 1,
  profiles: [
    {
      id: 1,
      name: "Jason",
      palette: "royal",
      stats: {
        gamesPlayed: 15,
        wins: 10,
        losses: 5,
        totalXP: 250,
        achievements: ['first-blood', 'lightning-reflexes']
      },
      createdAt: 1234567890,
      updatedAt: 1234567890
    }
  ],
  settings: {
    ambientMode: 'stadium',
    audioEnabled: true
  }
}
```

## Implementation Guide

### 1. Storage Layer (`storage.js`)

```javascript
import { CONFIG } from '../../core/config.js'

const STORAGE_KEY = CONFIG.LOCAL_STORAGE_KEY

/**
 * Save data to localStorage
 * @param {string} key - Data key within storage
 * @param {any} data - Data to save
 */
export function save(key, data) {
  try {
    const existing = load('*') || {}
    existing[key] = data
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
    return true
  } catch (error) {
    console.error('[Storage] Save failed:', error)
    return false
  }
}

/**
 * Load data from localStorage
 * @param {string} key - Data key (* for all data)
 * @returns {any} Loaded data or null
 */
export function load(key) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const data = JSON.parse(raw)
    return key === '*' ? data : data[key]
  } catch (error) {
    console.error('[Storage] Load failed:', error)
    return null
  }
}

/**
 * Clear data from localStorage
 * @param {string} key - Data key (* for all)
 */
export function clear(key) {
  try {
    if (key === '*') {
      localStorage.removeItem(STORAGE_KEY)
    } else {
      const existing = load('*') || {}
      delete existing[key]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
    }
    return true
  } catch (error) {
    console.error('[Storage] Clear failed:', error)
    return false
  }
}

/**
 * Get all data
 */
export function getAllData() {
  return load('*')
}
```

### 2. Profile Manager (`manager.js`)

```javascript
import { emit, on } from '../../core/events.js'
import { dispatch, get, ACTIONS } from '../../core/state.js'
import { save, load } from './storage.js'
import { CONFIG } from '../../core/config.js'

let profiles = []
let initialized = false

export function init() {
  if (initialized) return

  loadProfiles()
  setupEventListeners()

  initialized = true
}

function setupEventListeners() {
  on('ui:profile-selected', handleProfileSelected)
  on('game:victory', handleVictory)
  on('gamification:achievement-unlocked', handleAchievementUnlocked)
}

/**
 * Load profiles from localStorage
 * If none exist, create default profiles
 */
export function loadProfiles() {
  profiles = load('profiles') || []

  if (profiles.length === 0) {
    // Create default profiles
    profiles = [
      { id: 1, name: 'Jason', palette: 'royal' },
      { id: 2, name: 'Anthony', palette: 'forest' },
      { id: 3, name: 'TaTa', palette: 'sunset' },
      { id: 4, name: 'Papi', palette: 'ocean' },
      { id: 5, name: 'Mama', palette: 'ember' }
    ]

    // Initialize stats for each
    profiles.forEach(profile => {
      profile.stats = {
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        totalXP: 0,
        achievements: []
      }
      profile.createdAt = Date.now()
      profile.updatedAt = Date.now()
    })

    saveProfiles()
  }

  emit('profiles:loaded', { profiles })
  return profiles
}

/**
 * Save profiles to localStorage
 */
function saveProfiles() {
  save('profiles', profiles)
}

/**
 * Create a new profile
 * @param {string} name - Profile name
 * @returns {object} Created profile
 */
export function createProfile(name) {
  const newId = profiles.length > 0
    ? Math.max(...profiles.map(p => p.id)) + 1
    : 1

  const profile = {
    id: newId,
    name: name.trim(),
    palette: 'royal',  // Default palette
    stats: {
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      totalXP: 0,
      achievements: []
    },
    createdAt: Date.now(),
    updatedAt: Date.now()
  }

  profiles.push(profile)
  saveProfiles()

  emit('profiles:created', { profile })
  return profile
}

/**
 * Delete a profile
 * @param {number} id - Profile ID
 */
export function deleteProfile(id) {
  profiles = profiles.filter(p => p.id !== id)
  saveProfiles()

  // Clear selection if this profile was selected
  const player1 = get('selectedPlayer1')
  const player2 = get('selectedPlayer2')

  if (player1 && player1.id === id) {
    dispatch(ACTIONS.SELECT_PLAYER, { playerNum: 1, profile: null })
  }
  if (player2 && player2.id === id) {
    dispatch(ACTIONS.SELECT_PLAYER, { playerNum: 2, profile: null })
  }

  emit('profiles:deleted', { id })
}

/**
 * Update a profile
 * @param {number} id - Profile ID
 * @param {object} data - Fields to update
 */
export function updateProfile(id, data) {
  const profile = profiles.find(p => p.id === id)
  if (!profile) return null

  Object.assign(profile, data)
  profile.updatedAt = Date.now()

  saveProfiles()

  emit('profiles:updated', { profile })
  return profile
}

/**
 * Get a profile by ID
 * @param {number} id - Profile ID
 * @returns {object|null} Profile or null
 */
export function getProfile(id) {
  return profiles.find(p => p.id === id) || null
}

/**
 * Get all profiles
 * @returns {Array} All profiles
 */
export function getAllProfiles() {
  return [...profiles]
}

/**
 * Select a profile for a player
 * @param {number} playerNum - 1 or 2
 * @param {number|null} profileId - Profile ID or null to deselect
 */
export function selectPlayer(playerNum, profileId) {
  const profile = profileId ? getProfile(profileId) : null

  dispatch(ACTIONS.SELECT_PLAYER, { playerNum, profile })

  // Apply profile's color palette
  if (profile && profile.palette) {
    dispatch(ACTIONS.UPDATE_SETTING, {
      key: `player${playerNum}Palette`,
      value: profile.palette
    })
  }

  emit('profiles:selected', { playerNum, profile })
}

/**
 * Update win/loss record
 */
function handleVictory(data) {
  const player1 = get('selectedPlayer1')
  const player2 = get('selectedPlayer2')

  if (player1 && data.winner === 1) {
    updateProfileStats(player1.id, { wins: 1, gamesPlayed: 1 })
  }
  if (player2 && data.winner === 2) {
    updateProfileStats(player2.id, { wins: 1, gamesPlayed: 1 })
  }

  const loser = data.winner === 1 ? player2 : player1
  if (loser) {
    updateProfileStats(loser.id, { losses: 1, gamesPlayed: 1 })
  }
}

/**
 * Add achievement to profile
 */
function handleAchievementUnlocked(data) {
  const player1 = get('selectedPlayer1')
  const player2 = get('selectedPlayer2')

  if (player1) {
    addAchievementToProfile(player1.id, data.achievement.id)
  }
  if (player2) {
    addAchievementToProfile(player2.id, data.achievement.id)
  }
}

function handleProfileSelected(data) {
  selectPlayer(data.playerNum, data.profileId)
}

/**
 * Update profile stats (incremental)
 * @param {number} id - Profile ID
 * @param {object} increments - Stats to increment
 */
function updateProfileStats(id, increments) {
  const profile = getProfile(id)
  if (!profile) return

  Object.keys(increments).forEach(key => {
    if (profile.stats[key] !== undefined) {
      profile.stats[key] += increments[key]
    }
  })

  updateProfile(id, profile)
}

/**
 * Add achievement to profile
 * @param {number} id - Profile ID
 * @param {string} achievementId - Achievement ID
 */
function addAchievementToProfile(id, achievementId) {
  const profile = getProfile(id)
  if (!profile) return

  if (!profile.stats.achievements.includes(achievementId)) {
    profile.stats.achievements.push(achievementId)
    updateProfile(id, profile)
  }
}
```

## Testing

Create `modules/profiles/test.html`:

```html
<!DOCTYPE html>
<html>
<head><title>Profiles Test</title></head>
<body>
  <h1>Profiles Test</h1>
  <div id="profiles"></div>
  <input type="text" id="newName" placeholder="New profile name">
  <button id="create">Create</button>
  <button id="load">Load All</button>

  <script type="module">
    import { init, loadProfiles, createProfile, deleteProfile, getAllProfiles } from './manager.js'
    import { on } from '../../core/events.js'

    init()

    const display = document.getElementById('profiles')

    function render() {
      const profiles = getAllProfiles()
      display.innerHTML = profiles.map(p => `
        <div>
          <strong>${p.name}</strong> (${p.palette})
          - ${p.stats.wins}W ${p.stats.losses}L
          <button onclick="window.deleteProfile(${p.id})">Delete</button>
        </div>
      `).join('')
    }

    window.deleteProfile = (id) => {
      deleteProfile(id)
      render()
    }

    document.getElementById('create').onclick = () => {
      const name = document.getElementById('newName').value
      if (name) {
        createProfile(name)
        document.getElementById('newName').value = ''
        render()
      }
    }

    document.getElementById('load').onclick = () => {
      loadProfiles()
      render()
    }

    // Listen to events
    on('profiles:created', () => render())
    on('profiles:deleted', () => render())

    // Initial render
    render()
  </script>
</body>
</html>
```

## Completion Checklist

- [ ] Profiles load from localStorage
- [ ] Default profiles created if none exist
- [ ] Create profile works
- [ ] Delete profile works
- [ ] Update profile works
- [ ] Select player updates state
- [ ] Win/loss tracked correctly
- [ ] Achievements added to profiles
- [ ] Profile stats persist
- [ ] Events emit correctly

## Critical Rules

❌ DON'T touch DOM
❌ DON'T modify game logic
❌ DON'T hardcode storage keys (use CONFIG)
✅ DO handle localStorage errors gracefully
✅ DO emit events for all operations
✅ DO persist immediately on changes
✅ DO validate profile data

Manage those profiles! 👤
