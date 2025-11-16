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

    // Get all bets created by friends with predictions
    const friendsChallenges = await prisma.bet.findMany({
      where: {
        creatorId: {
          in: friendIds,
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
        predictions: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
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
      take: 50,
    })

    // Calculate for/against for each challenge
    const challengesWithStats = friendsChallenges.map(bet => {
      const forBets = bet.predictions.filter(p => p.choice === 'FOR').length
      const againstBets = bet.predictions.filter(p => p.choice === 'AGAINST').length
      
      return {
        id: bet.id,
        title: bet.title,
        description: bet.description,
        deadline: bet.deadline,
        status: bet.status,
        result: bet.result,
        category: bet.category,
        creator: bet.creator,
        forBets,
        againstBets,
        totalBets: bet._count.predictions,
        predictions: bet.predictions,
      }
    })

    return NextResponse.json(challengesWithStats)
  } catch (error) {
    console.error('Error fetching friends challenges:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
