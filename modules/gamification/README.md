# Gamification Module

**Owner**: Gamification-Dev Agent
**Responsibility**: Achievements, XP system, stats tracking

## Your Files

You OWN and can ONLY modify these files:
- `modules/gamification/achievements.js`
- `modules/gamification/xp.js`
- `modules/gamification/stats.js`

## What You're Building

Game mechanics to keep players engaged:
1. Achievement system (unlock achievements based on gameplay)
2. XP and leveling (earn XP from games and achievements)
3. Match statistics (track performance metrics)
4. All-time stats (career records)

## Public API

### `achievements.js`
```javascript
export function init()
export function checkAchievements(matchData)
export function unlockAchievement(achievementId)
export function getUnlockedAchievements()
export function getAchievementProgress()
```

### `xp.js`
```javascript
export function init()
export function calculateMatchXP(matchData)
export function addXP(amount, reason)
export function getLevel()
export function getXPForNextLevel()
export function getLevelProgress()  // 0-1
```

### `stats.js`
```javascript
export function init()
export function startMatch()
export function recordMove(player, timeRemaining)
export function endMatch(winner, loser)
export function getMatchStats()
export function getAllTimeStats(profileId)
export function updateAllTimeStats(profileId, matchStats)
```

## Events You Listen To

```javascript
import { on } from '../../core/events.js'

// Match lifecycle
on('game:started', () => {
  startMatch()
})

on('game:player-switched', (data) => {
  recordMove(data.from, getCurrentTime(data.from))
})

on('game:victory', (data) => {
  const matchStats = endMatch(data.winner, data.loser)

  // Calculate XP
  const xp = calculateMatchXP(matchStats)
  addXP(xp, 'match_complete')

  // Check achievements
  checkAchievements(matchStats)
})
```

## Events You Emit

```javascript
import { emit } from '../../core/events.js'

emit('gamification:achievement-unlocked', {
  achievement: {
    id: 'first-blood',
    name: 'First Blood',
    description: 'Play your first game'
  }
})

emit('gamification:level-up', {
  level: 5,
  xp: 500
})

emit('gamification:xp-gained', {
  amount: 50,
  reason: 'match_complete'
})

emit('gamification:stats-updated', {
  matchStats: { ... }
})
```

## State You Update

```javascript
import { dispatch, ACTIONS } from '../../core/state.js'

// Add achievement
dispatch(ACTIONS.ADD_ACHIEVEMENT, { achievementId: 'first-blood' })

// Add XP (auto-levels up if threshold reached)
dispatch(ACTIONS.ADD_XP, { amount: 50 })

// Update match stats
dispatch(ACTIONS.UPDATE_MATCH_STATS, {
  avgMoveTime: 5.2,
  longestThink: 15.3,
  fastestMove: 1.2
})
```

## Implementation Guide

### 1. Achievements (`achievements.js`)

```javascript
import { emit, on } from '../../core/events.js'
import { dispatch, get, ACTIONS } from '../../core/state.js'
import { CONFIG } from '../../core/config.js'

let initialized = false

export function init() {
  if (initialized) return

  setupEventListeners()
  initialized = true
}

function setupEventListeners() {
  on('game:victory', handleVictory)
}

function handleVictory(data) {
  const matchStats = get('currentMatchStats')
  checkAchievements(matchStats, data)
}

/**
 * Check if any achievements were unlocked
 * @param {object} matchStats - Match statistics
 * @param {object} gameData - Game end data
 */
export function checkAchievements(matchStats, gameData) {
  const unlocked = get('unlockedAchievements')
  const newAchievements = []

  // First Blood - Play first game
  if (!unlocked.includes('first-blood')) {
    unlockAchievement('first-blood')
    newAchievements.push('first-blood')
  }

  // Lightning Reflexes - 10 moves under 3 seconds
  const fastMoves = matchStats.moves.filter(m => m.time < 3).length
  if (fastMoves >= 10 && !unlocked.includes('lightning-reflexes')) {
    unlockAchievement('lightning-reflexes')
    newAchievements.push('lightning-reflexes')
  }

  // Time Bandit - Win with 2+ minutes remaining
  if (gameData.winnerTimeRemaining >= 120 && !unlocked.includes('time-bandit')) {
    unlockAchievement('time-bandit')
    newAchievements.push('time-bandit')
  }

  // Comeback King - Win after being down to 10 seconds
  const minTime = Math.min(...matchStats.moves
    .filter(m => m.player === gameData.winner)
    .map(m => m.timeRemaining)
  )
  if (minTime <= 10 && !unlocked.includes('comeback-king')) {
    unlockAchievement('comeback-king')
    newAchievements.push('comeback-king')
  }

  // Marathon Master - 50+ moves
  if (matchStats.moves.length >= 50 && !unlocked.includes('marathon-master')) {
    unlockAchievement('marathon-master')
    newAchievements.push('marathon-master')
  }

  // Zen Master - No move over 10 seconds
  const allMovesUnder10 = matchStats.moves.every(m => m.time <= 10)
  if (allMovesUnder10 && matchStats.moves.length > 0 && !unlocked.includes('zen-master')) {
    unlockAchievement('zen-master')
    newAchievements.push('zen-master')
  }

  // Speed Demon - Average move time under 5 seconds
  if (matchStats.avgMoveTime < 5 && !unlocked.includes('speed-demon')) {
    unlockAchievement('speed-demon')
    newAchievements.push('speed-demon')
  }

  return newAchievements
}

/**
 * Unlock an achievement
 * @param {string} achievementId
 */
export function unlockAchievement(achievementId) {
  const achievement = CONFIG.ACHIEVEMENTS.find(a => a.id === achievementId)
  if (!achievement) return

  // Update state
  dispatch(ACTIONS.ADD_ACHIEVEMENT, { achievementId })

  // Award XP
  dispatch(ACTIONS.ADD_XP, { amount: achievement.xp })

  // Emit event
  emit('gamification:achievement-unlocked', { achievement })

  console.log(`🏆 Achievement Unlocked: ${achievement.name}`)
}

export function getUnlockedAchievements() {
  return get('unlockedAchievements')
}

export function getAchievementProgress() {
  const unlocked = get('unlockedAchievements')
  const total = CONFIG.ACHIEVEMENTS.length
  return {
    unlocked: unlocked.length,
    total,
    percentage: (unlocked.length / total) * 100
  }
}
```

