'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/AuthContext'

type ProofVoteProps = {
  betId: string
  isCreator: boolean
  hasPrediction: boolean
  onVoteComplete: () => void
}

type Vote = {
  vote: 'ACCEPT' | 'REJECT'
  user: {
    id: string
    username: string
    avatar?: string
  }
}

export default function ProofVerification({ betId, isCreator, hasPrediction, onVoteComplete }: ProofVoteProps) {
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [votes, setVotes] = useState<Vote[]>([])
  const [voteCounts, setVoteCounts] = useState({ accept: 0, reject: 0, total: 0, required: 0 })
  const [userVote, setUserVote] = useState<'ACCEPT' | 'REJECT' | null>(null)
  const [isResolved, setIsResolved] = useState(false)

  useEffect(() => {
    fetchVotes()
  }, [betId])

  const fetchVotes = async () => {
    try {
      const response = await fetch(`/api/bets/${betId}/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setVotes(data.votes)
        setVoteCounts(data.counts)
        setUserVote(data.userVote)
      }
    } catch (error) {
      console.error('Error fetching votes:', error)
    }
  }

  const handleVote = async (vote: 'ACCEPT' | 'REJECT') => {
    try {
      setLoading(true)
      const response = await fetch(`/api/bets/${betId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ vote }),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || 'Failed to submit vote')
        return
      }

      const data = await response.json()
      setUserVote(vote)
      setVoteCounts(data.voteCounts)
      setIsResolved(data.resolved)
      
      if (data.resolved) {
        alert('Bet has been resolved based on verification votes!')
        onVoteComplete()
      } else {
        alert('Vote submitted successfully!')
        fetchVotes()
      }
    } catch (error) {
      console.error('Error voting:', error)
      alert('Failed to submit vote')
    } finally {
      setLoading(false)
    }
  }

  if (isCreator) {
    return (
      <div className="glass-effect rounded-xl p-6 border border-blue-500/50 bg-blue-950/20">
        <div className="flex items-center gap-3 mb-4">
          <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-bold text-white">Proof Verification</h3>
        </div>
        
        <p className="text-gray-300 mb-4">
          Bettors are verifying your proof. The bet will be automatically resolved when majority votes are in.
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-950/30 border border-green-500/30 rounded-lg">
            <span className="text-green-300 font-medium">Accepted</span>
            <span className="text-green-400 text-xl font-bold">{voteCounts.accept}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-red-950/30 border border-red-500/30 rounded-lg">
            <span className="text-red-300 font-medium">Rejected</span>
            <span className="text-red-400 text-xl font-bold">{voteCounts.reject}</span>
          </div>
          <div className="text-center text-sm text-gray-400 mt-2">
            {voteCounts.total} / {voteCounts.required} votes needed for resolution
          </div>
        </div>

        {votes.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-xs text-gray-500 mb-2">Votes:</p>
            <div className="space-y-2">
              {votes.map((vote, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{vote.user.username}</span>
                  <span className={vote.vote === 'ACCEPT' ? 'text-green-400' : 'text-red-400'}>
                    {vote.vote === 'ACCEPT' ? '✓ Accept' : '✗ Reject'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (!hasPrediction) {
    return null
  }

  if (userVote) {
    return (
      <div className="glass-effect rounded-xl p-6 border border-purple-500/50">
        <div className="flex items-center gap-3 mb-4">
          <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-bold text-white">Your Vote</h3>
        </div>
        
        <p className="text-gray-300 mb-4">
          You voted: <span className={userVote === 'ACCEPT' ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
            {userVote === 'ACCEPT' ? 'ACCEPT' : 'REJECT'}
          </span>
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-green-950/30 border border-green-500/30 rounded-lg text-center">
            <div className="text-green-400 text-2xl font-bold">{voteCounts.accept}</div>
            <div className="text-green-300 text-xs">Accepted</div>
          </div>
          <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-lg text-center">
            <div className="text-red-400 text-2xl font-bold">{voteCounts.reject}</div>
            <div className="text-red-300 text-xs">Rejected</div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-400 mt-3">
          {voteCounts.total} / {voteCounts.required} votes needed
        </div>

        <button
          onClick={() => setUserVote(null)}
          className="mt-4 w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
        >
          Change Vote
        </button>
      </div>
    )
  }

  return (
    <div className="glass-effect rounded-xl p-6 border border-gold-500/50 bg-gold-950/20">
      <div className="flex items-center gap-3 mb-4">
        <svg className="w-6 h-6 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-bold text-white">Verify Proof</h3>
      </div>

      <p className="text-gray-300 mb-4">
        Review the proof above and vote whether the challenge was completed successfully.
      </p>

      <div className="text-sm text-gray-400 mb-4">
        Current votes: {voteCounts.accept} accept, {voteCounts.reject} reject
        <br />
        {voteCounts.required} votes needed for resolution
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleVote('ACCEPT')}
          disabled={loading}
          className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Voting...' : '✓ Accept'}
        </button>
        <button
          onClick={() => handleVote('REJECT')}
          disabled={loading}
          className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Voting...' : '✗ Reject'}
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-3 text-center">
        Your vote helps ensure fairness. Majority decision will resolve the bet.
      </p>
    </div>
  )
}
