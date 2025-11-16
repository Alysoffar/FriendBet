import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

/**
 * GET /api/users/search
 * Search for all registered users (excluding current user)
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

    // Get all users except current user
    const users = await prisma.user.findMany({
      where: {
        id: {
          not: currentUser.userId,
        },
      },
      select: {
        id: true,
        username: true,
        points: true,
        avatar: true,
      },
      orderBy: {
        points: 'desc',
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Search users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
