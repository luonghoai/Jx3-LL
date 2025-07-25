import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import UserScore from '@/models/UserScore'

// GET - Fetch all user scores or leaderboard
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const leaderboard = searchParams.get('leaderboard')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    if (leaderboard === 'true') {
      // Return leaderboard
      const scores = await UserScore.getLeaderboard(limit)
      return NextResponse.json(scores)
    } else {
      // Return all user scores
      const scores = await UserScore.find()
        .sort({ score: -1, totalMeetingsJoined: -1 })
        .populate('memberId', 'name discordUid avatar')
      
      return NextResponse.json(scores)
    }
  } catch (error) {
    console.error('Error fetching user scores:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user scores' },
      { status: 500 }
    )
  }
}

// POST - Create or update a user score
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    
    // Validate required fields
    if (!body.memberId || !body.discordUid || !body.name) {
      return NextResponse.json(
        { error: 'Member ID, Discord UID, and name are required' },
        { status: 400 }
      )
    }

    // Check if user score already exists
    let userScore = await UserScore.findOne({ memberId: body.memberId })
    
    if (userScore) {
      // Update existing score
      userScore.name = body.name
      userScore.discordUid = body.discordUid
      if (body.score !== undefined) userScore.score = body.score
      if (body.totalMeetingsJoined !== undefined) userScore.totalMeetingsJoined = body.totalMeetingsJoined
      userScore.lastUpdated = new Date()
      await userScore.save()
    } else {
      // Create new user score
      userScore = new UserScore({
        memberId: body.memberId,
        discordUid: body.discordUid,
        name: body.name,
        score: body.score || 100,
        totalMeetingsJoined: body.totalMeetingsJoined || 0
      })
      await userScore.save()
    }

    return NextResponse.json(userScore, { status: 201 })
  } catch (error) {
    console.error('Error creating/updating user score:', error)
    return NextResponse.json(
      { error: 'Failed to create/update user score' },
      { status: 500 }
    )
  }
} 