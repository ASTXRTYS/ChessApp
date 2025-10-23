# Chess Clock Design Gallery

Four unique, mobile-first chess clock designs showcasing different aesthetic approaches and advanced web interactions.

## 🎨 Design Variations

### 1. Neo-Brutalist (Tab: Neo-Brutalist / Path `/neobrutalist/`)
**Bold, Aggressive, Maximum Contrast**
- Thick 8px borders with drop shadows
- Yellow (#FFFF00) and Cyan (#00FFFF) color scheme
- Arial Black typography with massive font sizes
- Glitch animations and brutalist aesthetic

### 2. Glassmorphic (Tab: Glassmorphic / Path `/glassmorphic/`)
**Soft, Frosted, Neumorphic**
- Frosted glass effects with backdrop-filter blur
- Soft pastel gradients
- Multiple theme options
- Smooth, breathing animations

### 3. Japanese Zen (Tab: Japanese Zen / Path `/japanese-zen/`)
**Minimal, Asymmetric, Kinetic**
- Extreme white space and minimalism
- Deep red (#C41E3A) accent color
- Asymmetric layout
- Water ripple effects and cherry blossoms

### 4. Cyberpunk Neon (Tab: Cyberpunk Neon / Path `/cyberpunk/`)
**Retro-Futuristic, 1980s Arcade**
- Neon pink and cyan glows
- CRT scan lines and screen effects
- RGB chromatic aberration
- Combo system for fast moves

## 🚀 Quick Start

```bash
# Serve the entire gallery from a single origin
cd /Users/Jason/Desktop/chess-clock/v2
python3 -m http.server 8000
```

Then open http://localhost:8000 to explore every design from one page.

## ✨ Shared Features

- Mobile-first with gesture controls
- Haptic feedback
- Sound effects
- Player profiles
- Session statistics
- Keyboard shortcuts (Space, R, F)
- Time presets and custom durations
- Low time warnings
- Zero dependencies

## 📱 Access

- **Neo-Brutalist**: http://localhost:8000/neobrutalist/
- **Glassmorphic**: http://localhost:8000/glassmorphic/
- **Japanese Zen**: http://localhost:8000/japanese-zen/
- **Cyberpunk**: http://localhost:8000/cyberpunk/

## ⚠️ IMPORTANT: Design Preservation

**These designs are intentionally distinct. Do NOT attempt to unify or standardize them.**

Each design represents a complete aesthetic vision:
- **Neo-Brutalist**: Aggressive, bold, maximum contrast
- **Glassmorphic**: Soft, frosted, neumorphic
- **Japanese Zen**: Minimal, asymmetric, kinetic
- **Cyberpunk**: Retro-futuristic, neon arcade

### For Developers & AI Assistants

Before modifying ANY design, read:
- [CLAUDE.md](./CLAUDE.md) - AI assistant guidelines & design constraints
- [AGENTS.md](./AGENTS.md) - LangGraph agent best practices

### Core Principles (DO NOT VIOLATE)

1. ✅ **Single HTML File** - Each design is ONE complete file
2. ✅ **Zero Dependencies** - No npm, no frameworks, no external libs
3. ✅ **Mobile-First** - Touch gestures must work perfectly
4. ✅ **Works Offline** - No network calls or external resources
5. ✅ **Distinct Aesthetics** - Each design stays unique

### What's Protected

- Single-file architecture
- Design-specific aesthetics (colors, typography, animations)
- Zero external dependencies
- Mobile gesture controls
- Offline functionality

### Safe Modifications

- Bug fixes (timer accuracy, memory leaks)
- Performance optimizations (without changing feel)
- Accessibility improvements (ARIA, keyboard nav)
- New features that fit the aesthetic
- Documentation updates

### Forbidden Changes

- Splitting into multiple files
- Adding external dependencies (React, libraries, fonts)
- Making designs look similar
- "Fixing" intentional design choices
- Adding build tools or bundlers

---

## 📁 Project Structure

```
v2/
├── index.html           # Gallery launcher
├── launch-all.sh        # Start all servers
├── README.md            # This file
├── CLAUDE.md            # AI assistant guidelines
├── AGENTS.md            # LangGraph agent rules
├── neobrutalist/
│   └── index.html       # Complete standalone app
├── glassmorphic/
│   └── index.html       # Complete standalone app
├── japanese-zen/
│   └── index.html       # Complete standalone app
└── cyberpunk/
    └── index.html       # Complete standalone app
```

Each design folder contains ONE self-contained HTML file with embedded CSS and JavaScript.

---

## 🎓 Educational Value

This project demonstrates:
- Four completely different approaches to the same functional requirements
- How design philosophy affects every technical decision
- Mobile-first responsive design patterns
- CSS animation techniques (GPU-accelerated)
- Touch gesture handling
- Web Audio API usage
- State management without frameworks
- Accessibility best practices
- Performance optimization
- Single-file architecture benefits

---

## 🛡️ Maintenance Guidelines

### Testing Checklist
Before deploying ANY changes:
- [ ] Still a single HTML file
- [ ] No external dependencies added
- [ ] Works on mobile (test touch events)
- [ ] Works offline (disable network)
- [ ] Design aesthetic preserved
- [ ] Keyboard shortcuts functional
- [ ] No console errors
- [ ] Timer accuracy maintained

### When to Ask for Help
- Unsure if change fits design aesthetic
- Tempted to add external dependency
- Want to "unify" code between designs
- Planning to split into multiple files
- Considering framework integration

---

Designed & Developed with Claude Code • 2025

**These designs are meant to inspire, not to be "fixed"**
**Preserve their uniqueness. Respect their differences.**
