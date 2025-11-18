'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import BetFeed from '@/components/BetFeed'
import CreateBetModal, { BetFormData } from '@/components/CreateBetModal'
import ActivityFeed from '@/components/ActivityFeed'
import PostBox from '@/components/PostBox'
import Link from 'next/link'

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [feed, setFeed] = useState<any[]>([])
  const [loadingFeed, setLoadingFeed] = useState(true)
  const [activities, setActivities] = useState<any[]>([])
  const [loadingActivities, setLoadingActivities] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { user, logout, isLoading, token } = useAuth()
  const router = useRouter()
  const notificationRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user && token) {
      fetchFeed()
      fetchActivities()
      fetchNotifications()
    }
  }, [user, token])

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      // Check if click is outside both the button and the dropdown
      if (notificationRef.current && !notificationRef.current.contains(target)) {
        // Also check if the click is not on any notification dropdown element
        const notificationDropdown = document.querySelector('[data-notification-dropdown]')
        if (notificationDropdown && !notificationDropdown.contains(target)) {
          setShowNotifications(false)
        } else if (!notificationDropdown) {
          setShowNotifications(false)
        }
      }
    }

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNotifications])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const markAsRead = async (notificationId?: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          notificationId,
          markAllRead: !notificationId,
        }),
      })
      fetchNotifications()
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const fetchFeed = async () => {
    setLoadingFeed(true)
    try {
      const response = await fetch('/api/feed', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setFeed(data)
      }
    } catch (error) {
      console.error('Error fetching feed:', error)
    } finally {
      setLoadingFeed(false)
    }
  }

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/activities', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setActivities(data)
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoadingActivities(false)
    }
  }

  const handlePost = async (content: string) => {
    try {
      const response = await fetch('/api/posts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      })
      
      if (response.ok) {
        fetchActivities()
      } else {
        alert('Failed to post')
      }
    } catch (error) {
      console.error('Error posting:', error)
      throw error
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

  const handleCreateBet = async (betData: BetFormData) => {
    try {
      const response = await fetch('/api/bets/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...betData,
          deadline: new Date(betData.deadline).toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create bet')
      }

      const newBet = await response.json()
      setIsModalOpen(false)
      alert('Bet created successfully!')
      fetchFeed() // Refresh feed
    } catch (error) {
      console.error('Error creating bet:', error)
      alert('Failed to create bet')
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
                <Link href="/" className="px-4 py-2 text-white hover:text-gold-400 transition-colors font-semibold">
                  Home
                </Link>
                <Link href="/challenges" className="px-4 py-2 text-gray-400 hover:text-gold-400 transition-colors">
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
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative glass-effect p-3 rounded-lg border border-gray-700 hover:border-purple-500 transition-all"
                  ref={notificationRef}
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Notifications Dropdown - Fixed Position */}
              {showNotifications && (
                <div 
                  data-notification-dropdown
                  className="fixed top-20 right-8 w-96 glass-effect border border-gray-700 rounded-xl shadow-neon max-h-96 overflow-y-auto"
                  style={{ zIndex: 10000 }}
                >
                  <div className="p-4 border-b border-gray-700 flex items-center justify-between sticky top-0 glass-effect">
                    <h3 className="font-bold text-white">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAsRead()}
                        className="text-xs text-purple-400 hover:text-purple-300"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    <div>
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-4 border-b border-gray-700 hover:bg-dark-700 cursor-pointer ${
                            !notif.isRead ? 'bg-purple-950/20' : ''
                          }`}
                          onClick={() => {
                            markAsRead(notif.id)
                            if (notif.link) router.push(notif.link)
                          }}
                        >
                          <h4 className="text-white font-semibold text-sm mb-1">{notif.title}</h4>
                          <p className="text-gray-400 text-xs">{notif.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Points Display */}
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

              {/* Profile Button */}
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

              {/* Logout */}
              <button
                onClick={logout}
                className="px-4 py-2 text-gray-400 hover:text-red-400 transition-colors"
                title="Logout"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Bet Feed */}
          <div className="lg:col-span-2">
            {/* Action Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">Bet Feed</h2>
                  <p className="text-gray-400">
                    See what's happening with challenges, proofs, and completions
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-dark-900 rounded-xl font-bold shadow-gold hover:shadow-neon transition-all transform hover:scale-105 flex items-center gap-2"
                >
                  <span className="text-xl">+</span>
                  Create Bet
                </button>
              </div>
            </div>

            {/* Bet Feed */}
            <BetFeed 
              feed={feed}
              isLoading={loadingFeed}
            />
          </div>

          {/* Right Column - Activity Feed */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                Live Feed
              </h2>
              
              {/* Post Box */}
              <div className="mb-6">
                <PostBox 
                  onPost={handlePost}
                  username={user.username}
                />
              </div>

              {/* Activity Feed */}
              <ActivityFeed 
                activities={activities}
                isLoading={loadingActivities}
              />
            </div>
          </div>
        </div>
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
