import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { resolveBetSchema } from '@/lib/validations'
import { calculatePayout } from '@/lib/utils'

/**
 * POST /api/bets/[id]/result
 * Resolve a bet (mark as won/lost and distribute payouts)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = getUserFromRequest(request)
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validation = resolveBetSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { result, proofUrl } = validation.data

    // Check if bet exists and user is the creator
    const bet = await prisma.bet.findUnique({
      where: { id: params.id },
      include: {
        predictions: true,
      },
    })

    if (!bet) {
      return NextResponse.json(
        { error: 'Bet not found' },
        { status: 404 }
      )
    }

    if (bet.creatorId !== currentUser.userId) {
      return NextResponse.json(
        { error: 'Only the bet creator can resolve this bet' },
        { status: 403 }
      )
    }

    if (bet.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'This bet has already been resolved' },
        { status: 400 }
      )
    }

    // Calculate pool statistics
    const totalPool = bet.predictions.reduce((sum, p) => sum + p.stake, 0)
    const forPool = bet.predictions
      .filter(p => p.choice === 'FOR')
      .reduce((sum, p) => sum + p.stake, 0)
    const againstPool = bet.predictions
      .filter(p => p.choice === 'AGAINST')
      .reduce((sum, p) => sum + p.stake, 0)
    
    const winningPool = result === 'WON' ? forPool : againstPool

    // Calculate payouts for each prediction
    const payoutUpdates = bet.predictions.map(prediction => {
      const payout = calculatePayout(
        prediction.stake,
        prediction.choice,
        result,
        totalPool,
        winningPool
      )

      return {
        predictionId: prediction.id,
        userId: prediction.userId,
        payout,
      }
    })

    // Update bet, predictions, and user points in transaction
    await prisma.$transaction([
      // Update bet status
      prisma.bet.update({
        where: { id: params.id },
        data: {
          status: 'COMPLETED',
          result,
          proofUrl,
        },
      }),
      // Update predictions with payouts
      ...payoutUpdates.map(({ predictionId, payout }) =>
        prisma.prediction.update({
          where: { id: predictionId },
          data: { payout },
        })
      ),
      // Update user points
      ...payoutUpdates.map(({ userId, payout }) =>
        prisma.user.update({
          where: { id: userId },
          data: {
            points: {
              increment: payout,
            },
          },
        })
      ),
    ])

    // If bet creator won, give bonus points and powerup (separate transaction)
    if (result === 'WON') {
      const bonusPoints = Math.floor(againstPool * 0.1) // 10% of losing pool
      await prisma.$transaction([
        prisma.user.update({
          where: { id: currentUser.userId },
          data: {
            points: {
              increment: bonusPoints,
            },
          },
        }),
        prisma.powerup.create({
          data: {
            userId: currentUser.userId,
            type: 'STAKE_BOOST',
            value: 10,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          },
        }),
      ])
    }

    return NextResponse.json({
      message: 'Bet resolved successfully',
      result,
      payouts: payoutUpdates,
    })
  } catch (error) {
    console.error('Resolve bet error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
