# Terminal Hacker Chess Clock Variants

**Mobile-First | Full-Featured | Zero Dependencies**

Five distinct terminal/hacker-themed chess clock designs, each with unique aesthetics and interactions.

---

## 🎨 Variants Overview

### 1. Matrix Rain Terminal
**Directory:** `terminal-matrix/`
**Port:** `8001`
**Aesthetic:** Classic Matrix green-on-black with cascading code

**Features:**
- Animated matrix rain background (Canvas)
- Green phosphor CRT glow
- Heavy scanline effects
- Terminal-style boot sequence
- Monospaced typography
- Cursor blink animations

**Color Palette:**
- Primary: `#00ff41` (Matrix Green)
- Background: `#0d0208` (Deep Black)
- Accent: `#003b00` (Dark Green)

---

### 2. Neon Grid Terminal
**Directory:** `terminal-neon-grid/`
**Port:** `8002`
**Aesthetic:** 80s Synthwave with perspective grid and neon colors

**Features:**
- Animated perspective grid floor
- Synthwave color palette (Pink/Cyan/Purple)
- Starfield particle system
- Laser sweep animations
- Heavy CRT scan effects
- Retro arcade typography

**Color Palette:**
- Primary: `#ff006e` (Neon Pink)
- Secondary: `#00f5ff` (Neon Cyan)
- Accent: `#8b00ff` (Neon Purple)
- Highlight: `#ffbe0b` (Neon Yellow)

---

### 3. Military Tactical Terminal
**Directory:** `terminal-tactical/`
**Port:** `8003`
**Aesthetic:** Vintage amber CRT monitor with tactical HUD elements

**Features:**
- Amber phosphor glow (classic military terminals)
- Radar sweep animation
- Tactical target acquisition corners
- HUD grid overlays
- Heavy CRT flicker
- Military-style labels and codes

**Color Palette:**
- Primary: `#ff9500` (Amber)
- Bright: `#ffb84d` (Amber Bright)
- Dim: `#cc7700` (Amber Dim)
- Accent: `#00ff00` (Radar Green)

---

### 4. Holographic Terminal
**Directory:** `terminal-hologram/`
**Port:** `8004`
**Aesthetic:** Futuristic sci-fi hologram with particle effects

**Features:**
- Floating particle field (Canvas)
- Light ray sweeps
- Hologram scan effect
- Glass/transparency effects (backdrop-filter)
- Floating hexagonal frames
- Smooth, ethereal animations

**Color Palette:**
- Primary: `#00d4ff` (Holographic Blue)
- Bright: `#4dffff` (Holographic Cyan)
- Accent: `#e0f7ff` (Holographic White)
- Background: `#000814` (Deep Space)

---

### 5. Glitch Terminal
**Directory:** `terminal-glitch/`
**Port:** `8005`
**Aesthetic:** Cyberpunk data corruption with RGB chromatic aberration

**Features:**
- Digital noise canvas (real-time generated)
- RGB split text shadow effects
- Pixel corruption blocks
- Glitch bar animations
- Heavy distortion on active state
- Scanline distortion effects

**Color Palette:**
- Primary: `#ff00ff` (Glitch Pink/Magenta)
- Secondary: `#00ffff` (Glitch Cyan)
- Accent: `#00ff00` (Glitch Green)
- Highlight: `#aa00ff` (Glitch Purple)

---

## 🚀 Quick Start

### Option 1: Multi-Port Server (Recommended)

Run all 5 variants simultaneously on different ports:

```bash
python3 serve-terminals.py
```

This will start:
- Matrix Rain Terminal: http://localhost:8001
- Neon Grid Terminal: http://localhost:8002
- Tactical Terminal: http://localhost:8003
- Holographic Terminal: http://localhost:8004
- Glitch Terminal: http://localhost:8005

### Option 2: Individual Variant

Navigate to any variant directory and open `index.html`:

```bash
cd terminal-matrix
python3 -m http.server 8001
```

---

## 🎯 Features (All Variants)

### Core Functionality
- ✅ Chess clock with two independent timers
- ✅ Tap/click to switch players
- ✅ Time presets: 1m, 3m, 5m, 10m
- ✅ Pause/resume functionality
- ✅ Move counter for each player
- ✅ Victory detection and display

### Mobile-First Design
- ✅ Responsive typography (clamp)
- ✅ Touch-optimized controls
- ✅ Haptic feedback (where supported)
- ✅ Gesture-friendly tap zones
- ✅ Split-screen 50/50 layout
- ✅ Player 2 rotated 180° for opposite viewing

### Audio
- ✅ Web Audio API sounds (no external files)
- ✅ Click feedback on player switch
- ✅ Victory sound on win
- ✅ Toggle on/off

### Visual Effects
- ✅ Low time warning (30s threshold)
- ✅ Critical time alert (10s threshold)
- ✅ Active player highlighting
- ✅ Inactive player dimming
- ✅ Canvas animations (where applicable)
- ✅ CSS keyframe animations

