'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

type FeedItem = {
  id: string
  type: 'BET_CREATED' | 'PROOF_SUBMITTED' | 'BET_COMPLETED'
  betId: string
  title: string
  description: string
  timestamp: string
  creator: {
    id: string
    username: string
    avatar?: string
  }
  category?: string
  predictionsCount?: number
  proofUrl?: string
  proofRequired?: string
  result?: string
}

type BetFeedProps = {
  feed: FeedItem[]
  isLoading: boolean
}

export default function BetFeed({ feed, isLoading }: BetFeedProps) {
  const router = useRouter()

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'BET_CREATED':
        return 'border-purple-500/50 bg-purple-950/20'
      case 'PROOF_SUBMITTED':
        return 'border-blue-500/50 bg-blue-950/20'
      case 'BET_COMPLETED':
        return 'border-green-500/50 bg-green-950/20'
      default:
        return 'border-gray-500/50 bg-gray-950/20'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'BET_CREATED':
        return 'New Challenge'
      case 'PROOF_SUBMITTED':
        return 'Proof Submitted'
      case 'BET_COMPLETED':
        return 'Challenge Completed'
      default:
        return 'Update'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-effect rounded-xl p-4 border border-gray-700 animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  if (feed.length === 0) {
    return (
      <div className="glass-effect rounded-xl p-8 border border-gray-700 text-center">
        <h3 className="text-xl font-bold text-white mb-2">No Activity Yet</h3>
        <p className="text-gray-400">Start creating bets to see activity here!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {feed.map((item) => (
        <div
          key={item.id}
          className={`glass-effect rounded-xl p-4 border transition-all hover:scale-105 cursor-pointer ${getTypeColor(item.type)}`}
          onClick={() => router.push(`/bets/${item.betId}`)}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase">
              {getTypeLabel(item.type)}
            </span>
            <span className="text-xs text-gray-500">
              {formatTimestamp(item.timestamp)}
            </span>
          </div>

          {/* Creator */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-gold-500 flex items-center justify-center text-white text-xs font-bold">
              {item.creator.username[0].toUpperCase()}
            </div>
            <span className="text-sm text-gray-300">{item.creator.username}</span>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-white mb-1 line-clamp-2">
            {item.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-400 mb-3">
            {item.description}
          </p>

          {/* Type-specific content */}
          {item.type === 'BET_CREATED' && item.predictionsCount !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {item.predictionsCount} predictions
              </span>
              {item.category && (
                <span className="px-2 py-1 bg-purple-950/50 border border-purple-500/30 rounded text-xs text-purple-300">
                  {item.category}
                </span>
              )}
            </div>
          )}

          {item.type === 'PROOF_SUBMITTED' && item.proofUrl && (
            <div className="mt-3">
              {item.proofRequired === 'IMAGE' && (
                <div className="relative w-full h-32 bg-dark-800 rounded-lg overflow-hidden">
                  <img 
                    src={item.proofUrl} 
                    alt="Proof"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {item.proofRequired === 'VIDEO' && (
                <div className="relative w-full h-32 bg-dark-800 rounded-lg overflow-hidden">
                  <video 
                    src={item.proofUrl}
                    className="w-full h-full object-cover"
                    controls
                  />
                </div>
              )}
              {item.proofRequired === 'TEXT' && (
                <div className="p-3 bg-dark-800 rounded-lg border border-gray-700">
                  <p className="text-sm text-gray-300 line-clamp-3">
                    {item.proofUrl}
                  </p>
                </div>
              )}
              {item.result && (
                <div className={`inline-block mt-2 px-3 py-1 rounded-lg text-xs font-bold ${
                  item.result === 'WON' 
                    ? 'bg-green-950/50 border border-green-500/30 text-green-300' 
                    : 'bg-red-950/50 border border-red-500/30 text-red-300'
                }`}>
                  {item.result === 'WON' ? 'Successfully Completed' : 'Failed Challenge'}
                </div>
              )}
            </div>
          )}

          {item.type === 'BET_COMPLETED' && item.result && (
            <div className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${
              item.result === 'WON' 
                ? 'bg-green-950/50 border border-green-500/30 text-green-300' 
                : 'bg-red-950/50 border border-red-500/30 text-red-300'
            }`}>
              {item.result === 'WON' ? 'Success' : 'Failed'}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
