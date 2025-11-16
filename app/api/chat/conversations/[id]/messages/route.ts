import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

/**
 * GET /api/chat/conversations/[id]/messages
 * Get all messages in a conversation
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

    // Verify user is a member of this conversation
    const member = await prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId: params.id,
          userId: currentUser.userId,
        },
      },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Not a member of this conversation' },
        { status: 403 }
      )
    }

    // Get all messages
    const messages = await prisma.chatMessage.findMany({
      where: {
        conversationId: params.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    // Update lastReadAt
    await prisma.conversationMember.update({
      where: {
        conversationId_userId: {
          conversationId: params.id,
          userId: currentUser.userId,
        },
      },
      data: {
        lastReadAt: new Date(),
      },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/chat/conversations/[id]/messages
 * Send a message in a conversation
 */
export async function POST(
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

    const { message } = await request.json()

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Verify user is a member
    const member = await prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId: params.id,
          userId: currentUser.userId,
        },
      },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Not a member of this conversation' },
        { status: 403 }
      )
    }

    // Create message and update conversation
    const [chatMessage] = await prisma.$transaction([
      prisma.chatMessage.create({
        data: {
          conversationId: params.id,
          senderId: currentUser.userId,
          message,
          type: 'TEXT',
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.conversation.update({
        where: {
          id: params.id,
        },
        data: {
          updatedAt: new Date(),
        },
      }),
    ])

    return NextResponse.json(chatMessage, { status: 201 })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
