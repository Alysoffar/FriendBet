import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

/**
 * DELETE /api/chat/conversations/cleanup
 * Remove duplicate conversations and keep only one per unique pair
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

    // Get all DIRECT conversations
    const allConversations = await prisma.conversation.findMany({
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

    // Group by member pair
    const conversationGroups = new Map<string, string[]>()
    
    for (const conv of allConversations) {
      const memberIds = conv.members.map(m => m.userId).sort().join('-')
      if (!conversationGroups.has(memberIds)) {
        conversationGroups.set(memberIds, [])
      }
      conversationGroups.get(memberIds)!.push(conv.id)
    }

    // Find duplicates and delete extras
    let deletedCount = 0
    for (const [memberPair, convIds] of conversationGroups) {
      if (convIds.length > 1) {
        // Keep the first one, delete the rest
        const toDelete = convIds.slice(1)
        await prisma.conversation.deleteMany({
          where: {
            id: {
              in: toDelete,
            },
          },
        })
        deletedCount += toDelete.length
      }
    }

    return NextResponse.json({
      message: 'Cleanup completed',
      deletedCount,
    })
  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