### 2. XP System (`xp.js`)

```javascript
import { emit } from '../../core/events.js'
import { dispatch, get, subscribe, ACTIONS } from '../../core/state.js'
import { CONFIG } from '../../core/config.js'

let initialized = false

export function init() {
  if (initialized) return

  // Subscribe to level changes
  subscribe('level', (newLevel, oldLevel) => {
    if (newLevel > oldLevel) {
      emit('gamification:level-up', {
        level: newLevel,
        xp: get('totalXP')
      })
      console.log(`⭐ Level Up! You are now level ${newLevel}`)
    }
  })

  initialized = true
}

/**
 * Calculate XP earned from a match
 * @param {object} matchStats - Match statistics
 * @returns {number} XP earned
 */
export function calculateMatchXP(matchStats) {
  let xp = CONFIG.XP_PER_GAME  // Base XP

  // Bonus for fast average move time
  if (matchStats.avgMoveTime < 5) {
    xp += 10
  }

  // Bonus for long game
  if (matchStats.moves.length > 30) {
    xp += 5
  }

  return xp
}

/**
 * Add XP to player's total
 * @param {number} amount - XP to add
 * @param {string} reason - Why XP was awarded
 */
export function addXP(amount, reason = 'unknown') {
  dispatch(ACTIONS.ADD_XP, { amount })

  emit('gamification:xp-gained', {
    amount,
    reason
  })

  console.log(`+${amount} XP (${reason})`)
}

export function getLevel() {
  return get('level')
}

export function getXPForNextLevel() {
  const currentLevel = get('level')
  return currentLevel * CONFIG.XP_PER_LEVEL
}

export function getLevelProgress() {
  const totalXP = get('totalXP')
  const currentLevel = get('level')
  const xpForCurrentLevel = (currentLevel - 1) * CONFIG.XP_PER_LEVEL
  const xpForNextLevel = currentLevel * CONFIG.XP_PER_LEVEL
  const xpInCurrentLevel = totalXP - xpForCurrentLevel

  return xpInCurrentLevel / CONFIG.XP_PER_LEVEL
}
```

### 3. Stats Tracking (`stats.js`)

