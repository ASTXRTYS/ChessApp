/**
 * Particle Effects - Specific Visual Effects
 *
 * Defines particle behaviors for different events:
 * - Hit burst: Radial explosion when timer clicked
 * - Confetti: Victory celebration
 * - Ambient: Floating embers
 */

import { emit } from '../../core/events.js'
import { get } from '../../core/state.js'

/**
 * Create radial burst of particles when timer is hit
 * @param {object} position - Center position { x, y, z }
 * @param {object} color - RGB color { r, g, b }
 * @param {Array} particles - Reference to active particles array
 * @param {function} getIndex - Function to get next particle index
 */
export function createHitBurst(position, color, particles, getIndex) {
  const count = 30
  const speed = 5

  for (let i = 0; i < count; i++) {
    const idx = getIndex()
    if (idx === -1) break  // Max particles reached

    // Random direction in hemisphere (upward bias)
    const theta = Math.random() * Math.PI * 2  // Full circle
    const phi = Math.random() * Math.PI / 2    // Upper hemisphere

    // Convert spherical to cartesian
    const vx = Math.sin(phi) * Math.cos(theta) * speed
    const vy = Math.abs(Math.cos(phi)) * speed + 1  // Upward bias
    const vz = Math.sin(phi) * Math.sin(theta) * speed

    // Create particle
    particles.push({
      index: idx,
      x: position.x + (Math.random() - 0.5) * 0.3,  // Slight spread
      y: position.y,
      z: position.z + (Math.random() - 0.5) * 0.3,
      vx: vx,
      vy: vy,
      vz: vz,
      r: color.r + (Math.random() - 0.5) * 0.1,  // Color variation
      g: color.g + (Math.random() - 0.5) * 0.1,
      b: color.b + (Math.random() - 0.5) * 0.1,
      size: Math.random() * 0.1 + 0.15,  // 0.15-0.25
      life: Math.random() * 0.5 + 0.8,   // 0.8-1.3 seconds
      maxLife: 1.0,
      opacity: 1.0,
      ambient: false
    })
  }

  emit('particles:burst-created', { position, count })
}

/**
 * Create confetti explosion for winner
 * @param {number} winner - Player number (1 or 2)
 * @param {Array} particles - Reference to active particles array
 * @param {function} getIndex - Function to get next particle index
 */
export function createConfetti(winner, particles, getIndex) {
  const count = 120  // Lots of confetti!

  // Confetti colors (festive)
  const confettiColors = [
    { r: 1, g: 0.2, b: 0.2 },      // Red
    { r: 1, g: 0.84, b: 0 },       // Gold
    { r: 0.2, g: 0.5, b: 1 },      // Blue
    { r: 1, g: 0.4, b: 0.7 },      // Pink
    { r: 0.5, g: 1, b: 0.2 },      // Green
    { r: 0.8, g: 0.4, b: 1 },      // Purple
    { r: 1, g: 0.6, b: 0 }         // Orange
  ]

  // Position at winner's timer
  const position = {
    x: 0,
    y: winner === 1 ? -3 : 3,
    z: 0
  }

  for (let i = 0; i < count; i++) {
    const idx = getIndex()
    if (idx === -1) break

    // Random festive color
    const color = confettiColors[Math.floor(Math.random() * confettiColors.length)]

    // Explosive velocity - upward and outward
    const angle = Math.random() * Math.PI * 2
    const horizontalSpeed = Math.random() * 8 + 4
    const upwardSpeed = Math.random() * 12 + 8

    // Create confetti particle
    particles.push({
      index: idx,
      x: position.x + (Math.random() - 0.5) * 2,
      y: position.y,
      z: position.z + (Math.random() - 0.5) * 2,
      vx: Math.cos(angle) * horizontalSpeed,
      vy: upwardSpeed,
      vz: Math.sin(angle) * horizontalSpeed,
      r: color.r,
      g: color.g,
      b: color.b,
      size: Math.random() * 0.15 + 0.2,  // 0.2-0.35
      life: Math.random() * 1.5 + 2.5,   // 2.5-4 seconds
      maxLife: 3.5,
      opacity: 1.0,
      ambient: false
    })
  }

  emit('particles:confetti-created', { winner, count })
}

/**
 * Create ambient floating particles (embers)
 * @param {Array} particles - Reference to active particles array
 * @param {function} getIndex - Function to get next particle index
 */
