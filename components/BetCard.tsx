'use client'

import { useState, useEffect } from 'react'
import { getCategoryEmoji, formatDateTime, getTimeRemaining } from '@/lib/utils'

interface BetCardProps {
  bet: {
    id: string
    title: string
    description: string
    deadline: string | Date
    category: string
    status: string
    result?: string | null
    creator: {
      id: string
      username: string
      avatar?: string | null
    }
    _count?: {
      predictions: number
    }
    punishments?: Array<{
      id: string
      description: string
      type: string
    }>
  }
  onClick?: () => void
}

/**
 * BetCard component - displays a bet in a card format
 */
export default function BetCard({ bet, onClick }: BetCardProps) {
  const [mounted, setMounted] = useState(false)
  const isActive = bet.status === 'ACTIVE'
  const isExpired = new Date(bet.deadline) < new Date()
  const timeRemaining = getTimeRemaining(bet.deadline)
  const emoji = getCategoryEmoji(bet.category)

  useEffect(() => {
    setMounted(true)
  }, [])

  const getStatusColor = () => {
    if (bet.status === 'COMPLETED') {
      return bet.result === 'WON' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }
    if (isExpired) return 'bg-gray-100 text-gray-800'
    return 'bg-blue-100 text-blue-800'
  }

  const getStatusText = () => {
    if (bet.status === 'COMPLETED') {
      return bet.result === 'WON' ? 'Won' : 'Lost'
    }
    if (!mounted) return '⏳ Loading...'
    if (isExpired) return 'Expired'
    return `⏳ ${timeRemaining}`
  }

  return (
    <div
      onClick={onClick}
      className={`
        glass-effect rounded-xl p-6 border-2 
        hover:shadow-neon transition-all cursor-pointer transform hover:scale-105 hover:-translate-y-1
        ${isActive && !isExpired ? 'border-purple-500 shadow-neon' : 'border-gray-700'}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{emoji}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        <span className="text-xs text-gray-500">{bet._count?.predictions || 0} predictions</span>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-white mb-2">{bet.title}</h3>

      {/* Description */}
      <p className="text-gray-300 text-sm mb-4 line-clamp-2">{bet.description}</p>

      {/* Punishment */}
      {bet.punishments && bet.punishments.length > 0 && (
        <div className="mb-4 p-3 bg-red-950/30 border border-red-500/30 rounded-lg">
          <div className="flex items-start gap-2">

            <div className="flex-1">
              <p className="text-xs text-red-300 font-semibold mb-1">Punishment:</p>
              <p className="text-sm text-red-200 line-clamp-2">{bet.punishments[0].description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-gold-500 flex items-center justify-center text-white text-xs font-bold shadow-neon">
            {bet.creator.username[0].toUpperCase()}
          </div>
          <div>
            <p className="text-xs text-gray-500">Created by</p>
            <p className="text-sm font-semibold text-white">{bet.creator.username}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Deadline</p>
          <p className="text-sm font-semibold text-gold-400">{formatDateTime(bet.deadline)}</p>
        </div>
      </div>
    </div>
  )
}
