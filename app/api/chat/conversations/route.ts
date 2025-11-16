import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

/**
 * GET /api/chat/conversations
 * Get all conversations for the current user
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

    // Get all conversations where user is a member
    const conversationMembers = await prisma.conversationMember.findMany({
      where: {
        userId: currentUser.userId,
      },
      include: {
        conversation: {
          include: {
            members: {
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
            messages: {
              orderBy: {
                createdAt: 'desc',
              },
              take: 1,
              include: {
                sender: {
                  select: {
                    id: true,
                    username: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        conversation: {
          updatedAt: 'desc',
        },
      },
    })

    // Transform to conversation format with unread count
    const conversations = conversationMembers.map(cm => {
      const conv = cm.conversation
      const lastMessage = conv.messages[0] || null
      
      // Count unread messages (messages after lastReadAt)
      const unreadCount = 0 // TODO: Implement proper unread counting

      // Filter out duplicates and keep only other participants for display
      const allParticipants = conv.members.map(m => m.user)
      const uniqueParticipants = allParticipants.filter((p, index, self) => 
        index === self.findIndex(t => t.id === p.id)
      )

      return {
        id: conv.id,
        type: conv.type.toLowerCase(),
        name: conv.name,
        participants: uniqueParticipants,
        lastMessage,
        unreadCount,
      }
    })

    return NextResponse.json(conversations)
  } catch (error) {
    console.error('Get conversations error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/chat/conversations
 * Create a new conversation (DM or group)
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

    const { participantIds, type, name } = await request.json()

    if (!participantIds || participantIds.length === 0) {
      return NextResponse.json(
        { error: 'Participant IDs required' },
        { status: 400 }
      )
    }

    // For direct messages, check if conversation already exists
    if (type === 'DIRECT' && participantIds.length === 1) {
      const existingConversations = await prisma.conversation.findMany({
        where: {
          type: 'DIRECT',
        },
        include: {
          members: {
            select: {
              userId: true,
            },
          },
        },
      })

      // Find conversation with exactly these two users
      const existingConv = existingConversations.find(conv => {
        const memberIds = conv.members.map(m => m.userId).sort()
        const targetIds = [currentUser.userId, participantIds[0]].sort()
        return memberIds.length === 2 && 
               memberIds[0] === targetIds[0] && 
               memberIds[1] === targetIds[1]
      })

      if (existingConv) {
        // Return existing conversation with full details
        const fullConversation = await prisma.conversation.findUnique({
          where: { id: existingConv.id },
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    avatar: true,
                    isOnline: true,
                  },
                },
              },
            },
          },
        })
        return NextResponse.json(fullConversation)
      }
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        type: type || 'DIRECT',
        name: type === 'GROUP' ? name : null,
        creatorId: currentUser.userId,
        members: {
          create: [
            { userId: currentUser.userId },
            ...participantIds.map((id: string) => ({ userId: id })),
          ],
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                isOnline: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(conversation, { status: 201 })
  } catch (error) {
    console.error('Create conversation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
