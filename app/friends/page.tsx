'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  username: string
  points: number
  avatar?: string
}

interface Friendship {
  id: string
  userId: string
  friendId: string
  status: string
  user?: User
  friend?: User
}

export default function FriendsPage() {
  const { user, token, isLoading } = useAuth()
  const router = useRouter()
  const [friends, setFriends] = useState<User[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'friends' | 'search'>('friends')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, isLoading, router])

  // Fetch friends and all users
  useEffect(() => {
    if (user && token) {
      fetchFriends()
      fetchAllUsers()
    }
  }, [user, token])

  const fetchFriends = async () => {
    try {
      const response = await fetch('/api/friends', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setFriends(data)
      }
    } catch (error) {
      console.error('Error fetching friends:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllUsers = async () => {
    try {
      const response = await fetch('/api/users/search', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setAllUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleAddFriend = async (friendId: string) => {
    try {
      const response = await fetch('/api/friends/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ friendId }),
      })
      
      if (response.ok) {
        alert('Friend added successfully!')
        fetchFriends()
        fetchAllUsers()
      } else {
        alert('Failed to add friend')
      }
    } catch (error) {
      console.error('Error adding friend:', error)
      alert('Error adding friend')
    }
  }

  const handleRemoveFriend = async (friendId: string) => {
    try {
      const response = await fetch('/api/friends/remove', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ friendId }),
      })
      
      if (response.ok) {
        alert('Friend removed')
        fetchFriends()
      } else {
        alert('Failed to remove friend')
      }
    } catch (error) {
      console.error('Error removing friend:', error)
    }
  }

  const handleStartConversation = async (friendId: string) => {
    try {
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          participantIds: [friendId],
          type: 'DIRECT',
        }),
      })
      
      if (response.ok) {
        const conversation = await response.json()
        router.push('/chat')
      } else {
        alert('Failed to start conversation')
      }
    } catch (error) {
      console.error('Error starting conversation:', error)
    }
  }

  const filteredUsers = allUsers.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) &&
    u.id !== user?.id &&
    !friends.some(f => f.id === u.id)
  )

  if (isLoading || loading || !user) {
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="text-gray-400 hover:text-white flex items-center gap-2 mb-2">
            <span>←</span> Back to Home
          </Link>
          <h1 className="text-2xl font-bold text-white">Friends</h1>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'friends'
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-neon'
                : 'glass-effect text-gray-400 hover:text-white'
            }`}
          >
            My Friends ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'search'
                ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-dark-900 shadow-gold'
                : 'glass-effect text-gray-400 hover:text-white'
            }`}
          >
            🔍 Find Players
          </button>
        </div>

        {activeTab === 'friends' ? (
          <div className="glass-effect rounded-2xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Your Friends</h2>
            {friends.length === 0 ? (
              <div className="text-center py-12">

                <h3 className="text-xl font-bold text-white mb-2">No friends yet</h3>
                <p className="text-gray-400 mb-6">Add some friends to start betting together!</p>
                <button
                  onClick={() => setActiveTab('search')}
                  className="px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-dark-900 rounded-lg font-bold hover:shadow-gold transition-all"
                >
                  Find Players
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="glass-effect p-4 rounded-lg border border-gray-700 hover:border-purple-500 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-gold-500 flex items-center justify-center text-white font-bold">
                        {friend.username[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-white">{friend.username}</p>
                        <p className="text-sm text-gray-400">{friend.points} points</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleStartConversation(friend.id)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:shadow-neon rounded-lg transition-all"
                      >
                        Message
                      </button>
                      <button 
                        onClick={() => handleRemoveFriend(friend.id)}
                        className="px-4 py-2 glass-effect border border-gray-600 text-gray-400 hover:border-red-500 hover:text-red-400 rounded-lg transition-all"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="glass-effect rounded-2xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Find Players</h2>
            
            {/* Search Input */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search by username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg focus:border-gold-500 focus:ring-2 focus:ring-gold-500 focus:ring-opacity-50 outline-none transition-all text-white"
              />
            </div>

            {/* Users List */}
            <div className="space-y-3">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No players found</p>
                </div>
              ) : (
                filteredUsers.map((foundUser) => (
                  <div
                    key={foundUser.id}
                    className="glass-effect p-4 rounded-lg border border-gray-700 hover:border-gold-500 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-gold-500 flex items-center justify-center text-white font-bold shadow-neon">
                        {foundUser.username[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-white">{foundUser.username}</p>
                        <p className="text-sm text-gray-400">{foundUser.points} points</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddFriend(foundUser.id)}
                      className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
                    >
                      + Add Friend
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