export function createAmbientParticles(particles, getIndex) {
  const count = 50

  // Ember colors (warm orange/red glow)
  const emberColors = [
    { r: 1, g: 0.4, b: 0 },      // Orange
    { r: 1, g: 0.3, b: 0.1 },    // Red-orange
    { r: 1, g: 0.6, b: 0.2 },    // Yellow-orange
    { r: 0.9, g: 0.2, b: 0.1 }   // Deep red
  ]

  for (let i = 0; i < count; i++) {
    const idx = getIndex()
    if (idx === -1) break

    // Random ember color
    const color = emberColors[Math.floor(Math.random() * emberColors.length)]

    // Distributed throughout scene
    particles.push({
      index: idx,
      x: (Math.random() - 0.5) * 20,
      y: (Math.random() - 0.5) * 20,
      z: (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 0.3,
      vy: Math.random() * 0.3 + 0.2,  // Slow upward drift
      vz: (Math.random() - 0.5) * 0.3,
      r: color.r,
      g: color.g,
      b: color.b,
      size: Math.random() * 0.05 + 0.06,  // Small 0.06-0.11
      life: Infinity,  // Never dies (ambient)
      maxLife: Infinity,
      opacity: Math.random() * 0.3 + 0.4,  // 0.4-0.7 opacity
      ambient: true  // Special flag for ambient behavior
    })
  }

  emit('particles:ambient-created', { count })
}

/**
 * Create trail effect between two points (future feature)
 * @param {object} start - Start position { x, y, z }
 * @param {object} end - End position { x, y, z }
 * @param {object} color - RGB color { r, g, b }
 * @param {Array} particles - Reference to active particles array
 * @param {function} getIndex - Function to get next particle index
 */
export function createTrail(start, end, color, particles, getIndex) {
  const count = 20
  const steps = count

  for (let i = 0; i < steps; i++) {
    const idx = getIndex()
    if (idx === -1) break

    // Interpolate position along line
    const t = i / steps
    const x = start.x + (end.x - start.x) * t
    const y = start.y + (end.y - start.y) * t
    const z = start.z + (end.z - start.z) * t

    // Create trail particle
    particles.push({
      index: idx,
      x: x + (Math.random() - 0.5) * 0.2,
      y: y + (Math.random() - 0.5) * 0.2,
      z: z + (Math.random() - 0.5) * 0.2,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      vz: (Math.random() - 0.5) * 0.5,
      r: color.r,
      g: color.g,
      b: color.b,
      size: Math.random() * 0.08 + 0.08,  // 0.08-0.16
      life: Math.random() * 0.3 + 0.5,    // 0.5-0.8 seconds
      maxLife: 0.6,
      opacity: 1.0,
      ambient: false
    })
  }

  emit('particles:trail-created', { start, end, count })
}

/**
 * Create low-time stress particles (pulsing effect)
 * @param {number} player - Player number (1 or 2)
 * @param {Array} particles - Reference to active particles array
 * @param {function} getIndex - Function to get next particle index
 */
export function createStressParticles(player, particles, getIndex) {
  const count = 10

  const position = {
    x: 0,
    y: player === 1 ? -3 : 3,
    z: 0
  }

  // Red stress color
  const color = { r: 1, g: 0.2, b: 0.2 }

  for (let i = 0; i < count; i++) {
    const idx = getIndex()
    if (idx === -1) break

    // Slow outward pulse
    const angle = Math.random() * Math.PI * 2
    const speed = Math.random() * 1 + 0.5

    particles.push({
      index: idx,
      x: position.x,
      y: position.y,
      z: position.z,
      vx: Math.cos(angle) * speed,
      vy: 0,
      vz: Math.sin(angle) * speed,
      r: color.r,
      g: color.g,
      b: color.b,
      size: Math.random() * 0.08 + 0.12,
      life: Math.random() * 0.5 + 1.0,  // 1-1.5 seconds
      maxLife: 1.2,
      opacity: 1.0,
      ambient: false
    })
  }

  emit('particles:stress-created', { player, count })
}

/**
 * Create energy particles when endgame boost activates
 * @param {number} player - Player number (1 or 2)
 * @param {Array} particles - Reference to active particles array
 * @param {function} getIndex - Function to get next particle index
 */
export function createEnergyBurst(player, particles, getIndex) {
  const count = 40

  const position = {
    x: 0,
    y: player === 1 ? -3 : 3,
    z: 0
  }

  // Electric blue/cyan energy color
  const color = { r: 0.2, g: 0.8, b: 1 }

  for (let i = 0; i < count; i++) {
    const idx = getIndex()
    if (idx === -1) break

    // Fast radial burst
    const theta = Math.random() * Math.PI * 2
    const phi = Math.random() * Math.PI
    const speed = Math.random() * 8 + 4

    const vx = Math.sin(phi) * Math.cos(theta) * speed
    const vy = Math.cos(phi) * speed
    const vz = Math.sin(phi) * Math.sin(theta) * speed

    particles.push({
      index: idx,
      x: position.x,
      y: position.y,
      z: position.z,
      vx: vx,
      vy: vy,
      vz: vz,
      r: color.r + (Math.random() - 0.5) * 0.2,
      g: color.g + (Math.random() - 0.5) * 0.2,
      b: color.b,
      size: Math.random() * 0.1 + 0.15,
      life: Math.random() * 0.5 + 0.8,
      maxLife: 1.0,
      opacity: 1.0,
      ambient: false
    })
  }

  emit('particles:energy-burst-created', { player, count })
}
