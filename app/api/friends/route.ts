import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

/**
 * GET /api/friends
 * Get all friends of the current user
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

    // Get all accepted friend connections
    const friendConnections = await prisma.friendConnection.findMany({
      where: {
        OR: [
          { userId: currentUser.userId, status: 'ACCEPTED' },
          { friendId: currentUser.userId, status: 'ACCEPTED' },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            points: true,
            avatar: true,
          },
        },
        friend: {
          select: {
            id: true,
            username: true,
            points: true,
            avatar: true,
          },
        },
      },
    })

    // Extract the friend user objects
    const friends = friendConnections.map(conn => {
      if (conn.userId === currentUser.userId) {
        return conn.friend
      } else {
        return conn.user
      }
    })

    return NextResponse.json(friends)
  } catch (error) {
    console.error('Get friends error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
