import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import MeetingRequest from '@/models/MeetingRequest'

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

    // Simple random selection
    const selectedHoster = selectRandomHoster(participants)
    
    // Update meeting request with selected hoster
    meetingRequest.hoster = {
      memberId: selectedHoster.memberId,
      name: selectedHoster.name,
      discordUid: selectedHoster.discordUid,
      meetingRole: selectedHoster.meetingRole,
      meetingClass: selectedHoster.meetingClass,
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
 * Select a random hoster from participants
 */
function selectRandomHoster(participants: any[]): any {
  const randomIndex = Math.floor(Math.random() * participants.length)
  return participants[randomIndex]
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