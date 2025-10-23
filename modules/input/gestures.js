/**
 * Touch Gesture System - Hammer.js Integration
 *
 * Implements gesture-first navigation for mobile devices:
 * - Tap: Switch player turn
 * - Swipe: Alternative turn switching
 * - Long Press: Open settings
 * - Pinch: Zoom 3D scene
 * - Double Tap: Pause/resume
 */

import { emit, on } from '../../core/events.js';

let hammer1 = null;
let hammer2 = null;
let hammerCanvas = null;
let hammerControls = null;

/**
 * Initialize gesture handlers
 */
export function init() {
  console.log('[Gestures] Initializing touch gesture system...');

  const player1 = document.getElementById('player1');
  const player2 = document.getElementById('player2');
  const canvas = document.getElementById('renderCanvas');
  const controlPanel = document.getElementById('controlPanel');

  if (!player1 || !player2 || !canvas) {
    console.error('[Gestures] Required elements not found');
    return;
  }

  // Player 1 gestures
  setupPlayerGestures(player1, 1);

  // Player 2 gestures
  setupPlayerGestures(player2, 2);

  // Canvas gestures (3D scene interaction)
  if (canvas) {
    setupCanvasGestures(canvas);
  }

  // Control panel gestures
  if (controlPanel) {
    setupControlGestures(controlPanel);
  }

  console.log('[Gestures] ✓ Initialized');
}

/**
 * Setup gestures for player timers
 */
function setupPlayerGestures(element, playerNum) {
  // Import Hammer.js from CDN
  if (typeof Hammer === 'undefined') {
    console.warn('[Gestures] Hammer.js not loaded, skipping gesture setup');
    return;
  }

  const hammer = new Hammer(element, {
    touchAction: 'manipulation' // Disable browser defaults
  });

  // Single tap: Switch player
  hammer.on('tap', (ev) => {
    if (ev.tapCount === 1) {
      emit('input:player-tap', { player: playerNum });
      hapticFeedback('tap');
    }
  });

  // Double tap: Pause/resume
  hammer.on('doubletap', () => {
    emit('input:double-tap', { player: playerNum });
    hapticFeedback('pause');
  });

  // Swipe gestures: Alternative to tap
  hammer.get('swipe').set({
    direction: Hammer.DIRECTION_ALL,
    threshold: 50,
    velocity: 0.3
  });

  hammer.on('swipe', (ev) => {
    // Swipe down/up on player's timer to switch
    if (ev.direction === Hammer.DIRECTION_DOWN || ev.direction === Hammer.DIRECTION_UP) {
      emit('input:player-tap', { player: playerNum });
      hapticFeedback('switch');
    }
  });

  // Long press: Open settings (500ms)
  hammer.get('press').set({ time: 500 });
  hammer.on('press', () => {
    emit('input:long-press', { target: 'settings' });
    hapticFeedback('settings');
  });

  // Store reference for cleanup
  if (playerNum === 1) {
    hammer1 = hammer;
  } else {
    hammer2 = hammer;
  }
}

/**
 * Setup gestures for 3D canvas
 */
function setupCanvasGestures(canvas) {
  if (typeof Hammer === 'undefined') return;

  const hammer = new Hammer(canvas);

  // Enable pinch zoom
  hammer.get('pinch').set({ enable: true });

  let initialZ = 10;

  hammer.on('pinchstart', () => {
    // Store initial camera position
    initialZ = window.currentCameraZ || 10;
  });

  hammer.on('pinch', (ev) => {
    // Scale camera zoom based on pinch
    const newZ = initialZ / ev.scale;
    const clampedZ = Math.max(5, Math.min(20, newZ));

    emit('input:pinch-zoom', { z: clampedZ });
  });

  hammer.on('pinchend', () => {
    hapticFeedback('tap');
  });

  // Pan gesture for rotating 3D scene
  hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });

  let initialRotation = { x: 0, y: 0 };

  hammer.on('panstart', () => {
    initialRotation = window.currentSceneRotation || { x: 0, y: 0 };
  });

  hammer.on('pan', (ev) => {
    const sensitivity = 0.002;
    const newRotation = {
      y: initialRotation.y + ev.deltaX * sensitivity,
      x: initialRotation.x + ev.deltaY * sensitivity
    };

    emit('input:scene-rotate', newRotation);
  });

  hammerCanvas = hammer;
}

/**
 * Setup gestures for control panel
 */
function setupControlGestures(controlPanel) {
  if (typeof Hammer === 'undefined') return;

  const hammer = new Hammer(controlPanel);

  // Swipe left/right on controls: Previous/next preset
  hammer.get('swipe').set({
    direction: Hammer.DIRECTION_HORIZONTAL,
    velocity: 0.4
  });

  hammer.on('swipeleft', () => {
    emit('input:swipe-controls', { direction: 'left' });
    hapticFeedback('tap');
  });

  hammer.on('swiperight', () => {
    emit('input:swipe-controls', { direction: 'right' });
    hapticFeedback('tap');
  });

  hammerControls = hammer;
}

/**
 * Haptic feedback patterns
 */
const HapticPatterns = {
  tap: [10],
  switch: [20],
  pause: [10, 50, 10],
  settings: [15, 30, 15],
  victory: [50, 100, 50, 100, 50],
  warning: [100, 50, 100],
  error: [200]
};

/**
 * Trigger haptic feedback
 */
function hapticFeedback(pattern) {
  if (!('vibrate' in navigator)) return;

  const vibration = HapticPatterns[pattern] || [10];
  navigator.vibrate(vibration);
}

/**
 * Cleanup gesture handlers
 */
export function destroy() {
  if (hammer1) hammer1.destroy();
  if (hammer2) hammer2.destroy();
  if (hammerCanvas) hammerCanvas.destroy();
  if (hammerControls) hammerControls.destroy();

  hammer1 = null;
  hammer2 = null;
  hammerCanvas = null;
  hammerControls = null;

  console.log('[Gestures] Cleaned up');
}

/**
 * Check if touch device
 */
export function isTouchDevice() {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
}

/**
 * Export haptic feedback for other modules
 */
export { hapticFeedback };
