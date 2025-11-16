import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

/**
 * POST /api/friends/add
 * Add a new friend connection
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

    const { friendId } = await request.json()

    if (!friendId) {
      return NextResponse.json(
        { error: 'Friend ID is required' },
        { status: 400 }
      )
    }

    // Check if friendship already exists
    const existing = await prisma.friendConnection.findFirst({
      where: {
        OR: [
          { userId: currentUser.userId, friendId: friendId },
          { userId: friendId, friendId: currentUser.userId },
        ],
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Friend connection already exists' },
        { status: 400 }
      )
    }

    // Create friend connection (auto-accepted for simplicity)
    const friendship = await prisma.friendConnection.create({
      data: {
        userId: currentUser.userId,
        friendId: friendId,
        status: 'ACCEPTED',
      },
    })

    return NextResponse.json(
      { message: 'Friend added successfully', friendship },
      { status: 201 }
    )
  } catch (error) {
    console.error('Add friend error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
