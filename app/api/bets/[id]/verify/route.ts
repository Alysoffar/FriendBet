import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getUserFromRequest } from '@/lib/auth'

const prisma = new PrismaClient()

/**
 * POST /api/bets/[id]/verify - Vote on proof validity
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const betId = params.id
    const { vote } = await request.json()

    if (!vote || (vote !== 'ACCEPT' && vote !== 'REJECT')) {
      return NextResponse.json({ error: 'Invalid vote' }, { status: 400 })
    }

    // Check if bet exists and has proof
    const bet = await prisma.bet.findUnique({
      where: { id: betId },
      include: {
        predictions: true,
      },
    })

    if (!bet) {
      return NextResponse.json({ error: 'Bet not found' }, { status: 404 })
    }

    if (!bet.proofUrl) {
      return NextResponse.json({ error: 'No proof submitted yet' }, { status: 400 })
    }

    if (bet.creatorId === user.userId) {
      return NextResponse.json({ error: 'Cannot vote on your own bet' }, { status: 400 })
    }

    // Check if user has a prediction on this bet
    const userPrediction = bet.predictions.find(p => p.userId === user.userId)
    if (!userPrediction) {
      return NextResponse.json({ error: 'Only bettors can verify proof' }, { status: 400 })
    }

    // Create or update vote
    const proofVote = await prisma.proofVote.upsert({
      where: {
        betId_userId: {
          betId: betId,
          userId: user.userId,
        },
      },
      create: {
        betId: betId,
        userId: user.userId,
        vote: vote,
      },
      update: {
        vote: vote,
      },
    })

    // Count votes
    const votes = await prisma.proofVote.findMany({
      where: { betId },
    })

    const acceptVotes = votes.filter(v => v.vote === 'ACCEPT').length
    const rejectVotes = votes.filter(v => v.vote === 'REJECT').length
    const totalVotes = votes.length
    const totalBettors = bet.predictions.length

    // If majority voted (>50% of bettors) or all voted, resolve bet
    const majorityVoted = totalVotes > totalBettors / 2 || totalVotes === totalBettors
    
    if (majorityVoted && bet.status === 'ACTIVE') {
      const proofAccepted = acceptVotes > rejectVotes

      // Update bet result
      await prisma.bet.update({
        where: { id: betId },
        data: {
          result: proofAccepted ? 'WON' : 'LOST',
          status: 'COMPLETED',
          verificationRequired: false,
        },
      })

      // Calculate payouts
      const totalStaked = bet.predictions.reduce((sum, p) => sum + p.stake, 0)
      const winningChoice = proofAccepted ? 'FOR' : 'AGAINST'
      const winningStaked = bet.predictions
        .filter(p => p.choice === winningChoice)
        .reduce((sum, p) => sum + p.stake, 0)

      // Update each prediction with payout
      for (const prediction of bet.predictions) {
        const won = prediction.choice === winningChoice
        let payout = 0

        if (won && winningStaked > 0) {
          payout = Math.floor((prediction.stake / winningStaked) * totalStaked)
        }

        await prisma.prediction.update({
          where: { id: prediction.id },
          data: { payout },
        })

        // Update user points
        await prisma.user.update({
          where: { id: prediction.userId },
          data: {
            points: {
              increment: won ? payout : -prediction.stake,
            },
          },
        })
      }

      // Create notification for bet creator
      await prisma.notification.create({
        data: {
          userId: bet.creatorId,
          type: 'BET_RESOLVED',
          title: proofAccepted ? 'Proof Accepted!' : 'Proof Rejected!',
          message: proofAccepted 
            ? `Bettors verified your proof. You won the bet: ${bet.title}!`
            : `Bettors rejected your proof. You need to complete the punishment for: ${bet.title}`,
          link: `/bets/${betId}`,
        },
      })

      // If rejected, notify creator to do punishment
      if (!proofAccepted) {
        await prisma.notification.create({
          data: {
            userId: bet.creatorId,
            type: 'PUNISHMENT_ASSIGNED',
            title: 'Complete Your Punishment',
            message: `Your proof was rejected. Please complete the punishment for failing: ${bet.title}`,
            link: `/bets/${betId}`,
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      vote: proofVote,
      voteCounts: {
        accept: acceptVotes,
        reject: rejectVotes,
        total: totalVotes,
        required: Math.ceil(totalBettors / 2),
      },
      resolved: majorityVoted,
    })
  } catch (error) {
    console.error('Error voting on proof:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/bets/[id]/verify - Get vote counts for a bet
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const betId = params.id

    const votes = await prisma.proofVote.findMany({
      where: { betId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    })

    const bet = await prisma.bet.findUnique({
      where: { id: betId },
      include: {
        predictions: true,
      },
    })

    if (!bet) {
      return NextResponse.json({ error: 'Bet not found' }, { status: 404 })
    }

    const acceptVotes = votes.filter(v => v.vote === 'ACCEPT').length
    const rejectVotes = votes.filter(v => v.vote === 'REJECT').length
    const userVote = votes.find(v => v.userId === user.userId)

    return NextResponse.json({
      votes: votes,
      counts: {
        accept: acceptVotes,
        reject: rejectVotes,
        total: votes.length,
        required: Math.ceil(bet.predictions.length / 2),
      },
      userVote: userVote?.vote || null,
    })
  } catch (error) {
    console.error('Error fetching votes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
