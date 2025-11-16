import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

/**
 * GET /api/activities
 * Get activity feed (bets created, votes placed, posts, punishments suggested, etc.)
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

    // Get friends list
    const friendConnections = await prisma.friendConnection.findMany({
      where: {
        OR: [
          { userId: currentUser.userId, status: 'ACCEPTED' },
          { friendId: currentUser.userId, status: 'ACCEPTED' },
        ],
      },
      select: { userId: true, friendId: true },
    })

    const friendIds = friendConnections.map(conn => 
      conn.userId === currentUser.userId ? conn.friendId : conn.userId
    )
    const userIds = [currentUser.userId, ...friendIds]

    // Parallel queries with limits
    const [recentBets, recentVotes, recentPosts] = await Promise.all([
      // Bets (limited to 5)
      prisma.bet.findMany({
        where: { creatorId: { in: userIds } },
        select: {
          id: true,
          title: true,
          createdAt: true,
          creator: { select: { id: true, username: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      // Votes (limited to 8)
      prisma.prediction.findMany({
        where: { userId: { in: userIds } },
        select: {
          id: true,
          choice: true,
          stake: true,
          createdAt: true,
          betId: true,
          user: { select: { id: true, username: true, avatar: true } },
          bet: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      // Posts (limited to 15)
      prisma.chatMessage.findMany({
        where: {
          betId: null,
          conversationId: null,
          senderId: { in: userIds },
        },
        select: {
          id: true,
          message: true,
          createdAt: true,
          sender: { select: { id: true, username: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 15,
      }),
    ])

    // Build activities array
    const activities: any[] = [
      ...recentBets.map(bet => ({
        id: `bet-${bet.id}`,
        type: 'bet_created',
        user: bet.creator,
        content: `created a new bet`,
        metadata: { betId: bet.id, betTitle: bet.title },
        createdAt: bet.createdAt,
      })),
      ...recentVotes.map(vote => ({
        id: `vote-${vote.id}`,
        type: 'vote_placed',
        user: vote.user,
        content: `placed a prediction`,
        metadata: {
          betId: vote.betId,
          betTitle: vote.bet.title,
          choice: vote.choice,
          stake: vote.stake,
        },
        createdAt: vote.createdAt,
      })),
      ...recentPosts.map(post => ({
        id: `post-${post.id}`,
        type: 'user_post',
        user: post.sender,
        content: post.message,
        metadata: {},
        createdAt: post.createdAt,
      })),
    ]

    // Sort and return top 20
    activities.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return NextResponse.json(activities.slice(0, 20))
  } catch (error) {
    console.error('Get activities error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
