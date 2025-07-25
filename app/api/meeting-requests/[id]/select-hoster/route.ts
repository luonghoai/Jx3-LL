import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import MeetingRequest from '@/models/MeetingRequest'
import UserScore from '@/models/UserScore'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const meetingId = params.id

    // Find the meeting request
    const meetingRequest = await MeetingRequest.findById(meetingId)
    
    if (!meetingRequest) {
      return NextResponse.json(
        { success: false, error: 'Meeting request not found' },
        { status: 404 }
      )
    }

    // Check if meeting is confirmed
    if (meetingRequest.status !== 'confirmed') {
      return NextResponse.json(
        { success: false, error: 'Hoster can only be selected for confirmed meetings' },
        { status: 400 }
      )
    }

    // Check if hoster already exists
    if (meetingRequest.hoster && meetingRequest.hoster.memberId) {
      return NextResponse.json({
        success: true,
        message: 'Hoster already selected',
        hoster: meetingRequest.hoster,
        alreadySelected: true
      })
    }

    // Get all participants (team members only, not guests)
    const participants = meetingRequest.participants || []
    
    if (participants.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No participants available to select hoster from' },
        { status: 400 }
      )
    }

    // Get scores for all participants
    const participantsWithScores = []
    
    for (const participant of participants) {
      if (participant.memberId && participant.discordUid) {
        try {
          // Find user score
          const userScore = await UserScore.findOne({ memberId: participant.memberId })
          const score = userScore ? userScore.score : 100 // Default score if not found
          
          participantsWithScores.push({
            ...participant.toObject(),
            score: score
          })
        } catch (error) {
          console.error(`Error getting score for ${participant.name}:`, error)
          // Use default score if error
          participantsWithScores.push({
            ...participant.toObject(),
            score: 100
          })
        }
      }
    }

    if (participantsWithScores.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid participants with scores found' },
        { status: 400 }
      )
    }

    // Score-weighted random selection
    const selectedHoster = selectWeightedRandomHoster(participantsWithScores)
    
    // Update meeting request with selected hoster
    meetingRequest.hoster = {
      memberId: selectedHoster.memberId,
      name: selectedHoster.name,
      discordUid: selectedHoster.discordUid,
      meetingRole: selectedHoster.meetingRole,
      meetingClass: selectedHoster.meetingClass,
      score: selectedHoster.score,
      selectedAt: new Date()
    }

    await meetingRequest.save()

    return NextResponse.json({
      success: true,
      message: 'Hoster selected successfully',
      hoster: meetingRequest.hoster,
      alreadySelected: false
    })

  } catch (error) {
    console.error('Error selecting hoster:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to select hoster' },
      { status: 500 }
    )
  }
}

/**
 * Select a random hoster with score-weighted probability
 * Higher scores have higher chances of being selected
 */
function selectWeightedRandomHoster(participants: any[]): any {
  // Calculate total weight (sum of all scores)
  const totalWeight = participants.reduce((sum, participant) => sum + participant.score, 0)
  
  // Generate random number between 0 and total weight
  const random = Math.random() * totalWeight
  
  // Find the participant based on weighted random selection
  let currentWeight = 0
  
  for (const participant of participants) {
    currentWeight += participant.score
    
    if (random <= currentWeight) {
      return participant
    }
  }
  
  // Fallback to last participant (shouldn't reach here)
  return participants[participants.length - 1]
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const meetingId = params.id

    // Find the meeting request
    const meetingRequest = await MeetingRequest.findById(meetingId)
    
    if (!meetingRequest) {
      return NextResponse.json(
        { success: false, error: 'Meeting request not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      hoster: meetingRequest.hoster || null
    })

  } catch (error) {
    console.error('Error getting hoster:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get hoster' },
      { status: 500 }
    )
  }
} 