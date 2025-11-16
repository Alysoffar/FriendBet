import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { voteBetSchema } from '@/lib/validations'

/**
 * POST /api/bets/[id]/vote
 * Place a prediction on a bet
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
    const validation = voteBetSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { choice, stake, punishment } = validation.data

    // Check if bet exists and is active
    const bet = await prisma.bet.findUnique({
      where: { id: params.id },
    })

    if (!bet) {
      return NextResponse.json(
        { error: 'Bet not found' },
        { status: 404 }
      )
    }

    if (bet.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'This bet is no longer active' },
        { status: 400 }
      )
    }

    if (new Date(bet.deadline) < new Date()) {
      return NextResponse.json(
        { error: 'Betting deadline has passed' },
        { status: 400 }
      )
    }

    if (bet.creatorId === currentUser.userId) {
      return NextResponse.json(
        { error: 'You cannot bet on your own challenge' },
        { status: 400 }
      )
    }

    // Check if user has enough points
    const user = await prisma.user.findUnique({
      where: { id: currentUser.userId },
      select: {
        id: true,
        points: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('User points:', user.points, 'Stake:', stake)

    if (user.points < stake) {
      return NextResponse.json(
        { error: `Insufficient points. You have ${user.points} points but trying to stake ${stake}` },
        { status: 400 }
      )
    }

    // Check if user has already voted
    const existingPrediction = await prisma.prediction.findUnique({
      where: {
        betId_userId: {
          betId: params.id,
          userId: currentUser.userId,
        },
      },
    })

    if (existingPrediction) {
      return NextResponse.json(
        { error: 'You have already placed a prediction on this bet' },
        { status: 400 }
      )
    }

    // Create prediction and deduct points in a transaction
    const transaction = [
      prisma.prediction.create({
        data: {
          betId: params.id,
          userId: currentUser.userId,
          choice,
          stake,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.user.update({
        where: { id: currentUser.userId },
        data: {
          points: {
            decrement: stake,
          },
        },
      }),
    ]

    // If punishment is suggested and user voted AGAINST, create punishment
    if (punishment && punishment.trim() && choice === 'AGAINST') {
      transaction.push(
        prisma.punishment.create({
          data: {
            betId: params.id,
            receiverId: bet.creatorId,
            description: punishment,
            type: 'CHALLENGE',
            assignedById: currentUser.userId,
          },
        }) as any
      )
    }

    const [prediction] = await prisma.$transaction(transaction)

    return NextResponse.json(prediction, { status: 201 })
  } catch (error) {
    console.error('Vote bet error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
