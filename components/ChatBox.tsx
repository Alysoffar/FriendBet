'use client'

import { useState, useRef, useEffect } from 'react'
import { formatDateTime } from '@/lib/utils'

interface Message {
  id: string
  message: string
  type: string
  createdAt: string | Date
  sender: {
    id: string
    username: string
    avatar?: string | null
  }
}

interface ChatBoxProps {
  betId: string
  messages: Message[]
  currentUserId: string
  onSendMessage: (message: string, type?: string) => void
}

/**
 * ChatBox component - displays chat messages for a bet
 */
export default function ChatBox({ betId, messages, currentUserId, onSendMessage }: ChatBoxProps) {
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim())
      setNewMessage('')
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 flex flex-col h-[500px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary p-4 rounded-t-xl">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          Bet Chat
          <span className="text-sm opacity-80">({messages.length} messages)</span>
        </h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-10">
            <div className="text-4xl mb-2">💭</div>
            <p>No messages yet. Be the first to comment!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isCurrentUser = msg.sender.id === currentUserId
            const isSystem = msg.type === 'SYSTEM'

            if (isSystem) {
              return (
                <div key={msg.id} className="text-center">
                  <span className="inline-block bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {msg.message}
                  </span>
                </div>
              )
            }

            return (
              <div
                key={msg.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-[70%] rounded-lg p-3
                    ${
                      isCurrentUser
                        ? 'bg-gradient-to-r from-primary to-secondary text-white'
                        : 'bg-gray-100 text-gray-800'
                    }
                  `}
                >
                  {!isCurrentUser && (
                    <p className="text-xs font-semibold mb-1 opacity-80">
                      {msg.sender.username}
                    </p>
                  )}
                  <p className="text-sm">{msg.message}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isCurrentUser ? 'text-white opacity-70' : 'text-gray-500'
                    }`}
                  >
                    {formatDateTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t-2 border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            maxLength={500}
            className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className={`
              px-6 py-2 rounded-lg font-semibold transition-all
              ${
                newMessage.trim()
                  ? 'bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}
