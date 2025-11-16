/**
 * Utility function to combine class names
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format date with time
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Calculate time remaining until deadline
 */
export function getTimeRemaining(deadline: Date | string): string {
  const d = typeof deadline === 'string' ? new Date(deadline) : deadline
  const now = new Date()
  const diff = d.getTime() - now.getTime()

  if (diff < 0) return 'Expired'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

/**
 * Calculate payout based on bet result
 */
export function calculatePayout(
  stake: number,
  choice: 'FOR' | 'AGAINST',
  result: 'WON' | 'LOST',
  totalPool: number,
  winningPool: number
): number {
  const won = (choice === 'FOR' && result === 'WON') || (choice === 'AGAINST' && result === 'LOST')
  
  if (!won) return -stake // Lost the stake
  
  if (winningPool === 0) return stake // Return stake if no one else won
  
  // Proportional payout from total pool
  const payout = (stake / winningPool) * totalPool
  return Math.floor(payout - stake) // Profit only
}

/**
 * Get category emoji
 */
export function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    FITNESS: '',
    STUDY: '',
    GAMING: '',
    SOCIAL: '',
    WORK: '',
    FOOD: '',
    CHALLENGE: '',
    OTHER: ''
  }
  return emojis[category] || ''
}

/**
 * Get powerup emoji
 */
export function getPowerupEmoji(type: string): string {
  const emojis: Record<string, string> = {
    STAKE_BOOST: '🚀',
    SHIELD: '',
    DOUBLE_OR_NOTHING: '',
    INSIDER_INFO: '',
  }
  return emojis[type] || '⭐'
}
