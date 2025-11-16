import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

/**
 * GET /api/bets/[id]
 * Get a specific bet with all details
 */
export async function GET(
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

    const bet = await prisma.bet.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        description: true,
        deadline: true,
        category: true,
        status: true,
        result: true,
        proofRequired: true,
        proofUrl: true,
        createdAt: true,
        creator: {
          select: {
            id: true,
            username: true,
            avatar: true,
            points: true,
          },
        },
        predictions: {
          select: {
            id: true,
            choice: true,
            stake: true,
            userId: true,
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
        chatMessages: {
          select: {
            id: true,
            message: true,
            type: true,
            createdAt: true,
            senderId: true,
            sender: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
          take: 100,
        },
        punishments: {
          select: {
            id: true,
            description: true,
            type: true,
            votes: true,
            assignedBy: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
          orderBy: { votes: 'desc' },
        },
      },
    })

    if (!bet) {
      return NextResponse.json(
        { error: 'Bet not found' },
        { status: 404 }
      )
    }

    // Calculate stats
    const totalPool = bet.predictions.reduce((sum, p) => sum + p.stake, 0)
    const forPool = bet.predictions
      .filter(p => p.choice === 'FOR')
      .reduce((sum, p) => sum + p.stake, 0)
    const againstPool = totalPool - forPool

    return NextResponse.json({
      ...bet,
      stats: {
        totalPool,
        forPool,
        againstPool,
        forCount: bet.predictions.filter(p => p.choice === 'FOR').length,
        againstCount: bet.predictions.filter(p => p.choice === 'AGAINST').length,
      },
    })
  } catch (error) {
    console.error('Get bet error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
