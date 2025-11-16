'use client'

import { formatDateTime } from '@/lib/utils'
import Link from 'next/link'

interface Activity {
  id: string
  type: 'bet_created' | 'punishment_suggested' | 'vote_placed' | 'user_post' | 'bet_completed' | 'friend_added'
  user: {
    id: string
    username: string
    avatar?: string
  }
  content: string
  metadata?: {
    betId?: string
    betTitle?: string
    punishment?: string
    choice?: string
    stake?: number
    result?: string
    friendUsername?: string
  }
  createdAt: string | Date
}

interface ActivityFeedProps {
  activities: Activity[]
  isLoading?: boolean
}

export default function ActivityFeed({ activities, isLoading }: ActivityFeedProps) {
  const getActivityIcon = (type: string) => {
    const icons: Record<string, string> = {
      bet_created: '',
      punishment_suggested: '',
      vote_placed: '',
      user_post: '',
      bet_completed: '',
      friend_added: '',
    }
    return icons[type] || ''
  }

  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      bet_created: 'border-purple-500/50 bg-purple-950/20',
      punishment_suggested: 'border-red-500/50 bg-red-950/20',
      vote_placed: 'border-gold-500/50 bg-gold-950/20',
      user_post: 'border-blue-500/50 bg-blue-950/20',
      bet_completed: 'border-green-500/50 bg-green-950/20',
      friend_added: 'border-pink-500/50 bg-pink-950/20',
    }
    return colors[type] || 'border-gray-500/50 bg-gray-950/20'
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-effect rounded-xl p-4 border border-gray-700 animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="glass-effect rounded-xl p-12 border border-gray-700 text-center">
        <h3 className="text-xl font-bold text-white mb-2">No Activity Yet</h3>
        <p className="text-gray-400">Start creating bets and connecting with friends!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className={`glass-effect rounded-xl p-4 border ${getActivityColor(activity.type)} hover:border-gold-500/50 transition-all`}
        >
          <div className="flex items-start gap-3">
            {/* User Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-gold-500 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-neon">
              {activity.user.username[0].toUpperCase()}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{getActivityIcon(activity.type)}</span>
                <Link 
                  href={`/profile/${activity.user.id}`}
                  className="font-bold text-white hover:text-gold-400 transition-colors"
                >
                  {activity.user.username}
                </Link>
                <span className="text-xs text-gray-500">
                  {formatDateTime(activity.createdAt)}
                </span>
              </div>

              <p className="text-gray-300 text-sm mb-2">{activity.content}</p>

              {/* Metadata based on activity type */}
              {activity.metadata?.betTitle && (
                <Link
                  href={`/bets/${activity.metadata.betId}`}
                  className="inline-block px-3 py-1 bg-dark-700 border border-gray-600 rounded-lg text-xs text-gray-300 hover:border-gold-500 hover:text-gold-400 transition-all"
                >
                  📌 {activity.metadata.betTitle}
                </Link>
              )}

              {activity.metadata?.punishment && (
                <div className="mt-2 p-2 bg-red-950/30 border border-red-500/30 rounded-lg">
                  <p className="text-xs text-red-300">
                    <span className="font-semibold">Punishment: </span>
                    {activity.metadata.punishment}
                  </p>
                </div>
              )}

              {activity.metadata?.choice && (
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                  activity.metadata.choice === 'FOR' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {activity.metadata.choice === 'FOR' ? '👍 FOR' : '👎 AGAINST'} 
                  {activity.metadata.stake && ` • ${activity.metadata.stake} pts`}
                </span>
              )}

              {activity.metadata?.result && (
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                  activity.metadata.result === 'WON' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {activity.metadata.result === 'WON' ? 'Won' : 'Lost'}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
