'use client'

import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { formatDateTime } from '@/lib/utils'

export default function ProfilePage() {
  const { user, token, logout, isLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({ betsCreated: 0, predictions: 0, wins: 0 })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user && token) {
      fetchUserStats()
      fetchRecentActivity()
    }
  }, [user, token])

  const fetchUserStats = async () => {
    try {
      const response = await fetch(`/api/bets/user/${user?.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        const wins = data.created.filter((b: any) => b.status === 'COMPLETED' && b.result === 'WON').length
        setStats({
          betsCreated: data.created.length,
          predictions: data.participated.length,
          wins,
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch(`/api/bets/user/${user?.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        const activities = [
          ...data.created.slice(0, 5).map((bet: any) => ({
            id: bet.id,
            type: 'bet_created',
            title: bet.title,
            status: bet.status,
            result: bet.result,
            createdAt: bet.createdAt,
          })),
          ...data.participated.slice(0, 5).map((bet: any) => ({
            id: bet.id,
            type: 'prediction',
            title: bet.title,
            status: bet.status,
            result: bet.result,
            choice: bet.predictions[0]?.choice,
            createdAt: bet.predictions[0]?.createdAt,
          })),
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        
        setRecentActivity(activities.slice(0, 10))
      }
    } catch (error) {
      console.error('Error fetching activity:', error)
    } finally {
      setLoading(false)
    }
  }

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-2xl text-gradient font-bold animate-pulse">Loading...</div>
    </div>
  }

  return (
    <div className="min-h-screen">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-slow"></div>
      </div>

      {/* Header */}
      <header className="relative glass-effect border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="text-gray-400 hover:text-white flex items-center gap-2 mb-2">
            <span>←</span> Back to Home
          </Link>
          <h1 className="text-2xl font-bold text-white">Your Profile</h1>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="glass-effect rounded-2xl p-8 mb-6 border border-gray-700">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-gold-500 flex items-center justify-center text-white text-4xl font-bold shadow-neon animate-float">
              {user.username[0].toUpperCase()}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">{user.username}</h2>
              <p className="text-gray-400 mb-4">{user.email}</p>
              
              {/* Points */}
              <div className="inline-block glass-effect px-6 py-3 rounded-lg border border-gold-500">
                <div className="flex items-center gap-3">
                  <svg className="w-8 h-8 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-400">Total Points</p>
                    <p className="text-2xl font-bold text-gradient">{user.points}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="px-4 py-2 glass-effect border border-red-500 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="glass-effect p-6 rounded-xl border border-gray-700 hover:border-purple-500 transition-all">
            <h3 className="text-2xl font-bold text-white mb-1">{stats.betsCreated}</h3>
            <p className="text-gray-400 text-sm">Bets Created</p>
          </div>

          <div className="glass-effect p-6 rounded-xl border border-gray-700 hover:border-gold-500 transition-all">
            <h3 className="text-2xl font-bold text-white mb-1">{stats.predictions}</h3>
            <p className="text-gray-400 text-sm">Predictions Made</p>
          </div>

          <div className="glass-effect p-6 rounded-xl border border-gray-700 hover:border-green-500 transition-all">
            <h3 className="text-2xl font-bold text-white mb-1">{stats.wins}</h3>
            <p className="text-gray-400 text-sm">Wins</p>
          </div>
        </div>

        {/* Powerups */}
        <div className="glass-effect rounded-2xl p-6 border border-gray-700 mb-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            Active Powerups
          </h3>
          <div className="text-center py-8 text-gray-500">
            <p>No active powerups. Win bets to earn special abilities!</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-effect rounded-2xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            Recent Activity
          </h3>
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              <p>Loading...</p>
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No activity yet. Create your first bet to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <Link
                  key={activity.id}
                  href={`/bets/${activity.id}`}
                  className="block glass-effect p-4 rounded-lg border border-gray-700 hover:border-purple-500 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {activity.type === 'bet_created' ? (
                          <span className="text-purple-400">Created bet</span>
                        ) : (
                          <span className="text-gold-400">
                            Predicted {activity.choice}
                          </span>
                        )}
                      </div>
                      <h4 className="text-white font-semibold mb-1">{activity.title}</h4>
                      <p className="text-xs text-gray-500">{formatDateTime(activity.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      {activity.status === 'COMPLETED' && (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          activity.result === 'WON' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-red-600 text-white'
                        }`}>
                          {activity.result === 'WON' ? 'Won' : 'Lost'}
                        </span>
                      )}
                      {activity.status === 'ACTIVE' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-600 text-white">
                          ⏳ Active
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
