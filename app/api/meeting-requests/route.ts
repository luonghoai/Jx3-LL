import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import MeetingRequest from '@/models/MeetingRequest'

// GET - Fetch all meeting requests
export async function GET() {
  try {
    await connectDB()
    const meetingRequests = await MeetingRequest.find({ isActive: true })
      .sort({ createdAt: -1 }) // Sort by creation date, newest first
    return NextResponse.json(meetingRequests)
  } catch (error) {
    console.error('Error fetching meeting requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch meeting requests' },
      { status: 500 }
    )
  }
}

// POST - Create a new meeting request
export async function POST(request: NextRequest) {
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

    // Validate participants structure
    if (body.participants && Array.isArray(body.participants)) {
      for (const participant of body.participants) {
        if (!participant.memberId || !participant.name || !participant.meetingRole || !participant.meetingClass) {
          return NextResponse.json(
            { error: 'Each participant must have memberId, name, meetingRole, and meetingClass' },
            { status: 400 }
          )
        }
      }
    }

    // Validate temporary guests structure
    if (body.temporaryGuests && Array.isArray(body.temporaryGuests)) {
      for (const guest of body.temporaryGuests) {
        if (!guest.id || !guest.name || !guest.meetingRole || !guest.meetingClass) {
          return NextResponse.json(
            { error: 'Each guest must have id, name, meetingRole, and meetingClass' },
            { status: 400 }
          )
        }
      }
    }

    // Create new meeting request
    const meetingRequest = new MeetingRequest({
      title: body.title.trim(),
      description: body.description.trim(),
      date: body.date,
      time: body.time,
      status: body.status || 'draft',
      participants: body.participants || [],
      temporaryGuests: body.temporaryGuests || [],
      isActive: true
    })
    
    await meetingRequest.save()
    
    return NextResponse.json(meetingRequest, { status: 201 })
  } catch (error) {
    console.error('Error creating meeting request:', error)
    return NextResponse.json(
      { error: 'Failed to create meeting request' },
      { status: 500 }
    )
  }
} 