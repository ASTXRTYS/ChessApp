/**
 * Storage Layer - localStorage Abstraction
 *
 * Handles all localStorage interactions with error handling
 * and structured data management.
 */

import { CONFIG } from '../../core/config.js'

const STORAGE_KEY = CONFIG.LOCAL_STORAGE_KEY

/**
 * Save data to localStorage
 * @param {string} key - Data key within storage
 * @param {any} data - Data to save
 * @returns {boolean} Success status
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
 * @returns {boolean} Success status
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
 * @returns {object|null} All stored data
 */
export function getAllData() {
  return load('*')
}
