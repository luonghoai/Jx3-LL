import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import UserScore from '@/models/UserScore'

// GET - Fetch a specific user score
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const userScore = await UserScore.findOne({ memberId: params.id })
      .populate('memberId', 'name discordUid avatar')
    
    if (!userScore) {
      return NextResponse.json(
        { error: 'User score not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(userScore)
  } catch (error) {
    console.error('Error fetching user score:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user score' },
      { status: 500 }
    )
  }
}

// PUT - Update a specific user score
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const body = await request.json()
    
    const userScore = await UserScore.findOne({ memberId: params.id })
    
    if (!userScore) {
      return NextResponse.json(
        { error: 'User score not found' },
        { status: 404 }
      )
    }

    // Update fields if provided
    if (body.name !== undefined) userScore.name = body.name
    if (body.discordUid !== undefined) userScore.discordUid = body.discordUid
    if (body.score !== undefined) userScore.score = body.score
    if (body.totalMeetingsJoined !== undefined) userScore.totalMeetingsJoined = body.totalMeetingsJoined
    
    userScore.lastUpdated = new Date()
    await userScore.save()

    return NextResponse.json(userScore)
  } catch (error) {
    console.error('Error updating user score:', error)
    return NextResponse.json(
      { error: 'Failed to update user score' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a user score
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const userScore = await UserScore.findOneAndDelete({ memberId: params.id })
    
    if (!userScore) {
      return NextResponse.json(
        { error: 'User score not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: 'User score deleted successfully' })
  } catch (error) {
    console.error('Error deleting user score:', error)
    return NextResponse.json(
      { error: 'Failed to delete user score' },
      { status: 500 }
    )
  }
} 