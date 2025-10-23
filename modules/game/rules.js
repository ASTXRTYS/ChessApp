/**
 * Game Rules - Chess Clock Logic
 *
 * Defines the rules for when players can click and switch turns.
 * Separating rules from engine makes testing and future rule variations easier.
 */

/**
 * Check if a player can click their timer to switch turns
 * @param {number} player - Player attempting to click (1 or 2)
 * @param {number} activePlayer - Currently active player (0 = none, 1 or 2)
 * @returns {boolean} - True if player can click
 */
export function canPlayerSwitch(player, activePlayer) {
  // First move: either player can start the game
  if (activePlayer === 0) {
    return true
  }

  // During game: only the active player can click to end their turn
  // This is standard chess clock behavior - you click your clock after your move
  return activePlayer === player
}

/**
 * Check if the game is over (time ran out)
 * @param {number} player1Time - Player 1's remaining time (seconds)
 * @param {number} player2Time - Player 2's remaining time (seconds)
 * @returns {object|null} - { winner, loser } or null if game continues
 */
export function checkGameOver(player1Time, player2Time) {
  if (player1Time <= 0) {
    return { winner: 2, loser: 1 }
  }
  if (player2Time <= 0) {
    return { winner: 1, loser: 2 }
  }
  return null
}

/**
 * Validate time value
 * @param {number} time - Time in seconds
 * @returns {boolean} - True if valid
 */
export function isValidTime(time) {
  return typeof time === 'number' && time > 0 && time < 86400 // Max 24 hours
}

/**
 * Validate player number
 * @param {number} player - Player number
 * @returns {boolean} - True if valid (1 or 2)
 */
export function isValidPlayer(player) {
  return player === 1 || player === 2
}
