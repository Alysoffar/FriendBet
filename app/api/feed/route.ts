import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getUserFromRequest } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's friends
    const friendConnections = await prisma.friendConnection.findMany({
      where: {
        OR: [
          { userId: user.userId },
          { friendId: user.userId },
        ],
        status: 'ACCEPTED',
      },
      select: {
        userId: true,
        friendId: true,
      },
    })

    const friendIds = friendConnections.map(fc => 
      fc.userId === user.userId ? fc.friendId : fc.userId
    )

    // Only show friends' activities, not the logged-in user's
    const relevantUserIds = friendIds

    // Fetch recent bets created
    const recentBets = await prisma.bet.findMany({
      where: {
        creatorId: { in: relevantUserIds },
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            predictions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    })

    // Fetch recent proofs submitted
    const recentProofs = await prisma.bet.findMany({
      where: {
        creatorId: { in: relevantUserIds },
        NOT: {
          proofUrl: null,
        },
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
      orderBy: {
        updatedAt: 'desc',
      },
      take: 20,
    })

    // Fetch recent completed bets
    const recentCompletions = await prisma.bet.findMany({
      where: {
        creatorId: { in: relevantUserIds },
        status: 'COMPLETED',
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
      orderBy: {
        updatedAt: 'desc',
      },
      take: 20,
    })

    // Combine and format feed items
    const feedItems: any[] = []

    // Add new bets
    recentBets.forEach(bet => {
      feedItems.push({
        id: `bet-${bet.id}`,
        type: 'BET_CREATED',
        betId: bet.id,
        title: bet.title,
        description: `${bet.creator.username} created a new challenge`,
        category: bet.category,
        creator: bet.creator,
        predictionsCount: bet._count.predictions,
        timestamp: bet.createdAt,
      })
    })

    // Add proofs submitted
    recentProofs.forEach(bet => {
      feedItems.push({
        id: `proof-${bet.id}`,
        type: 'PROOF_SUBMITTED',
        betId: bet.id,
        title: bet.title,
        description: `${bet.creator.username} ${bet.result === 'WON' ? 'completed' : bet.result === 'LOST' ? 'failed' : 'submitted proof for'} their challenge`,
        proofUrl: bet.proofUrl,
        proofRequired: bet.proofRequired,
        result: bet.result,
        creator: bet.creator,
        timestamp: bet.updatedAt,
      })
    })

    // Add completed bets
    recentCompletions.forEach(bet => {
      feedItems.push({
        id: `complete-${bet.id}`,
        type: 'BET_COMPLETED',
        betId: bet.id,
        title: bet.title,
        description: `${bet.creator.username} ${bet.result === 'WON' ? 'completed' : 'failed'} their challenge`,
        result: bet.result,
        creator: bet.creator,
        timestamp: bet.updatedAt,
      })
    })

    // Sort by timestamp descending
    feedItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Take top 30 items
    const feed = feedItems.slice(0, 30)

    return NextResponse.json(feed)
  } catch (error) {
    console.error('Error fetching feed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
