/**
 * Event Bus - Decoupled Module Communication
 *
 * All inter-module communication happens through events.
 * Modules emit events, other modules listen.
 */

// Event listeners: { eventName: [callback1, callback2, ...] }
const listeners = {}

// Debug mode flag
let debugMode = false

/**
 * Emit an event
 * @param {string} eventName - Event name (format: "module:action")
 * @param {any} data - Event payload
 */
export function emit(eventName, data = null) {
  if (debugMode) {
    console.log(`[Event] 📤 ${eventName}`, data)
  }

  if (listeners[eventName]) {
    listeners[eventName].forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error(`[Event] Error in listener for "${eventName}":`, error)
      }
    })
  }
}

/**
 * Listen to an event
 * @param {string} eventName - Event name to listen for
 * @param {function} callback - Called with event data
 * @returns {function} Unsubscribe function
 */
export function on(eventName, callback) {
  if (!listeners[eventName]) {
    listeners[eventName] = []
  }
  listeners[eventName].push(callback)

  if (debugMode) {
    console.log(`[Event] 👂 Listening to ${eventName}`)
  }

  // Return unsubscribe function
  return () => off(eventName, callback)
}

/**
 * Listen to an event once (auto-removes after first call)
 * @param {string} eventName - Event name
 * @param {function} callback - Called once with event data
 * @returns {function} Unsubscribe function
 */
export function once(eventName, callback) {
  const wrapper = (data) => {
    callback(data)
    off(eventName, wrapper)
  }
  return on(eventName, wrapper)
}

/**
 * Remove event listener
 * @param {string} eventName - Event name
 * @param {function} callback - Callback to remove
 */
export function off(eventName, callback) {
  if (listeners[eventName]) {
    listeners[eventName] = listeners[eventName].filter(cb => cb !== callback)

    if (debugMode) {
      console.log(`[Event] 🔇 Stopped listening to ${eventName}`)
    }
  }
}

/**
 * Remove all listeners for an event
 * @param {string} eventName - Event name
 */
export function offAll(eventName) {
  if (listeners[eventName]) {
    delete listeners[eventName]

    if (debugMode) {
      console.log(`[Event] 🔇 Removed all listeners for ${eventName}`)
    }
  }
}

/**
 * Enable debug mode (logs all events)
 */
export function enableDebug() {
  debugMode = true
  console.log('[Event] 🐛 Debug mode enabled')
}

/**
 * Disable debug mode
 */
export function disableDebug() {
  debugMode = false
  console.log('[Event] Debug mode disabled')
}

/**
 * Get list of all events with listeners
 * @returns {Array<string>} Event names
 */
export function getEvents() {
  return Object.keys(listeners)
}

/**
 * Get listener count for an event
 * @param {string} eventName - Event name
 * @returns {number} Number of listeners
 */
export function getListenerCount(eventName) {
  return listeners[eventName] ? listeners[eventName].length : 0
}

/**
 * Clear all event listeners (useful for cleanup)
 */
export function clearAll() {
  Object.keys(listeners).forEach(key => delete listeners[key])

  if (debugMode) {
    console.log('[Event] 🧹 All listeners cleared')
  }
}

/**
 * Debug: Log current listeners
 */
export function debugEvents() {
  console.log('[Event] Active events:', Object.keys(listeners))
  Object.keys(listeners).forEach(event => {
    console.log(`  ${event}: ${listeners[event].length} listeners`)
  })
}
