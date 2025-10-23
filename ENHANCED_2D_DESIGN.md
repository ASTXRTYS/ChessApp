# 📱 Enhanced 2D Chess Clock - Design Specification

## Philosophy: Form Follows Function

**Core Principle**: A chess clock has ONE job - show two timers clearly and switch between them instantly.

---

## Design Goals

1. **Instant Recognition**: Active player obvious at a glance
2. **Touch-Optimized**: Entire timer is a touch target (50% of screen)
3. **Zero Distraction**: No UI chrome during active game
4. **Smooth Feedback**: Animations feel natural, not jarring
5. **Mobile-First**: Perfect on phone, scales to desktop

---

## Visual Design

### Layout: Fullscreen Split (50/50)

```
┌─────────────────────┐
│                     │
│    PLAYER 2 ⬆       │  (Rotated 180°)
│    04:37            │
│    Moves: 12        │
│                     │
├─────────────────────┤  ← Control strip (auto-hide)
│                     │
│    Moves: 15        │
│    05:23            │
│    PLAYER 1         │
│                     │
└─────────────────────┘
```

### Typography Hierarchy

**Timer Display**:
- Size: `clamp(8rem, 25vw, 20rem)` - Massive, readable
- Font: System sans (SF Pro, Roboto) - Clean, modern
- Weight: 700 (Bold) - High contrast
- Variant: Tabular nums - Consistent width
- Letter spacing: -0.02em - Tighter, cleaner

**Player Label**:
- Size: `clamp(1.5rem, 4vw, 2.5rem)`
- Weight: 600 (Semibold)
- Opacity: 0.7 when inactive

**Moves Counter**:
- Size: `clamp(1rem, 3vw, 1.5rem)`
- Weight: 400 (Regular)
- Opacity: 0.5 when inactive

### Color System

**Active Player**:
- Background: Purple gradient `#667eea → #764ba2`
- Text: White `#ffffff`
- Glow: Soft shadow `0 0 40px rgba(102, 126, 234, 0.4)`

**Inactive Player**:
- Background: Dark gradient `#1e293b → #0f172a`
- Text: Gray `#94a3b8`
- No glow

**Transitions**:
- Duration: 200ms (fast enough, not jarring)
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)` - Natural motion

---

## Animations

### Timer Switch Animation (200ms)

```css
/* Outgoing active player */
.timer-active → .timer-inactive {
  transform: scale(1) → scale(0.98);
  opacity: 1 → 0.7;
  filter: blur(0) → blur(1px);
}

