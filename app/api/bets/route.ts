import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

/**
 * GET /api/bets
 * Get all bets visible to the current user (their bets + friends' bets)
 */
export async function GET(request: NextRequest) {
  try {
    const currentUser = getUserFromRequest(request)
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Single optimized query - get friends and bets together
    const friendConnections = await prisma.friendConnection.findMany({
      where: {
        OR: [
          { userId: currentUser.userId, status: 'ACCEPTED' },
          { friendId: currentUser.userId, status: 'ACCEPTED' },
        ],
      },
      select: { userId: true, friendId: true },
    })

    const friendIds = friendConnections.map(fc => 
      fc.userId === currentUser.userId ? fc.friendId : fc.userId
    )

    // Get only recent bets (limit 50) with minimal data
    const bets = await prisma.bet.findMany({
      where: {
        creatorId: {
          in: [currentUser.userId, ...friendIds],
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        deadline: true,
        category: true,
        status: true,
        result: true,
        createdAt: true,
        creator: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        punishments: {
          select: {
            id: true,
            description: true,
            type: true,
          },
          orderBy: { votes: 'desc' },
          take: 1,
        },
        _count: {
          select: { predictions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json(bets)
  } catch (error) {
    console.error('Get bets error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