```javascript
import { emit, on } from '../../core/events.js'
import { dispatch, get, ACTIONS } from '../../core/state.js'

let matchStartTime = null
let moveTimes = []
let initialized = false

export function init() {
  if (initialized) return

  setupEventListeners()
  initialized = true
}

function setupEventListeners() {
  on('game:started', startMatch)
  on('game:player-switched', handlePlayerSwitch)
  on('game:victory', handleVictory)
}

/**
 * Start tracking a new match
 */
export function startMatch() {
  matchStartTime = Date.now()
  moveTimes = []

  dispatch(ACTIONS.UPDATE_MATCH_STATS, {
    startTime: matchStartTime,
    moves: [],
    avgMoveTime: 0,
    longestThink: 0,
    fastestMove: 0
  })
}

/**
 * Record a move
 * @param {number} player
 * @param {number} timeRemaining
 */
export function recordMove(player, timeRemaining) {
  const moveTime = Date.now()
  const timeTaken = moveTimes.length > 0
    ? (moveTime - moveTimes[moveTimes.length - 1]) / 1000
    : 0

  moveTimes.push(moveTime)

  const currentStats = get('currentMatchStats')
  const moves = [...currentStats.moves, {
    player,
    time: timeTaken,
    timeRemaining,
    timestamp: moveTime
  }]

  // Calculate stats
  const avgMoveTime = moves.length > 1
    ? moves.slice(1).reduce((sum, m) => sum + m.time, 0) / (moves.length - 1)
    : 0

  const longestThink = moves.length > 1
    ? Math.max(...moves.slice(1).map(m => m.time))
    : 0

  const fastestMove = moves.length > 1
    ? Math.min(...moves.slice(1).map(m => m.time))
    : 0

  dispatch(ACTIONS.UPDATE_MATCH_STATS, {
    moves,
    avgMoveTime,
    longestThink,
    fastestMove
  })
}

function handlePlayerSwitch(data) {
  const timeRemaining = get(`player${data.from}Time`)
  recordMove(data.from, timeRemaining)
}

function handleVictory(data) {
  const matchStats = getMatchStats()
  emit('gamification:stats-updated', { matchStats })

  // Update all-time stats for both players
  const player1 = get('selectedPlayer1')
  const player2 = get('selectedPlayer2')

  if (player1) {
    updateAllTimeStats(player1.id, matchStats, data.winner === 1)
  }
  if (player2) {
    updateAllTimeStats(player2.id, matchStats, data.winner === 2)
  }
}

/**
 * Get current match statistics
 */
export function getMatchStats() {
  return get('currentMatchStats')
}

/**
 * Get all-time stats for a profile
 * @param {number} profileId
 */
export function getAllTimeStats(profileId) {
  // Load from localStorage (handled by profiles module)
  const profiles = JSON.parse(localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY) || '{}')
  const profile = profiles.profiles?.find(p => p.id === profileId)

  return profile?.stats || {
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    totalMoves: 0,
    totalPlayTime: 0,
    bestAvgMoveTime: Infinity,
    fastestMove: Infinity
  }
}

/**
 * Update all-time stats
 * @param {number} profileId
 * @param {object} matchStats
 * @param {boolean} won
 */
export function updateAllTimeStats(profileId, matchStats, won) {
  const allTimeStats = getAllTimeStats(profileId)

  allTimeStats.gamesPlayed++
  if (won) {
    allTimeStats.wins++
  } else {
    allTimeStats.losses++
  }

  allTimeStats.totalMoves += matchStats.moves.length
  allTimeStats.totalPlayTime += (Date.now() - matchStats.startTime) / 1000

  if (matchStats.avgMoveTime > 0 && matchStats.avgMoveTime < allTimeStats.bestAvgMoveTime) {
    allTimeStats.bestAvgMoveTime = matchStats.avgMoveTime
  }

  if (matchStats.fastestMove > 0 && matchStats.fastestMove < allTimeStats.fastestMove) {
    allTimeStats.fastestMove = matchStats.fastestMove
  }

  // Save back to localStorage
  const storageData = JSON.parse(localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY) || '{}')
  if (!storageData.profiles) storageData.profiles = []

  const profileIndex = storageData.profiles.findIndex(p => p.id === profileId)
  if (profileIndex >= 0) {
    storageData.profiles[profileIndex].stats = allTimeStats
    localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY, JSON.stringify(storageData))
  }
}
```

## Testing

Create `modules/gamification/test.html`:

```html
<!DOCTYPE html>
<html>
<head><title>Gamification Test</title></head>
<body>
  <h1>Gamification Test</h1>
  <div id="output"></div>
  <button id="testMatch">Simulate Match</button>

  <script type="module">
    import { init as initState } from '../../core/state.js'
    import { init as initAchievements, checkAchievements } from './achievements.js'
    import { init as initXP, addXP, getLevel } from './xp.js'
    import { init as initStats, startMatch, recordMove } from './stats.js'
    import { on } from '../../core/events.js'

    initAchievements()
    initXP()
    initStats()

    const output = document.getElementById('output')

    // Listen to gamification events
    on('gamification:achievement-unlocked', (data) => {
      output.innerHTML += `<p>🏆 ${data.achievement.name}</p>`
    })

    on('gamification:xp-gained', (data) => {
      output.innerHTML += `<p>+${data.amount} XP</p>`
    })

    on('gamification:level-up', (data) => {
      output.innerHTML += `<p>⭐ Level ${data.level}!</p>`
    })

    // Test match
    document.getElementById('testMatch').onclick = () => {
      startMatch()

      // Simulate fast moves
      for (let i = 0; i < 15; i++) {
        setTimeout(() => recordMove(1, 100), i * 100)
      }

      // Simulate victory after 1.5s
      setTimeout(() => {
        const matchStats = {
          moves: Array(15).fill({ time: 2, player: 1 }),
          avgMoveTime: 2
        }
        checkAchievements(matchStats, { winner: 1, winnerTimeRemaining: 150 })
        addXP(50, 'match_complete')
        output.innerHTML += `<p>Level: ${getLevel()}</p>`
      }, 1600)
    }
  </script>
</body>
</html>
```

## Completion Checklist

- [ ] Achievements system checks conditions
- [ ] Achievements unlock correctly
- [ ] XP awards on match completion
- [ ] XP awards on achievements
- [ ] Level up triggers correctly
- [ ] Match stats track all moves
- [ ] Average move time calculated
- [ ] Longest/fastest move tracked
- [ ] All-time stats persist
- [ ] Events emit correctly

## Critical Rules

❌ DON'T touch DOM
❌ DON'T modify files outside your module
✅ DO track stats accurately
✅ DO emit events for UI feedback
✅ DO persist stats to localStorage
✅ DO award XP fairly

Make it addictive! 🎮