### Architecture
- ✅ Single HTML file per variant
- ✅ Zero external dependencies
- ✅ Works offline
- ✅ No build process required
- ✅ Embedded CSS and JavaScript

---

## 🎨 Design Philosophy

### Fusion Aesthetics
Each variant combines elements from different design sources:

- **Matrix Rain**: Classic hacker films + retro terminal aesthetics
- **Neon Grid**: 80s synthwave + Tron-style grids + arcade games
- **Tactical**: Military CRT monitors + HUD design + radar systems
- **Holographic**: Sci-fi holograms + particle systems + glass morphism
- **Glitch**: Cyberpunk + digital corruption + RGB split effects

### Mobile-First Principles
1. Large touch targets (entire timer zones)
2. Readable text at all sizes (clamp functions)
3. Split-screen for face-to-face play
4. Minimal controls (hidden by default)
5. High contrast for outdoor visibility

### Performance
- Optimized animations (transform/opacity)
- RequestAnimationFrame for canvas
- CSS animations for lightweight effects
- Minimal DOM manipulation
- Efficient particle systems

---

## 🛠️ Customization

All variants use CSS custom properties for easy theming:

```css
:root {
    --primary-color: #00ff41;
    --background: #0d0208;
    --glow-effect: 0 0 10px var(--primary-color);
}
```

### Common Modifications

**Change time presets:**
```javascript
// Find this section in each index.html
<button onclick="setTime(60)">1m</button>
<button onclick="setTime(300)">5m</button>
```

**Adjust animation speed:**
```css
/* Find animations like this */
@keyframes matrix-fall {
    /* Modify duration */
}
```

**Modify colors:**
Update the `:root` variables at the top of each `<style>` section.

---

## 📱 Testing Checklist

### Desktop
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari

### Mobile
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Landscape orientation
- [ ] Portrait orientation

### Features
- [ ] Timer countdown works
- [ ] Player switching works
- [ ] Pause/resume works
- [ ] Reset works
- [ ] Audio plays (with user interaction)
- [ ] Haptic feedback (on supported devices)
- [ ] Victory screen displays
- [ ] All animations perform smoothly

---

## 🎯 Technical Highlights

### Canvas Usage
- **Matrix Rain**: Falling characters effect
- **Holographic**: Floating particle system
- **Glitch**: Digital noise generation

### CSS Tricks
- **Backdrop Filter**: Holographic glass effect
- **Mix Blend Mode**: RGB split and glitch effects
- **Transform**: 180° rotation for player 2
- **Text Shadow**: Multi-layer glow effects
- **Clip-path**: (could be added for advanced shapes)

### Web Audio API
All sounds generated in real-time using oscillators:
```javascript
oscillator.type = 'sine' | 'square' | 'sawtooth' | 'triangle';
oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
```

### Haptic Feedback
```javascript
navigator.vibrate([100, 50, 100]); // Pattern support
```

---

## 🚫 What's NOT Included

- No external fonts (uses system fonts)
- No external libraries or frameworks
- No npm/build process
- No backend/database
- No user accounts
- No multiplayer networking
- No move validation (it's a clock, not a chess engine)

---

## 📝 File Structure

```
ChessApp/
├── terminal-matrix/
│   └── index.html (Matrix Rain Terminal)
├── terminal-neon-grid/
│   └── index.html (Neon Grid Terminal)
├── terminal-tactical/
│   └── index.html (Tactical Terminal)
├── terminal-hologram/
│   └── index.html (Holographic Terminal)
├── terminal-glitch/
│   └── index.html (Glitch Terminal)
├── serve-terminals.py (Multi-port server)
└── TERMINAL_VARIANTS.md (This file)
```

---

## 🎓 Learning Resources

These variants demonstrate:

1. **Canvas API**: Matrix rain, particles, noise generation
2. **Web Audio API**: Synthesized sounds without audio files
3. **CSS Animations**: Keyframes, transforms, filters
4. **Responsive Design**: clamp(), viewport units, media queries
5. **Touch Events**: Mobile gesture handling
6. **Game Loop**: setInterval for timers, requestAnimationFrame for canvas
7. **State Management**: Pure JavaScript state without frameworks

---

## 🤝 Contributing

When adding new variants or modifying existing ones:

1. Maintain single-file architecture
2. Keep zero external dependencies
3. Ensure mobile-first responsiveness
4. Test on actual mobile devices
5. Validate HTML/CSS
6. Document any new features

---

## 📄 License

These are demonstration/educational projects. Feel free to use, modify, and learn from them.

---

## 🎉 Credits

Created as a demonstration of modern web development capabilities:
- Mobile-first design principles
- CSS animation techniques
- Canvas/Web Audio APIs
- Pure JavaScript (no frameworks)
- Terminal/hacker aesthetic design

---

**Enjoy your terminal hacker chess matches!** 🎮⚡👾
