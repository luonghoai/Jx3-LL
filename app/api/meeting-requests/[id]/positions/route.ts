import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import MeetingRequest from '@/models/MeetingRequest'

// PATCH - Update participant positions
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const body = await request.json()
    
    // Validate required fields
    if (!body.participants || !body.temporaryGuests) {
      return NextResponse.json(
        { error: 'Participants and temporaryGuests arrays are required' },
        { status: 400 }
      )
    }

    // Validate that participants have position field
    if (Array.isArray(body.participants)) {
      for (const participant of body.participants) {
        if (typeof participant.position !== 'number') {
          return NextResponse.json(
            { error: 'Each participant must have a position field' },
            { status: 400 }
          )
        }
      }
    }

    // Validate that temporaryGuests have position field
    if (Array.isArray(body.temporaryGuests)) {
      for (const guest of body.temporaryGuests) {
        if (typeof guest.position !== 'number') {
          return NextResponse.json(
            { error: 'Each guest must have a position field' },
            { status: 400 }
          )
        }
      }
    }

    // Update meeting request with new positions
    const meetingRequest = await MeetingRequest.findByIdAndUpdate(
      params.id,
      {
        participants: body.participants,
        temporaryGuests: body.temporaryGuests
      },
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
    console.error('Error updating participant positions:', error)
    return NextResponse.json(
      { error: 'Failed to update participant positions' },
      { status: 500 }
    )
  }
} 