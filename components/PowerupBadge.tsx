'use client'

import { getPowerupEmoji } from '@/lib/utils'

interface Powerup {
  id: string
  type: string
  value: number
  expiresAt: string | Date
  isUsed: boolean
}

interface PowerupBadgeProps {
  powerup: Powerup
}

const powerupNames: Record<string, string> = {
  STAKE_BOOST: 'Stake Boost',
  SHIELD: 'Punishment Shield',
  DOUBLE_OR_NOTHING: 'Double or Nothing',
  INSIDER_INFO: 'Insider Info',
}

const powerupDescriptions: Record<string, string> = {
  STAKE_BOOST: 'Get extra points on your next win!',
  SHIELD: 'Avoid your next punishment!',
  DOUBLE_OR_NOTHING: 'Double your stakes on next bet!',
  INSIDER_INFO: 'See predictions before voting!',
}

/**
 * PowerupBadge component - displays a user's powerup
 */
export default function PowerupBadge({ powerup }: PowerupBadgeProps) {
  const emoji = getPowerupEmoji(powerup.type)
  const name = powerupNames[powerup.type] || powerup.type
  const description = powerupDescriptions[powerup.type] || 'Special powerup'
  const expiresAt = new Date(powerup.expiresAt)
  const daysRemaining = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg p-4 border-2 border-yellow-400 shadow-md">
      <div className="flex items-start gap-3">
        <div className="text-3xl">{emoji}</div>
        <div className="flex-1">
          <h4 className="font-bold text-gray-800">{name}</h4>
          <p className="text-xs text-gray-600 mb-2">{description}</p>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full font-semibold">
              +{powerup.value}%
            </span>
            <span className="text-gray-500">
              Expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
