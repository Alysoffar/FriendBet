'use client'

import { useState } from 'react'

interface PredictionPanelProps {
  betId: string
  userPoints: number
  hasVoted: boolean
  onVote: (choice: 'FOR' | 'AGAINST', stake: number, punishment?: string) => void
}

/**
 * PredictionPanel component - allows users to vote on a bet
 */
export default function PredictionPanel({ betId, userPoints, hasVoted, onVote }: PredictionPanelProps) {
  const [choice, setChoice] = useState<'FOR' | 'AGAINST'>('FOR')
  const [stake, setStake] = useState(50)
  const [punishment, setPunishment] = useState('')
  const [showPunishment, setShowPunishment] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onVote(choice, stake, punishment.trim() || undefined)
    setPunishment('')
  }

  if (hasVoted) {
    return (
      <div className="glass-effect rounded-xl p-6 border-2 border-green-500">
        <div className="text-center">

          <h3 className="text-lg font-bold text-white mb-1">Prediction Placed!</h3>
          <p className="text-sm text-gray-400">
            You've already voted on this bet. Check back after the deadline to see the results!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-effect rounded-xl p-6 border-2 border-purple-500 shadow-neon">
      <h3 className="text-xl font-bold text-white mb-4">Place Your Prediction</h3>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Choice Buttons */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            Do you think they'll succeed?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setChoice('FOR')}
              className={`
                p-4 rounded-lg border-2 font-semibold transition-all transform hover:scale-105
                ${
                  choice === 'FOR'
                    ? 'border-green-500 bg-gradient-to-r from-green-600 to-green-700 text-white shadow-neon'
                    : 'border-gray-600 bg-dark-700 text-gray-300 hover:border-green-500'
                }
              `}
            >
              <div className="text-2xl mb-1">👍</div>
              <div>FOR</div>
              <div className="text-xs opacity-80">They'll win!</div>
            </button>
            <button
              type="button"
              onClick={() => setChoice('AGAINST')}
              className={`
                p-4 rounded-lg border-2 font-semibold transition-all transform hover:scale-105
                ${
                  choice === 'AGAINST'
                    ? 'border-red-500 bg-gradient-to-r from-red-600 to-red-700 text-white shadow-neon'
                    : 'border-gray-600 bg-dark-700 text-gray-300 hover:border-red-500'
                }
              `}
            >
              <div className="text-2xl mb-1">👎</div>
              <div>AGAINST</div>
              <div className="text-xs opacity-80">They'll fail!</div>
            </button>
          </div>
        </div>

        {/* Stake Slider */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            Stake Points
          </label>
          <div className="glass-effect rounded-lg p-4 border-2 border-gray-600">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-400">Your Points: {userPoints}</span>
              <span className="text-xl font-bold text-gradient">{stake} pts</span>
            </div>
            <input
              type="range"
              min="10"
              max={Math.min(1000, userPoints)}
              step="10"
              value={stake}
              onChange={(e) => setStake(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gold-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>10</span>
              <span>{Math.min(1000, userPoints)}</span>
            </div>
          </div>
        </div>

        {/* Suggest Punishment (optional) */}
        <div>
          <button
            type="button"
            onClick={() => setShowPunishment(!showPunishment)}
            className="text-sm text-gray-400 hover:text-gold-400 transition-colors flex items-center gap-2"
          >
            <span></span>
            {showPunishment ? 'Hide punishment suggestion' : 'Suggest a punishment if they fail (optional)'}
          </button>
          
          {showPunishment && (
            <div className="mt-3">
              <textarea
                value={punishment}
                onChange={(e) => setPunishment(e.target.value)}
                placeholder="e.g., Sing karaoke in public, Do 100 pushups, Dye hair pink..."
                maxLength={500}
                rows={3}
                className="w-full px-4 py-3 bg-red-950/30 border-2 border-red-500/30 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:outline-none resize-none text-white placeholder-gray-500"
              />
              <p className="text-xs text-gray-400 mt-1">Make it fun and embarrassing!</p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={stake > userPoints}
          className={`
            w-full py-4 rounded-lg font-bold text-white text-lg transition-all transform hover:scale-105
            ${
              stake > userPoints
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-gold-500 hover:shadow-neon'
            }
          `}
        >
          {stake > userPoints ? 'Insufficient Points' : 'Place Prediction'}
        </button>
      </form>
    </div>
  )
}
