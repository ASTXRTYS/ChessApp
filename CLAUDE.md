# Chess Clock Design Gallery - AI Assistant Guidelines

This document provides essential context for AI assistants (Claude, GPT, etc.) working on these chess clock designs.

## ⚠️ CRITICAL: Design Preservation Philosophy

**THESE DESIGNS ARE INTENTIONALLY DISTINCT AND SHOULD REMAIN THAT WAY.**

Each design represents a complete aesthetic vision. Do NOT attempt to "unify" or "standardize" them. Their diversity IS the feature.

---

## 🎨 Design Variations - DO NOT MIX

### 1. Neo-Brutalist (`/neobrutalist/index.html`)

**Core Aesthetic Principles:**
- Maximum contrast, aggressive design
- Thick borders (8px minimum)
- Primary colors only (Yellow #FFFF00, Cyan #00FFFF, Red, Blue, Green, Magenta)
- Arial Black typography - NEVER change to system fonts
- Glitch animations are intentional
- Box shadows with hard edges (no blur)
- No gradients (use solid colors only)
- No rounded corners (everything should be sharp/square)

**NEVER:**
- Add soft shadows or gradients
- Use pastel colors
- Implement smooth transitions (keep them snappy)
- Round any corners
- Reduce border thickness

**OK to add:**
- More aggressive animations
- Additional glitch effects
- More bold typography
- Stronger contrasts

---

### 2. Glassmorphic (`/glassmorphic/index.html`)

**Core Aesthetic Principles:**
- Soft, frosted glass effects (backdrop-filter: blur())
- Pastel gradients only
- Neumorphic shadows (multiple layers, soft)
- Smooth, organic animations
- Light mode optimized
- Everything should feel "soft" and "touchable"

**NEVER:**
- Use hard edges or sharp corners
- Implement glitch effects
- Use primary colors (keep pastels only)
- Add harsh transitions
- Remove backdrop-filter blur

---

### 3. Japanese Zen (`/japanese-zen/index.html`)

**Core Aesthetic Principles:**
- Extreme minimalism (wabi-sabi philosophy)
- White space is sacred - DO NOT fill it
- Only 3 colors: White #FFFFFF, Black #000000, Red #C41E3A
- Asymmetric layout (8% offset) is intentional
- Font weight 200-400 only (ultra-light)
- NO borders, NO shadows (except subtle 1px lines)
- Empty space = intentional design choice

**NEVER:**
- Add more UI elements
- Center the layout (asymmetry is key)
- Use colors other than white/black/red
- Fill empty space with content

---

### 4. Cyberpunk Neon (`/cyberpunk/index.html`)

**Core Aesthetic Principles:**
- 1980s retro-futuristic arcade aesthetic
- Neon glows are essential (text-shadow with multiple layers)
- CRT effects (scan lines, screen curvature)
- Monospace fonts ONLY
- Dark background #0a0e27
- RGB chromatic aberration on active elements

**NEVER:**
- Remove neon glows
- Use non-monospace fonts
- Implement soft/organic animations
- Remove CRT scan line effects

---

## 🚫 CRITICAL RULES

1. **Each design is a SINGLE HTML FILE** - Never split into separate CSS/JS files
2. **ZERO external dependencies** - No npm, no frameworks, no CDN (except what's already there)
3. **Mobile-first** - All features must work on touch devices
4. **Works offline** - No API calls, no external resources
5. **DO NOT unify code** - Each design is intentionally standalone

---

## ✅ Safe Modifications

- Adding new time presets
- Bug fixes
- Performance optimizations (without changing feel)
- Additional features that fit the aesthetic
- New color themes (design-appropriate)

## 🚫 Unsafe Modifications

- Changing the single-file architecture
- Adding external dependencies
- Mixing design aesthetics
- Removing intentional design choices
- "Modernizing" without understanding intent

---

*These designs are meant to inspire, not to be "fixed"*
*Preserve their uniqueness. Respect their differences.*
