import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getUserFromRequest } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const betId = params.id
    const { proofUrl } = await request.json()

    // Get the bet
    const bet = await prisma.bet.findUnique({
      where: { id: betId },
      include: {
        creator: true,
        predictions: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!bet) {
      return NextResponse.json({ error: 'Bet not found' }, { status: 404 })
    }

    // Check if user is the bet creator
    if (bet.creatorId !== user.userId) {
      return NextResponse.json({ error: 'Only the bet creator can upload proof' }, { status: 403 })
    }

    // Update bet with proof URL and set verification required
    const updatedBet = await prisma.bet.update({
      where: { id: betId },
      data: {
        proofUrl: proofUrl || null,
        proofSubmittedAt: new Date(),
        verificationRequired: true,
      },
    })

    // Send notifications to all bettors to verify proof
    for (const prediction of bet.predictions) {
      await prisma.notification.create({
        data: {
          userId: prediction.userId,
          type: 'BET_RESOLVED',
          title: 'Verify Proof Submitted',
          message: `${bet.creator.username} submitted proof for "${bet.title}". Vote if they completed it!`,
          link: `/bets/${betId}`,
        },
      })
    }

    return NextResponse.json({ 
      message: 'Proof uploaded successfully. Bettors have been notified to verify.',
      bet: updatedBet 
    })
  } catch (error) {
    console.error('Error uploading proof:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
