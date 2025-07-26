import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import UserScore from '@/models/UserScore'
import TeamMember from '@/models/TeamMember'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()

    // Validate required fields
    if (!body.discordUid || body.scoreChange === undefined || body.reason === undefined) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields: discordUid, scoreChange, reason' 
        },
        { status: 400 }
      )
    }

    const { discordUid, scoreChange, reason, processedBy } = body

    // Validate scoreChange is a number
    if (typeof scoreChange !== 'number') {
      return NextResponse.json(
        { 
          success: false,
          error: 'scoreChange must be a number' 
        },
        { status: 400 }
      )
    }

    // Find user score by discordUid
    let userScore = await UserScore.findOne({ discordUid })

    // If not found, try to create a new one from TeamMember
    if (!userScore) {
      const teamMember = await TeamMember.findOne({ discordUid })
      if (!teamMember) {
        return NextResponse.json(
          { 
            success: false,
            error: 'No TeamMember found for this Discord UID, cannot create user score.' 
          },
          { status: 404 }
        )
      }
      userScore = new UserScore({
        memberId: teamMember._id,
        discordUid: teamMember.discordUid || '',
        name: teamMember.name,
        score: 100, // Default score
        totalMeetingsJoined: 0,
        lastUpdated: new Date(),
        modifications: []
      })
      await userScore.save()
    }

    // Calculate new score
    const oldScore = userScore.score
    const newScore = Math.max(0, oldScore + scoreChange) // Prevent negative scores

    // Update the score
    userScore.score = newScore
    userScore.lastUpdated = new Date()
    
    // Add modification history
    if (!userScore.modifications) {
      userScore.modifications = []
    }
    
    userScore.modifications.push({
      scoreChange: scoreChange,
      oldScore: oldScore,
      newScore: newScore,
      reason: reason,
      processedBy: processedBy || 'system',
      processedAt: new Date()
    })

    await userScore.save()

    // Get team member info for response
    const teamMember = await TeamMember.findOne({ discordUid })

    return NextResponse.json({
      success: true,
      message: 'Score modified successfully',
      data: {
        discordUid: userScore.discordUid,
        name: userScore.name,
        oldScore: oldScore,
        newScore: newScore,
        scoreChange: scoreChange,
        reason: reason,
        processedBy: processedBy || 'system',
        processedAt: new Date(),
        teamMember: teamMember ? {
          name: teamMember.name,
          roles: teamMember.roles,
          classes: teamMember.classes,
          isActive: teamMember.isActive
        } : null
      }
    })

  } catch (error) {
    console.error('Error modifying user score:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to modify user score' 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const discordUid = searchParams.get('discordUid')

    if (!discordUid) {
      return NextResponse.json(
        { 
          success: false,
          error: 'discordUid parameter is required' 
        },
        { status: 400 }
      )
    }

    // Find user score by discordUid
    const userScore = await UserScore.findOne({ discordUid })

    if (!userScore) {
      return NextResponse.json(
        { 
          success: false,
          error: 'User score not found for this Discord UID' 
        },
        { status: 404 }
      )
    }

    // Get team member info
    const teamMember = await TeamMember.findOne({ discordUid })

    return NextResponse.json({
      success: true,
      data: {
        discordUid: userScore.discordUid,
        name: userScore.name,
        score: userScore.score,
        totalMeetingsJoined: userScore.totalMeetingsJoined,
        lastUpdated: userScore.lastUpdated,
        modifications: userScore.modifications || [],
        teamMember: teamMember ? {
          name: teamMember.name,
          roles: teamMember.roles,
          classes: teamMember.classes,
          isActive: teamMember.isActive
        } : null
      }
    })

  } catch (error) {
    console.error('Error getting user score:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get user score' 
      },
      { status: 500 }
    )
  }
} 