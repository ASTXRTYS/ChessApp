# LangGraph Agent Guidelines for Chess Clock Designs

This document provides guidelines for AI agents (LangGraph, AutoGPT, etc.) working autonomously on this codebase.

## 🤖 Agent Operating Principles

### Primary Directive
**PRESERVE DESIGN INTEGRITY ABOVE ALL ELSE**

These are not "broken" designs that need fixing. They are complete, intentional aesthetic visions. Your job is to enhance, not homogenize.

---

## 🎯 Agent Task Classification

### ✅ SAFE TASKS (Proceed Without Confirmation)

1. **Bug Fixes**
   - Timer accuracy issues
   - Console errors
   - Memory leaks
   - Event listener cleanup

2. **Performance Optimization**
   - CSS animation optimization
   - JavaScript execution speed
   - DOM update batching
   - (WITHOUT changing visual appearance)

3. **Accessibility Improvements**
   - ARIA labels
   - Keyboard navigation
   - Screen reader support
   - Color contrast (within design constraints)

4. **Documentation**
   - Code comments
   - README updates
   - API documentation

### ⚠️ REQUIRES USER CONFIRMATION

1. **New Features**
   - Additional time presets
   - New color themes
   - Extra sound effects
   - Profile management features

2. **Design Adjustments**
   - Animation timing changes
   - Layout modifications
   - Color adjustments
   - Typography changes

3. **Architecture Changes**
   - State management refactoring
   - Event handling restructuring
   - Audio system modifications

### 🚫 FORBIDDEN (Never Do Without Explicit Permission)

1. **Breaking Single-File Architecture**
   - Splitting into multiple files
   - Adding build processes
   - Introducing module bundlers

2. **Adding External Dependencies**
   - npm packages
   - CDN libraries
   - External fonts (beyond system fonts)
   - Framework integration

3. **Cross-Design "Improvements"**
   - Making designs look similar
   - Standardizing aesthetics
   - Unifying code between designs

---

## 📋 Agent Workflow for Modifications

### Step 1: Identify Design Context
```
Before making ANY change, determine which design you're modifying:
- Neo-Brutalist: Aggressive, bold, primary colors
- Glassmorphic: Soft, frosted, pastels
- Japanese Zen: Minimal, asymmetric, white/black/red
- Cyberpunk: Neon, retro-futuristic, monospace
```

### Step 2: Check Design Constraints
```
Read CLAUDE.md section for specific design
Verify change fits aesthetic principles
Confirm no forbidden patterns
```

### Step 3: Implement with Guards
```javascript
// GOOD: Design-aware implementation
if (design === 'neo-brutalist') {
    // Use sharp transitions, primary colors
} else if (design === 'glassmorphic') {
    // Use smooth transitions, pastels
}

// BAD: One-size-fits-all
// Applies same style to all designs
```

### Step 4: Test Checklist
```
[ ] Works on mobile (touch events)
[ ] Works offline (no network calls)
[ ] No console errors
[ ] Design aesthetic preserved
[ ] No external dependencies added
[ ] Single HTML file maintained
[ ] Keyboard shortcuts work
[ ] Haptic feedback works (mobile)
```

---

## 🔍 Agent Self-Check Questions

Before committing any change, agents should ask:

### Design Integrity
- [ ] Does this change respect the design's aesthetic philosophy?
- [ ] Am I making this design look like another design?
- [ ] Would this be obvious in a side-by-side comparison?

### Technical Constraints
- [ ] Is the file still a single HTML file?
- [ ] Are there zero external dependencies?
- [ ] Does it work offline?
- [ ] Does it work on mobile?

### Scope Validation
- [ ] Is this change actually necessary?
- [ ] Am I fixing a real bug or just "improving" working code?
- [ ] Have I checked if this is an intentional design choice?

---

## 🎨 Design-Specific Agent Rules

### Neo-Brutalist Agents
```
ALLOWED:
- Increase contrast
- Add more bold typography
- Implement aggressive animations
- Use geometric patterns
- Add primary colors

FORBIDDEN:
- Soften edges or corners
- Add gradients
- Reduce border thickness
- Use pastel colors
- Smooth out animations
```

