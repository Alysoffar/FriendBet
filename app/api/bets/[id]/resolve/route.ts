import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

/**
 * POST /api/bets/[id]/resolve
 * Resolve a bet and award points (40 points for winning)
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
    const { result, proofUrl } = body

    // Validate result
    if (!result || !['WON', 'LOST'].includes(result)) {
      return NextResponse.json(
        { error: 'Invalid result. Must be WON or LOST' },
        { status: 400 }
      )
    }

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

    // Calculate points for predictions
    const operations = []
    const notificationOps = []

    // Award 40 points to users who predicted correctly
    for (const prediction of bet.predictions) {
      const predictedCorrectly = 
        (prediction.choice === 'FOR' && result === 'WON') ||
        (prediction.choice === 'AGAINST' && result === 'LOST')

      if (predictedCorrectly) {
        operations.push(
          prisma.user.update({
            where: { id: prediction.userId },
            data: {
              points: { increment: 40 },
            },
          })
        )
        operations.push(
          prisma.prediction.update({
            where: { id: prediction.id },
            data: { payout: 40 },
          })
        )
        // Create win notification
        notificationOps.push(
          prisma.notification.create({
            data: {
              userId: prediction.userId,
              type: 'PREDICTION_WON',
              title: 'You won!',
              message: `You earned 40 points for correctly predicting "${bet.title}"!`,
              link: `/bets/${bet.id}`,
            },
          })
        )
      } else {
        operations.push(
          prisma.prediction.update({
            where: { id: prediction.id },
            data: { payout: 0 },
          })
        )
        // Create loss notification
        notificationOps.push(
          prisma.notification.create({
            data: {
              userId: prediction.userId,
              type: 'PREDICTION_LOST',
              title: '😔 Prediction lost',
              message: `Your prediction for "${bet.title}" was incorrect.`,
              link: `/bets/${bet.id}`,
            },
          })
        )
      }
    }

    // Update bet status
    operations.push(
      prisma.bet.update({
        where: { id: params.id },
        data: {
          status: 'COMPLETED',
          result,
          proofUrl: proofUrl || null,
        },
      })
    )

    // Execute all updates in a transaction
    await prisma.$transaction([...operations, ...notificationOps])

    return NextResponse.json({
      message: 'Bet resolved successfully',
      result,
    })
  } catch (error) {
    console.error('Resolve bet error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