/* Incoming active player */
.timer-inactive → .timer-active {
  transform: scale(0.98) → scale(1);
  opacity: 0.7 → 1;
  filter: blur(1px) → blur(0);
}
```

### Tap Feedback (100ms)

```css
.timer:active {
  transform: scale(0.97);
  transition: transform 100ms ease-out;
}
```

### Low Time Warning (Pulse)

```css
/* Last 30 seconds */
@keyframes pulse-warning {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

/* Last 10 seconds */
@keyframes pulse-critical {
  0%, 100% {
    opacity: 1;
    filter: brightness(1.2);
  }
  50% {
    opacity: 0.7;
    filter: brightness(0.8);
  }
}
```

---

## Gesture Interactions

### Primary: Tap to Switch
- **Action**: Tap anywhere on your timer
- **Feedback**:
  - Haptic: 20ms vibration
  - Visual: Scale down (0.97x)
  - Audio: Click sound (optional)

### Alternative: Swipe to Switch
- **Action**: Swipe down on your timer
- **Feedback**:
  - Haptic: 15ms vibration
  - Visual: Slide effect
  - Audio: Swipe sound

### Long Press: Settings (500ms)
- **Action**: Press and hold any timer
- **Feedback**:
  - Haptic: 15-30-15ms pattern
  - Visual: Settings slide in from top
  - Audio: Open sound

### Double Tap: Pause/Resume
- **Action**: Double tap control area
- **Feedback**:
  - Haptic: 10-50-10ms pattern
  - Visual: Pause icon overlay
  - Audio: Pause/resume sound

---

## Mobile Optimizations

### Safe Areas (iPhone Notch/Android Gesture Bar)

```css
.timer-top {
  padding-top: max(env(safe-area-inset-top), 1rem);
}

.timer-bottom {
  padding-bottom: max(env(safe-area-inset-bottom), 1rem);
}
```

### Touch Targets

```css
/* Entire timer is clickable */
.timer-container {
  min-height: calc(50vh - 20px);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent; /* No blue highlight */
  touch-action: manipulation; /* Disable double-tap zoom */
}
```

### Responsive Sizing

```css
/* Container query approach */
.timer-container {
  container-type: inline-size;
}

@container (max-width: 400px) {
  .time-display {
    font-size: clamp(6rem, 20vw, 12rem);
  }
}

@container (min-width: 768px) {
  .time-display {
    font-size: clamp(10rem, 25vw, 20rem);
  }
}
```

---

## Controls: Auto-Hide During Game

### States:

**Pre-Game** (No active player):
- Controls visible, centered
- Buttons: Settings, Time Presets
- Hint: "Tap any timer to start"

**Active Game** (Player ticking):
- Controls slide down to bottom edge
- Mini buttons: Pause, Reset (24px icons)
- Swipe up from bottom to reveal full controls

**Paused**:
- Controls slide up, full size
- Buttons: Resume, Reset, Settings
- Overlay: "PAUSED" text

---

## State Indicators

### Game States

**Idle** (00:00, no one active):
```
Background: Dark gray (#1e293b)
Text: Light gray (#cbd5e1)
Hint: "Tap to start"
```

**Active** (Timer counting):
```
Active: Purple gradient + glow
Inactive: Dark gradient, dimmed
Control strip: Minimized
```

**Paused**:
```
Both timers: Amber overlay (#f59e0b, 20% opacity)
Text: "PAUSED" centered
Controls: Full size
```

**Time Warning** (< 30s):
```
Background: Red tint
Animation: Pulse (slow)
```

**Critical** (< 10s):
```
Background: Bright red
Animation: Pulse (fast)
Haptic: Every second
```

**Victory**:
```
Winner: Green gradient (#10b981 → #059669)
Loser: Red gradient (#ef4444 → #dc2626)
Overlay: "🏆 [Name] Wins!" modal
```

---

## Implementation: CSS Variables

```css
:root {
  /* Colors */
  --color-active-from: #667eea;
  --color-active-to: #764ba2;
  --color-inactive-from: #1e293b;
  --color-inactive-to: #0f172a;
  --color-warning: #f59e0b;
  --color-critical: #ef4444;
  --color-victory: #10b981;

  /* Timing */
  --duration-switch: 200ms;
  --duration-tap: 100ms;
  --easing-natural: cubic-bezier(0.4, 0, 0.2, 1);

  /* Spacing (based on viewport) */
  --spacing-xs: clamp(0.25rem, 1vw, 0.5rem);
  --spacing-sm: clamp(0.5rem, 2vw, 1rem);
  --spacing-md: clamp(1rem, 3vw, 2rem);
  --spacing-lg: clamp(2rem, 5vw, 4rem);

  /* Typography */
  --font-timer: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui;
  --font-label: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', system-ui;
}
```

---

## Accessibility

### Screen Readers

```html
<div class="timer-container"
     role="button"
     aria-label="Player 1 timer: 5 minutes 23 seconds, 15 moves"
     aria-pressed="true">
  <!-- Visual content -->
</div>
```

### Keyboard Navigation

- `Tab`: Cycle through timers and controls
- `Space`: Switch to focused timer
- `P`: Pause/resume
- `R`: Reset
- `S`: Settings
- `Escape`: Close modals

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Performance Targets

| Metric | Target | Why |
|--------|--------|-----|
| First Paint | < 500ms | User sees content instantly |
| Time to Interactive | < 1s | Can start tapping immediately |
| Timer Update | 16ms | 60fps for smooth countdown |
| Tap Response | < 50ms | Feels instant |
| Bundle Size | < 100KB | Fast load on 3G |

---

## Mobile-First CSS Structure

```css
/* Base: Mobile (< 768px) */
.timer-display {
  font-size: clamp(6rem, 20vw, 10rem);
  line-height: 1;
}

/* Tablet (768px - 1024px) */
@media (min-width: 768px) {
  .timer-display {
    font-size: clamp(10rem, 22vw, 16rem);
  }
}

/* Desktop (> 1024px) */
@media (min-width: 1024px) {
  .timer-display {
    font-size: clamp(12rem, 25vw, 20rem);
  }

  /* Side-by-side layout option */
  .chess-clock {
    flex-direction: row;
  }

  .timer-container {
    width: 50%;
    height: 100vh;
  }
}
```

---

## Final Touch: Micro-Interactions

### Tap Ripple Effect

```css
.timer-container::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at var(--ripple-x) var(--ripple-y),
    rgba(255, 255, 255, 0.3) 0%,
    transparent 50%);
  opacity: 0;
  pointer-events: none;
  transition: opacity 300ms ease-out;
}

.timer-container:active::after {
  opacity: 1;
  transition: opacity 0s;
}
```

### Number Flip Animation

```css
/* When time updates, slide old number up, new number in */
.time-digit {
  transition: transform 150ms ease-out;
}

.time-digit.updating {
  transform: translateY(-100%);
  opacity: 0;
}
```

---

## Success Criteria

**Visual**:
- ✅ Active player obvious at first glance
- ✅ Time readable from 3 feet away
- ✅ No visual clutter during game
- ✅ Smooth, natural animations

**UX**:
- ✅ Tap response < 50ms
- ✅ Works one-handed on phone
- ✅ Gestures feel intuitive
- ✅ Haptic feedback confirms actions

**Performance**:
- ✅ 60fps timer updates
- ✅ < 1s load time
- ✅ Works offline (PWA)
- ✅ < 100KB total size

---

## Next Steps

1. **Create enhanced-2d.css** - All the styles above
2. **Update Classic scene** - Remove 3D, focus on 2D
3. **Wire gesture system** - Tap, swipe, long-press
4. **Add haptic feedback** - 4 patterns for different actions
5. **Test on mobile** - Real device verification
6. **Polish animations** - Fine-tune timing and easing

**Result**: A chess clock that's **beautiful, fast, and actually useful** - not a tech demo! 🎯
