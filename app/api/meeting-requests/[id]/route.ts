import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import MeetingRequest from '@/models/MeetingRequest'
import UserScore from '@/models/UserScore'

// Disable Next.js caching for this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET - Fetch a specific meeting request
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const meetingRequest = await MeetingRequest.findById(params.id)
    
    if (!meetingRequest) {
      return NextResponse.json(
        { error: 'Meeting request not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(meetingRequest)
  } catch (error) {
    console.error('Error fetching meeting request:', error)
    return NextResponse.json(
      { error: 'Failed to fetch meeting request' },
      { status: 500 }
    )
  }
}

// PUT - Update a meeting request
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const body = await request.json()
    
    // Validate required fields
    if (!body.title || !body.description || !body.date || !body.time) {
      return NextResponse.json(
        { error: 'Title, description, date, and time are required' },
        { status: 400 }
      )
    }

    // Validate participants or guests are present
    if ((!body.participants || body.participants.length === 0) && 
        (!body.temporaryGuests || body.temporaryGuests.length === 0)) {
      return NextResponse.json(
        { error: 'At least one participant or guest is required' },
        { status: 400 }
      )
    }

    // Ensure positions are set for all participants and guests
    const participantsWithPositions = (body.participants || []).map((participant: any, index: number) => ({
      ...participant,
      position: participant.position ?? index
    }))

    const guestsWithPositions = (body.temporaryGuests || []).map((guest: any, index: number) => ({
      ...guest,
      position: guest.position ?? (participantsWithPositions.length + index)
    }))

    // Prepare update data
    const updateData = {
      title: body.title.trim(),
      description: body.description.trim(),
      date: body.date,
      time: body.time,
      status: body.status,
      participants: participantsWithPositions,
      temporaryGuests: guestsWithPositions
    }
    
    const meetingRequest = await MeetingRequest.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    )
    
    if (!meetingRequest) {
      return NextResponse.json(
        { error: 'Meeting request not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(meetingRequest)
  } catch (error) {
    console.error('Error updating meeting request:', error)
    return NextResponse.json(
      { error: 'Failed to update meeting request' },
      { status: 500 }
    )
  }
}

// DELETE - Soft delete a meeting request (set isActive to false)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const meetingRequest = await MeetingRequest.findByIdAndUpdate(
      params.id,
      { isActive: false },
      { new: true }
    )
    
    if (!meetingRequest) {
      return NextResponse.json(
        { error: 'Meeting request not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: 'Meeting request deleted successfully' })
  } catch (error) {
    console.error('Error deleting meeting request:', error)
    return NextResponse.json(
      { error: 'Failed to delete meeting request' },
      { status: 500 }
    )
  }
}

// PATCH - Update meeting status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const body = await request.json()
    
    if (!body.status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    const validStatuses = ['draft', 'confirmed', 'completed', 'canceled']
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }
    
    const meetingRequest = await MeetingRequest.findByIdAndUpdate(
      params.id,
      { status: body.status },
      { new: true }
    )
    
    if (!meetingRequest) {
      return NextResponse.json(
        { error: 'Meeting request not found' },
        { status: 404 }
      )
    }

    // Award points to team members when meeting is confirmed
    if (body.status === 'confirmed') {
      try {
        // Award points only to team members (participants), not guests
        const participants = meetingRequest.participants || []
        for (const participant of participants) {
          if (participant.discordUid && participant.memberId) {
            try {
              // Check if user score exists, create if not
              let userScore = await UserScore.findOne({ memberId: participant.memberId })
              
              if (!userScore) {
                // Create new user score with base score
                userScore = new UserScore({
                  memberId: participant.memberId,
                  discordUid: participant.discordUid,
                  name: participant.name,
                  score: 100, // Base score
                  totalMeetingsJoined: 0
                })
              }
              
              // Award 1 point for this meeting
              userScore.score += 1
              userScore.totalMeetingsJoined += 1
              userScore.lastUpdated = new Date()
              await userScore.save()
              
              console.log(`Awarded 1 point to ${participant.name} (${participant.discordUid}) - New score: ${userScore.score}`)
            } catch (scoreError) {
              console.error(`Failed to award points to ${participant.name}:`, scoreError)
              // Continue with other participants even if one fails
            }
          }
        }

        console.log(`Awarded points to ${participants.length} team members for confirmed meeting: ${meetingRequest.title}`)
      } catch (error) {
        console.error('Error awarding points for confirmed meeting:', error)
        // Don't fail the meeting confirmation if point awarding fails
      }
    }
    
    return NextResponse.json(meetingRequest)
  } catch (error) {
    console.error('Error updating meeting status:', error)
    return NextResponse.json(
      { error: 'Failed to update meeting status' },
      { status: 500 }
    )
  }
} 