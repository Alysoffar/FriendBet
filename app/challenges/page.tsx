'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import Link from 'next/link'
import CreateBetModal, { BetFormData } from '@/components/CreateBetModal'

type Challenge = {
  id: string
  title: string
  description: string
  deadline: string
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  result?: 'WON' | 'LOST'
  category: string
  creator: {
    id: string
    username: string
    avatar?: string
  }
  forBets: number
  againstBets: number
  totalBets: number
  predictions?: Array<{
    id: string
    choice: string
    user: {
      id: string
      username: string
    }
  }>
}

export default function ChallengesPage() {
  const [myChallenges, setMyChallenges] = useState<Challenge[]>([])
  const [friendsChallenges, setFriendsChallenges] = useState<Challenge[]>([])
  const [activeTab, setActiveTab] = useState<'my' | 'friends'>('my')
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'failed'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { user, token, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user && token) {
      fetchMyChallenges()
      fetchFriendsChallenges()
    }
  }, [user, token])

  const fetchMyChallenges = async () => {
    try {
      const response = await fetch('/api/challenges/my', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setMyChallenges(data)
      }
    } catch (error) {
      console.error('Error fetching my challenges:', error)
    }
  }

  const fetchFriendsChallenges = async () => {
    try {
      const response = await fetch('/api/challenges/friends', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setFriendsChallenges(data)
      }
    } catch (error) {
      console.error('Error fetching friends challenges:', error)
    }
  }

  const handleCreateBet = async (formData: BetFormData) => {
    try {
      const response = await fetch('/api/bets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to create bet')
      }

      setIsModalOpen(false)
      alert('Challenge created successfully!')
      fetchMyChallenges()
    } catch (error) {
      console.error('Error creating bet:', error)
      alert('Failed to create challenge')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gradient font-bold animate-pulse">Loading...</div>
      </div>
    )
  }

  if (!user) return null

  const currentChallenges = activeTab === 'my' ? myChallenges : friendsChallenges

  const filteredChallenges = currentChallenges.filter((c: Challenge) => {
    if (filter === 'all') return true
    if (filter === 'active') return c.status === 'ACTIVE'
    if (filter === 'completed') return c.status === 'COMPLETED' && c.result === 'WON'
    if (filter === 'failed') return c.status === 'COMPLETED' && c.result === 'LOST'
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-gold-400 border-gold-500'
      case 'COMPLETED': return 'text-green-400 border-green-500'
      case 'CANCELLED': return 'text-red-400 border-red-500'
      default: return 'text-gray-400 border-gray-500'
    }
  }

  return (
    <div className="min-h-screen">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-slow"></div>
      </div>

      {/* Header */}
      <header className="relative glass-effect border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-gradient animate-float">FriendBet</h1>
              <nav className="hidden md:flex gap-4">
                <Link href="/" className="px-4 py-2 text-gray-400 hover:text-gold-400 transition-colors">
                  Home
                </Link>
                <Link href="/challenges" className="px-4 py-2 text-white hover:text-gold-400 transition-colors font-semibold">
                  Challenges
                </Link>
                <Link href="/chat" className="px-4 py-2 text-gray-400 hover:text-gold-400 transition-colors">
                  Chat
                </Link>
                <Link href="/friends" className="px-4 py-2 text-gray-400 hover:text-gold-400 transition-colors">
                  Friends
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="glass-effect px-4 py-2 rounded-lg border border-gold-500">
                <div className="flex items-center gap-2">
                  <svg className="w-6 h-6 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-400">Your Points</p>
                    <p className="text-xl font-bold text-gradient">{user.points}</p>
                  </div>
                </div>
              </div>

              <Link
                href="/profile"
                className="glass-effect px-4 py-2 rounded-lg hover:border-purple-500 border border-gray-700 transition-all transform hover:scale-105"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-gold-500 flex items-center justify-center text-white font-bold shadow-neon">
                    {user.username[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-white font-semibold">{user.username}</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">Challenges</h2>
          <p className="text-gray-400">
            Track your challenges and see what your friends are up to
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 flex gap-4 flex-wrap">
          <button
            onClick={() => setActiveTab('my')}
            className={`px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-105 ${
              activeTab === 'my'
                ? 'bg-gradient-to-r from-purple-600 to-gold-500 text-white shadow-neon'
                : 'glass-effect text-gray-400 border border-gray-700 hover:border-gray-600'
            }`}
          >
            My Challenges ({myChallenges.length})
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-105 ${
              activeTab === 'friends'
                ? 'bg-gradient-to-r from-purple-600 to-gold-500 text-white shadow-neon'
                : 'glass-effect text-gray-400 border border-gray-700 hover:border-gray-600'
            }`}
          >
            Friends' Challenges ({friendsChallenges.length})
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="ml-auto px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white rounded-xl font-bold shadow-neon transition-all transform hover:scale-105"
          >
            + Create Challenge
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          {(['all', 'active', 'completed', 'failed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 whitespace-nowrap ${
                filter === f
                  ? 'bg-gradient-to-r from-purple-600 to-gold-500 text-white shadow-neon'
                  : 'glass-effect text-gray-400 border border-gray-700 hover:border-gray-600'
              }`}
            >
              {f === 'all' ? 'All' : f === 'active' ? 'Active' : f === 'completed' ? 'Completed' : 'Failed'}
            </button>
          ))}
        </div>

        {/* Challenges List */}
        {filteredChallenges.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-block glass-effect rounded-3xl p-12 mb-6 animate-float">
              <div className="glass-effect rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6">
                <svg className="w-20 h-20 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-white mb-3">No Challenges Yet</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                {activeTab === 'my' 
                  ? 'Create your first challenge and start betting with friends!'
                  : 'Your friends haven\'t created any challenges yet.'}
              </p>
              {activeTab === 'my' && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white rounded-xl font-bold text-lg shadow-neon hover:shadow-neon-blue transition-all transform hover:scale-105"
                >
                  Create Your First Challenge
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChallenges.map((challenge: Challenge) => (
              <div
                key={challenge.id}
                className="glass-effect rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all transform hover:scale-105 cursor-pointer"
                onClick={() => router.push(`/bets/${challenge.id}`)}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getStatusColor(challenge.status)}`}>
                    {challenge.status}
                  </span>
                  <span className="text-xs text-gray-400">
                    {challenge.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">
                  {challenge.title}
                </h3>

                {/* Creator */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-gold-500 flex items-center justify-center text-white text-xs font-bold">
                    {challenge.creator.username[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-400">
                    by {challenge.creator.username}
                  </span>
                </div>

                {/* Bets For/Against */}
                <div className="mb-4 p-4 bg-dark-800 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Predictions</span>
                    <span className="text-sm font-bold text-white">{challenge.totalBets}</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-green-950/50 border border-green-500/30 rounded px-3 py-2">
                      <div className="text-xs text-green-400 mb-1">For</div>
                      <div className="text-lg font-bold text-green-300">{challenge.forBets}</div>
                    </div>
                    <div className="flex-1 bg-red-950/50 border border-red-500/30 rounded px-3 py-2">
                      <div className="text-xs text-red-400 mb-1">Against</div>
                      <div className="text-lg font-bold text-red-300">{challenge.againstBets}</div>
                    </div>
                  </div>
                </div>

                {/* Deadline */}
                <div className="text-xs text-gray-500">
                  Deadline: {new Date(challenge.deadline).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Bet Modal */}
      <CreateBetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateBet}
      />
    </div>
  )
}
