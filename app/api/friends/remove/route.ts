import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

/**
 * DELETE /api/friends/remove
 * Remove a friend connection
 */
export async function DELETE(request: NextRequest) {
  try {
    const currentUser = getUserFromRequest(request)
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { friendId } = await request.json()

    if (!friendId) {
      return NextResponse.json(
        { error: 'Friend ID is required' },
        { status: 400 }
      )
    }

    // Delete the friendship
    await prisma.friendConnection.deleteMany({
      where: {
        OR: [
          { userId: currentUser.userId, friendId: friendId },
          { userId: friendId, friendId: currentUser.userId },
        ],
      },
    })

    return NextResponse.json(
      { message: 'Friend removed successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Remove friend error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
