'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import PredictionPanel from '@/components/PredictionPanel'
import ChatBox from '@/components/ChatBox'
import PunishmentVote from '@/components/PunishmentVote'
import ProofVerification from '@/components/ProofVerification'
import { getCategoryEmoji, formatDateTime, getTimeRemaining } from '@/lib/utils'
import Link from 'next/link'

/**
 * Bet Details Page - shows full bet information with predictions, chat, and punishments
 */
export default function BetDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const betId = params?.id as string
  const { user, token, isLoading } = useAuth()

  const [bet, setBet] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showProofUpload, setShowProofUpload] = useState(false)
  const [proofUrl, setProofUrl] = useState('')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofText, setProofText] = useState('')
  const [uploadingProof, setUploadingProof] = useState(false)
  const [betResult, setBetResult] = useState<'WON' | 'LOST'>('WON')
  const [currentUserPoints, setCurrentUserPoints] = useState(0)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (betId && token) {
      fetchBetDetails()
      fetchUserPoints()
    }
  }, [betId, token])

  const fetchUserPoints = async () => {
    try {
      const response = await fetch('/api/user/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setCurrentUserPoints(userData.points)
      }
    } catch (error) {
      console.error('Error fetching user points:', error)
    }
  }

  const fetchBetDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/bets/${betId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch bet details')
      }

      const data = await response.json()
      setBet(data)
    } catch (error) {
      console.error('Error fetching bet:', error)
      setError('Failed to load bet details')
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (choice: 'FOR' | 'AGAINST', stake: number, punishment?: string) => {
    try {
      const response = await fetch(`/api/bets/${betId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ choice, stake, punishment }),
      })

      if (!response.ok) {
        throw new Error('Failed to vote')
      }

      alert(`Voted ${choice} with ${stake} points!`)
      fetchBetDetails() // Refresh bet data
      fetchUserPoints() // Refresh user points
    } catch (error) {
      console.error('Error voting:', error)
      alert('Failed to vote')
    }
  }

  const handleSendMessage = async (message: string, type = 'TEXT') => {
    try {
      const response = await fetch(`/api/bets/${betId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message, type }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      fetchBetDetails() // Refresh to show new message
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleSuggestPunishment = async (description: string, type: string) => {
    try {
      const response = await fetch(`/api/bets/${betId}/punishments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ description, type }),
      })

      if (!response.ok) {
        throw new Error('Failed to suggest punishment')
      }

      alert('Punishment suggested!')
      fetchBetDetails()
    } catch (error) {
      console.error('Error suggesting punishment:', error)
      alert('Failed to suggest punishment')
    }
  }

  const handleVotePunishment = async (punishmentId: string) => {
    try {
      const response = await fetch(`/api/punishments/${punishmentId}/vote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to vote for punishment')
      }

      fetchBetDetails()
    } catch (error) {
      console.error('Error voting punishment:', error)
    }
  }

  const handleSubmitProof = async () => {
    try {
      setUploadingProof(true)
      let finalProofUrl = proofUrl

      // If there's a file to upload, convert to base64 for simplicity
      // In production, you'd upload to a proper storage service
      if (proofFile) {
        const reader = new FileReader()
        finalProofUrl = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(proofFile)
        })
      } else if (bet.proofRequired === 'TEXT' && proofText) {
        finalProofUrl = proofText
      }

      // If deadline has passed, resolve the bet
      if (isExpired) {
        const response = await fetch(`/api/bets/${betId}/resolve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            result: betResult,
            proofUrl: finalProofUrl || undefined,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to submit proof')
        }

        alert('Bet resolved successfully!')
      } else {
        // Just upload proof without resolving
        const response = await fetch(`/api/bets/${betId}/proof`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            proofUrl: finalProofUrl,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to upload proof')
        }

        alert('Proof uploaded successfully! The bet will be resolved after the deadline.')
      }

      setShowProofUpload(false)
      setProofFile(null)
      setProofUrl('')
      setProofText('')
      fetchBetDetails()
    } catch (error) {
      console.error('Error submitting proof:', error)
      alert('Failed to submit proof')
    } finally {
      setUploadingProof(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading bet details...</p>
        </div>
      </div>
    )
  }

  if (error || !bet) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Bet not found'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  const isActive = bet.status === 'ACTIVE'
  const isExpired = new Date(bet.deadline) < new Date()
  const showPunishments = bet.status === 'COMPLETED' && bet.result === 'LOST'
  const hasVoted = bet.predictions?.some((p: any) => p.userId === user?.id)
  const userPoints = currentUserPoints || user?.points || 0

  return (
    <div className="min-h-screen bg-dark">
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
              <div className="text-right hidden md:block">
                <p className="text-xs text-gray-400">Logged in as</p>
                <p className="text-sm font-semibold text-white">{user?.username}</p>
              </div>
              <Link
                href="/profile"
                className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-gold-500 flex items-center justify-center text-white font-bold shadow-neon hover:scale-110 transition-transform"
              >
                {user?.username?.[0]?.toUpperCase()}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="mb-6 px-4 py-2 glass-effect border border-gray-700 text-white rounded-lg hover:border-purple-500 transition-colors flex items-center gap-2"
        >
          <span>←</span> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Bet Info */}
          <div className="lg:col-span-2 space-y-6">{/* Bet Card */}
            <div className="glass-effect rounded-xl shadow-neon p-6 border-2 border-purple-500">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{getCategoryEmoji(bet.category)}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{bet.title}</h2>
                    <p className="text-sm text-gray-400">by {bet.creator.username}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Deadline</p>
                  <p className="text-sm font-bold text-gold-400">{formatDateTime(bet.deadline)}</p>
                  <p className="text-xs text-purple-400 font-semibold mt-1">
                    {getTimeRemaining(bet.deadline)} left
                  </p>
                </div>
              </div>

              <p className="text-gray-300 mb-6">{bet.description}</p>

              {/* Punishment Display */}
              {bet.punishments && bet.punishments.length > 0 && (
                <div className="mb-6 p-4 bg-red-950/30 border-2 border-red-500/50 rounded-lg">
                  <div className="flex items-start gap-3">

                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-red-400 mb-2">Punishment if Failed</h3>
                      <p className="text-gray-300 font-medium">{bet.punishments[0].description}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-dark/50 rounded-lg border border-gray-700">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-400">{bet.stats?.totalPool || 0}</p>
                  <p className="text-xs text-gray-400">Total Pool</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{bet.stats?.forCount || 0}</p>
                  <p className="text-xs text-gray-400">Voting FOR</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-400">{bet.stats?.againstCount || 0}</p>
                  <p className="text-xs text-gray-400">Voting AGAINST</p>
                </div>
              </div>
            </div>

            {/* Prediction Panel */}
            {isActive && !isExpired && bet.creator.id !== user?.id && (
              <PredictionPanel
                betId={betId}
                userPoints={userPoints}
                hasVoted={hasVoted}
                onVote={handleVote}
              />
            )}

            {/* Proof Upload Section - Available anytime for bet creator */}
            {bet.creator.id === user?.id && bet.status === 'ACTIVE' && (
              <div className="glass-effect rounded-xl p-6 border-2 border-gold-500">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <svg className="w-6 h-6 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload Proof
                  </h3>
                  {!isExpired && (
                    <span className="text-xs text-gray-400 bg-purple-950/50 px-3 py-1 rounded-full border border-purple-500/30">
                      Available before deadline
                    </span>
                  )}
                </div>
                
                {isExpired ? (
                  <p className="text-gray-300 mb-4">
                    The deadline has passed. Submit proof and resolve this bet.
                  </p>
                ) : (
                  <p className="text-gray-300 mb-4">
                    You can upload proof of completion anytime. The bet will be resolved after the deadline.
                  </p>
                )}

                {!showProofUpload ? (
                  <button
                    onClick={() => setShowProofUpload(true)}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-gold-500 text-white rounded-lg font-semibold hover:shadow-neon transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {isExpired ? 'Upload Proof & Resolve' : 'Upload Proof'}
                  </button>
                ) : (
                  <div className="space-y-4">
                    {/* Result Selection - only required if deadline passed */}
                    {isExpired && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Did you complete the bet?
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => setBetResult('WON')}
                            className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                              betResult === 'WON'
                                ? 'bg-green-600 text-white shadow-neon'
                                : 'glass-effect border border-gray-600 text-gray-300 hover:border-green-500'
                            }`}
                          >
                            Yes, I completed it
                          </button>
                          <button
                            onClick={() => setBetResult('LOST')}
                            className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                              betResult === 'LOST'
                                ? 'bg-red-600 text-white shadow-neon'
                                : 'glass-effect border border-gray-600 text-gray-300 hover:border-red-500'
                            }`}
                          >
                            No, I failed
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Proof Upload */}
                    {bet.proofRequired !== 'NONE' && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Upload Proof {bet.proofRequired === 'IMAGE' ? '(Image)' : bet.proofRequired === 'VIDEO' ? '(Video)' : '(Text)'}
                        </label>
                        
                        {bet.proofRequired === 'TEXT' ? (
                          <textarea
                            value={proofText}
                            onChange={(e) => setProofText(e.target.value)}
                            placeholder="Describe how you completed the challenge..."
                            rows={4}
                            className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg focus:border-gold-500 focus:ring-2 focus:ring-gold-500 focus:outline-none text-white placeholder-gray-500"
                          />
                        ) : (
                          <div className="space-y-3">
                            <input
                              type="file"
                              accept={bet.proofRequired === 'IMAGE' ? 'image/*' : 'video/*'}
                              onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                              className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg focus:border-gold-500 focus:ring-2 focus:ring-gold-500 focus:outline-none text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-purple-600 file:text-white file:cursor-pointer hover:file:bg-purple-700"
                            />
                            {proofFile && (
                              <div className="text-sm text-green-400 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                {proofFile.name}
                              </div>
                            )}
                            <div className="text-xs text-gray-500">
                              Or paste a URL below instead of uploading a file
                            </div>
                            <input
                              type="url"
                              value={proofUrl}
                              onChange={(e) => setProofUrl(e.target.value)}
                              placeholder="https://example.com/proof.jpg"
                              className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg focus:border-gold-500 focus:ring-2 focus:ring-gold-500 focus:outline-none text-white placeholder-gray-500"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={handleSubmitProof}
                        disabled={uploadingProof || (isExpired && !betResult)}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-gold-500 text-white rounded-lg font-semibold hover:shadow-neon transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        {uploadingProof ? 'Uploading...' : isExpired ? 'Submit & Resolve' : 'Upload Proof'}
                      </button>
                      <button
                        onClick={() => {
                          setShowProofUpload(false)
                          setProofFile(null)
                          setProofUrl('')
                          setProofText('')
                        }}
                        className="px-6 py-3 glass-effect border border-gray-600 text-gray-300 rounded-lg font-semibold hover:border-red-500 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Proof Verification - Show if proof is submitted and verification required */}
            {bet.proofUrl && bet.verificationRequired && (
              <ProofVerification
                betId={betId}
                isCreator={bet.creator.id === user?.id}
                hasPrediction={hasVoted}
                onVoteComplete={fetchBetDetails}
              />
            )}

            {/* Punishments (only if bet lost) */}
            {showPunishments && (
              <PunishmentVote
                punishments={bet.punishments}
                onSuggest={handleSuggestPunishment}
                onVote={handleVotePunishment}
              />
            )}
          </div>

          {/* Right Column - Chat */}
          <div>
            <ChatBox
              betId={betId}
              messages={bet.chatMessages || []}
              currentUserId={user?.id || ''}
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
