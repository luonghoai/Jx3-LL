import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import MeetingRequest from '@/models/MeetingRequest'

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

    // Prepare update data
    const updateData = {
      title: body.title.trim(),
      description: body.description.trim(),
      date: body.date,
      time: body.time,
      status: body.status,
      participants: body.participants || [],
      temporaryGuests: body.temporaryGuests || []
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
    
    return NextResponse.json(meetingRequest)
  } catch (error) {
    console.error('Error updating meeting status:', error)
    return NextResponse.json(
      { error: 'Failed to update meeting status' },
      { status: 500 }
    )
  }
} 