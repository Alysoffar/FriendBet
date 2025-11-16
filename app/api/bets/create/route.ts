import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { createBetSchema } from '@/lib/validations'

/**
 * POST /api/bets/create
 * Create a new bet
 */
export async function POST(request: NextRequest) {
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
    const validation = createBetSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { title, description, deadline, category, proofRequired } = validation.data

    // Create the bet
    const bet = await prisma.bet.create({
      data: {
        title,
        description,
        deadline: new Date(deadline),
        category,
        proofRequired,
        creatorId: currentUser.userId,
        status: 'ACTIVE',
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    })

    // Get all friends of the creator to notify them
    const friends = await prisma.friendConnection.findMany({
      where: {
        OR: [
          { userId: currentUser.userId, status: 'ACCEPTED' },
          { friendId: currentUser.userId, status: 'ACCEPTED' },
        ],
      },
      select: {
        userId: true,
        friendId: true,
      },
    })

    // TODO: In a real app, you would send notifications here
    // For now, we just return the bet with friend count
    const friendCount = friends.length

    return NextResponse.json(
      { ...bet, notifiedFriends: friendCount },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create bet error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