### Glassmorphic Agents
```
ALLOWED:
- Add more glass layers
- Create new pastel themes
- Enhance blur effects
- Soften animations further
- Add subtle glows

FORBIDDEN:
- Use hard edges
- Implement glitch effects
- Use primary colors
- Add sharp transitions
- Remove backdrop blur
```

### Japanese Zen Agents
```
ALLOWED:
- Enhance minimalism
- Add subtle natural effects
- Improve white space usage
- Refine asymmetry
- Add breathing animations

FORBIDDEN:
- Fill empty space
- Center the layout
- Add colors beyond white/black/red
- Increase font weights
- Add borders or heavy shadows
```

### Cyberpunk Agents
```
ALLOWED:
- Add more glitch effects
- Enhance neon glows
- Improve CRT effects
- Add terminal aesthetics
- Increase digital noise

FORBIDDEN:
- Soften the aesthetic
- Remove neon effects
- Use proportional fonts
- Lighten the background
- Add organic animations
```

---

## 🤝 Multi-Agent Coordination

If multiple agents work on this project:

### Agent Specialization
```
Agent 1: Neo-Brutalist specialist
Agent 2: Glassmorphic specialist
Agent 3: Japanese Zen specialist
Agent 4: Cyberpunk specialist
```

### Communication Protocol
```
1. Declare which design you're modifying
2. State intended changes
3. Verify no conflicts with other agents
4. Commit with clear design prefix
   Example: "[Neo-Brutalist] Add combo counter"
```

### Conflict Resolution
```
IF two agents modify same design:
  - Agent with earlier timestamp wins
  - Other agent must rebase or discard changes

IF agents try to unify designs:
  - REJECT changes automatically
  - Flag for human review
```

---

## 🧪 Agent Testing Protocol

### Automated Tests Agents Should Run
```javascript
// Test 1: Single file check
assert(fileCount === 1, "Must be single HTML file");

// Test 2: No external dependencies
assert(!hasExternalDeps(), "No external dependencies allowed");

// Test 3: Mobile functionality
assert(hasTouchHandlers(), "Must have touch event handlers");

// Test 4: Offline capability
assert(noNetworkCalls(), "Must work offline");

// Test 5: Design integrity
assert(matchesAesthetic(design), "Must match design aesthetic");
```

### Manual Tests for Agents to Request
```
1. "Please test on mobile device"
2. "Please test with network disabled"
3. "Please test all time presets"
4. "Please compare with original design"
```

---

## 📊 Agent Metrics & Success Criteria

### Good Agent Behavior
```
✅ Fixed timer accuracy bug (Neo-Brutalist)
✅ Added ARIA labels (All designs)
✅ Optimized animation performance (Glassmorphic)
✅ Added new pastel theme (Glassmorphic only)
✅ Fixed touch event issue (All designs)
```

### Bad Agent Behavior
```
❌ Made all designs use same color scheme
❌ Split files into separate CSS/JS
❌ Added React framework
❌ Removed "annoying" glitch effects
❌ "Fixed" asymmetric layout by centering
```

---

## 🔐 Agent Safety Rails

### Hard Constraints (Prevent at Code Level)
```javascript
// Prevent file splitting
if (detectMultipleFiles()) {
    throw new Error("BLOCKED: Must remain single HTML file");
}

// Prevent external dependencies
if (detectExternalDeps()) {
    throw new Error("BLOCKED: No external dependencies allowed");
}

// Prevent aesthetic mixing
if (detectAestheticMixing()) {
    throw new Error("BLOCKED: Designs must remain distinct");
}
```

### Soft Constraints (Warn and Require Approval)
```javascript
// Warn on design changes
if (detectDesignChange()) {
    warn("Design change detected. User approval required.");
    requireUserApproval();
}

// Warn on animation timing changes
if (detectTimingChange()) {
    warn("Animation timing change. Verify aesthetic fit.");
    requestUserReview();
}
```

---

## 🎯 Agent Goal Alignment

