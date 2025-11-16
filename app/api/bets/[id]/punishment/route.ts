import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { createPunishmentSchema } from '@/lib/validations'

/**
 * POST /api/bets/[id]/punishment
 * Suggest a punishment for a lost bet
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

    const body = await request.json()
    
    // Validate input
    const validation = createPunishmentSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { description, type } = validation.data

    // Check if bet exists and is completed with LOST result
    const bet = await prisma.bet.findUnique({
      where: { id: params.id },
    })

    if (!bet) {
      return NextResponse.json(
        { error: 'Bet not found' },
        { status: 404 }
      )
    }

    if (bet.status !== 'COMPLETED' || bet.result !== 'LOST') {
      return NextResponse.json(
        { error: 'Can only suggest punishments for lost bets' },
        { status: 400 }
      )
    }

    // Create punishment suggestion
    const punishment = await prisma.punishment.create({
      data: {
        betId: params.id,
        receiverId: bet.creatorId,
        assignedById: currentUser.userId,
        description,
        type,
        votes: 1, // Start with 1 vote from creator
      },
      include: {
        assignedBy: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    })

    return NextResponse.json(punishment, { status: 201 })
  } catch (error) {
    console.error('Create punishment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/bets/[id]/punishment?punishmentId=xxx
 * Vote for a punishment suggestion
 */
export async function PATCH(
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

    const searchParams = request.nextUrl.searchParams
    const punishmentId = searchParams.get('punishmentId')

    if (!punishmentId) {
      return NextResponse.json(
        { error: 'Punishment ID is required' },
        { status: 400 }
      )
    }

    // Increment vote count
    const punishment = await prisma.punishment.update({
      where: { id: punishmentId },
      data: {
        votes: {
          increment: 1,
        },
      },
    })

    return NextResponse.json(punishment)
  } catch (error) {
    console.error('Vote punishment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
