import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

/**
 * GET /api/bets/user/[id]
 * Get all bets for a specific user (created or participated in)
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

    // Get bets created by the user
    const createdBets = await prisma.bet.findMany({
      where: { creatorId: params.id },
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
    })

    // Get bets the user has predicted on
    const participatedBets = await prisma.bet.findMany({
      where: {
        predictions: {
          some: {
            userId: params.id,
          },
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
          where: {
            userId: params.id,
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
    })

    return NextResponse.json({
      created: createdBets,
      participated: participatedBets,
    })
  } catch (error) {
    console.error('Get user bets error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