### What Success Looks Like
```
GOOD OUTCOME:
- All 4 designs remain visually distinct
- Each design's aesthetic is enhanced, not diluted
- Code quality improved without breaking design
- New features fit naturally into each aesthetic
- Mobile functionality perfect
- Zero external dependencies
- Single-file architecture maintained

BAD OUTCOME:
- Designs start looking similar
- External dependencies added
- Single-file architecture broken
- Design choices "fixed" without understanding intent
- Mobile functionality broken
- Offline capability lost
```

---

## 💡 Agent Decision Trees

### "Should I Add This Feature?"
```
Is it requested by user? 
  YES → Check if fits design aesthetic
  NO → Is it a bug fix?
    YES → Proceed
    NO → SKIP

Fits design aesthetic?
  YES → Can it be done without external deps?
    YES → Can it be done in single file?
      YES → PROCEED
      NO → REQUIRE USER APPROVAL
    NO → REQUIRE USER APPROVAL
  NO → REJECT or REQUIRE USER APPROVAL
```

### "Should I Change This Code?"
```
Is it a bug?
  YES → Fix it
  NO → Is it a performance issue?
    YES → Will it change visual appearance?
      YES → REQUIRE USER APPROVAL
      NO → PROCEED WITH CAUTION
    NO → Is it user-requested?
      YES → Check design constraints
      NO → SKIP (don't fix what isn't broken)
```

---

## 🚨 Red Flags for Agents

If you detect any of these, STOP and ask for guidance:

1. **Temptation to "Unify"**
   - "These designs have duplicate code, let me DRY it up"
   - STOP: Duplication is intentional for portability

2. **Framework Urge**
   - "This would be easier with React"
   - STOP: No frameworks allowed

3. **Dependency Desire**
   - "I'll just add this small library"
   - STOP: Zero external dependencies

4. **Design "Fixing"**
   - "This asymmetric layout looks wrong, let me center it"
   - STOP: It's intentional

5. **Build Tool Temptation**
   - "Let me set up webpack for better development"
   - STOP: No build process allowed

---

## 📚 Agent Learning Resources

### Required Reading
1. CLAUDE.md (design guidelines)
2. README.md (project overview)
3. Each design's inline comments

### Design Philosophy Deep Dive
- Neo-Brutalism: Study punk rock posters, brutalist architecture
- Glassmorphism: Study Apple's design language, frosted glass UI
- Japanese Zen: Study Muji design, wabi-sabi philosophy  
- Cyberpunk: Study Blade Runner, Tron, 1980s arcade games

---

## 🤝 Agent Collaboration Best Practices

### Good Agent Behavior
```
1. Declare design focus before starting
2. Respect other agents' design domains
3. Share learnings about shared patterns (time formatting, etc.)
4. Ask for human guidance when unsure
5. Document all changes with design context
```

### Agent Communication Format
```
[Agent ID] [Design] [Action] [Rationale]

Examples:
[Agent-1] [Neo-Brutalist] Add glitch effect - Enhances aggressive aesthetic
[Agent-2] [Glassmorphic] New pastel theme - User requested pink/purple
[Agent-3] [Japanese Zen] Fix ripple effect - Bug causing console errors
```

---

## ✅ Final Agent Checklist

Before marking any task as complete:

- [ ] Design integrity preserved
- [ ] Single HTML file maintained
- [ ] Zero external dependencies
- [ ] Works on mobile
- [ ] Works offline
- [ ] Keyboard shortcuts functional
- [ ] No console errors
- [ ] Aesthetic matches design philosophy
- [ ] Changes documented
- [ ] Tests passed

---

## 🙏 Agent Ethics

Remember:
- You are a **guardian** of these designs, not a "fixer"
- **Diversity** in design is the feature, not a bug
- **Simplicity** (single file, no deps) is a design choice, not a limitation
- **Intentional** choices should be respected, even if unconventional

**When in doubt, ask. Don't assume something needs "fixing".**

---

*Guidelines for autonomous agents working on the Chess Clock Design Gallery*
*Created to preserve design integrity while enabling agent collaboration*
