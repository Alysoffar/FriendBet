'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDateTime } from '@/lib/utils'

interface Message {
  id: string
  senderId: string
  message: string
  createdAt: string | Date
  sender: {
    id: string
    username: string
    avatar?: string
  }
}

interface Conversation {
  id: string
  type: 'direct' | 'group'
  name?: string
  participants: Array<{
    id: string
    username: string
    avatar?: string
    isOnline?: boolean
  }>
  lastMessage?: Message
  unreadCount: number
}

export default function ChatPage() {
  const { user, token, isLoading } = useAuth()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user && token) {
      cleanupDuplicates()
      fetchConversations()
    }
  }, [user, token])

  const cleanupDuplicates = async () => {
    try {
      await fetch('/api/chat/conversations/cleanup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
    } catch (error) {
      console.error('Cleanup error:', error)
    }
  }

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const getOtherUser = (conv: Conversation) => {
    return conv.participants.find(p => p.id !== user?.id)
  }

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/chat/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    try {
      const response = await fetch(`/api/chat/conversations/${selectedConversation}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: newMessage }),
      })

      if (response.ok) {
        const message = await response.json()
        setMessages([...messages, message])
        setNewMessage('')
        fetchConversations() // Update last message
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const getConversationName = (conv: Conversation) => {
    if (conv.type === 'group') {
      return conv.name || 'Group Chat'
    }
    const otherUser = getOtherUser(conv)
    return otherUser?.username || 'Unknown'
  }

  const getConversationAvatar = (conv: Conversation) => {
    if (conv.type === 'group') {
      return 'Group'
    }
    const otherUser = getOtherUser(conv)
    return otherUser?.username[0].toUpperCase() || '?'
  }

  if (isLoading || loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gradient font-bold animate-pulse">Loading...</div>
      </div>
    )
  }

  const selectedConv = conversations.find(c => c.id === selectedConversation)

  return (
    <div className="min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-slow"></div>
      </div>

      {/* Header */}
      <header className="relative glass-effect border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="text-gray-400 hover:text-white flex items-center gap-2 mb-2">
            <span>←</span> Back to Home
          </Link>
          <h1 className="text-2xl font-bold text-white">Messages</h1>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <div className="glass-effect rounded-xl border border-gray-700 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Chats</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-8 text-center">

                  <p className="text-gray-400">No conversations yet</p>
                  <Link
                    href="/friends"
                    className="inline-block mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-gold-500 text-white rounded-lg font-semibold hover:shadow-neon transition-all"
                  >
                    Add Friends
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {conversations.map((conv) => {
                    const otherUser = getOtherUser(conv)
                    return (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv.id)}
                        className={`w-full p-4 text-left hover:bg-dark-700 transition-all ${
                          selectedConversation === conv.id ? 'bg-dark-700 border-l-4 border-gold-500' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-gold-500 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-neon">
                              {getConversationAvatar(conv)}
                            </div>
                            {conv.type === 'direct' && otherUser?.isOnline && (
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-dark rounded-full"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-bold text-white truncate">{getConversationName(conv)}</h3>
                              {conv.unreadCount > 0 && (
                                <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full font-bold">
                                  {conv.unreadCount}
                                </span>
                              )}
                            </div>
                            {conv.lastMessage && (
                              <p className="text-sm text-gray-400 truncate">
                                {conv.lastMessage.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 glass-effect rounded-xl border border-gray-700 overflow-hidden flex flex-col">
            {selectedConv ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-700 bg-gradient-to-r from-purple-600/20 to-gold-500/20">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-gold-500 flex items-center justify-center text-white font-bold shadow-neon">
                        {getConversationAvatar(selectedConv)}
                      </div>
                      {selectedConv.type === 'direct' && getOtherUser(selectedConv)?.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-dark rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{getConversationName(selectedConv)}</h3>
                      <p className="text-xs text-gray-400">
                        {selectedConv.type === 'group' 
                          ? `${selectedConv.participants.length} members`
                          : getOtherUser(selectedConv)?.isOnline ? 'Online' : 'Offline'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => {
                    const isOwnMessage = msg.senderId === user.id
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                          {!isOwnMessage && (
                            <p className="text-xs text-gray-400 mb-1 ml-2">{msg.sender.username}</p>
                          )}
                          <div
                            className={`px-4 py-2 rounded-2xl ${
                              isOwnMessage
                                ? 'bg-gradient-to-r from-purple-600 to-gold-500 text-white rounded-br-none'
                                : 'glass-effect border border-gray-600 text-white rounded-bl-none'
                            }`}
                          >
                            <p className="text-sm">{msg.message}</p>
                            <p className={`text-xs mt-1 ${isOwnMessage ? 'text-white/70' : 'text-gray-500'}`}>
                              {formatDateTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg focus:border-gold-500 focus:ring-2 focus:ring-gold-500 focus:outline-none text-white placeholder-gray-500"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className={`px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                        !newMessage.trim()
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-600 to-gold-500 text-white shadow-neon'
                      }`}
                    >
                      Send
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">

                  <h3 className="text-2xl font-bold text-white mb-2">Select a conversation</h3>
                  <p className="text-gray-400">Choose a chat to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
