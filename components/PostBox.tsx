'use client'

import { useState } from 'react'

interface PostBoxProps {
  onPost: (content: string) => Promise<void>
  userAvatar?: string
  username: string
}

export default function PostBox({ onPost, username }: PostBoxProps) {
  const [content, setContent] = useState('')
  const [isPosting, setIsPosting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || isPosting) return

    setIsPosting(true)
    try {
      await onPost(content.trim())
      setContent('')
    } catch (error) {
      console.error('Error posting:', error)
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <div className="glass-effect rounded-xl p-4 border border-purple-500/50 shadow-neon">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-gold-500 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-neon">
            {username[0].toUpperCase()}
          </div>
          
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, predictions, or trash talk..."
              maxLength={500}
              rows={3}
              className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg focus:border-gold-500 focus:ring-2 focus:ring-gold-500 focus:outline-none resize-none text-white placeholder-gray-500"
            />
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">
                {content.length}/500
              </span>
              
              <button
                type="submit"
                disabled={!content.trim() || isPosting}
                className={`px-6 py-2 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                  !content.trim() || isPosting
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-gold-500 text-white shadow-neon hover:shadow-neon-blue'
                }`}
              >
                {isPosting ? '📤 Posting...' : '📢 Post'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
