import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import MeetingRequest from '@/models/MeetingRequest'
import TeamMember from '@/models/TeamMember'

// GET - Fetch join requests for a meeting
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

    return NextResponse.json(meetingRequest.joinRequests || [])
  } catch (error) {
    console.error('Error fetching join requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch join requests' },
      { status: 500 }
    )
  }
}

// POST - Request to join a meeting
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const body = await request.json()
    
    // Validate required fields
    if (!body.discordUid || !body.name || !body.requestedRole || !body.requestedClass) {
      return NextResponse.json(
        { error: 'Discord UID, name, requested role, and requested class are required' },
        { status: 400 }
      )
    }

    const meetingRequest = await MeetingRequest.findById(params.id)
    
    if (!meetingRequest) {
      return NextResponse.json(
        { error: 'Meeting request not found' },
        { status: 404 }
      )
    }

    // Check if user already has a pending request
    const existingRequest = meetingRequest.joinRequests?.find(
      (req: any) => req.discordUid === body.discordUid && req.status === 'pending'
    )

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You already have a pending request for this meeting' },
        { status: 400 }
      )
    }

    // Check if user is already a participant
    const isAlreadyParticipant = meetingRequest.participants?.some(
      (participant: any) => participant.discordUid === body.discordUid
    )

    if (isAlreadyParticipant) {
      return NextResponse.json(
        { error: 'You are already a participant in this meeting' },
        { status: 400 }
      )
    }

    // Check if user is already a temporary guest
    const isAlreadyGuest = meetingRequest.temporaryGuests?.some(
      (guest: any) => guest.discordUid === body.discordUid
    )

    if (isAlreadyGuest) {
      return NextResponse.json(
        { error: 'You are already a guest in this meeting' },
        { status: 400 }
      )
    }

    // Add the join request
    const joinRequest = {
      discordUid: body.discordUid,
      name: body.name,
      requestedRole: body.requestedRole,
      requestedClass: body.requestedClass,
      status: 'pending',
      requestedAt: new Date()
    }

    if (!meetingRequest.joinRequests) {
      meetingRequest.joinRequests = []
    }

    meetingRequest.joinRequests.push(joinRequest)
    await meetingRequest.save()

    return NextResponse.json(joinRequest, { status: 201 })
  } catch (error) {
    console.error('Error creating join request:', error)
    return NextResponse.json(
      { error: 'Failed to create join request' },
      { status: 500 }
    )
  }
}

// PATCH - Approve or reject a join request
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const body = await request.json()
    
    // Validate required fields
    if (!body.discordUid || !body.action || !body.processedBy) {
      return NextResponse.json(
        { error: 'Discord UID, action (approve/reject), and processedBy are required' },
        { status: 400 }
      )
    }

    if (!['approve', 'reject'].includes(body.action)) {
      return NextResponse.json(
        { error: 'Action must be either "approve" or "reject"' },
        { status: 400 }
      )
    }

    const meetingRequest = await MeetingRequest.findById(params.id)
    
    if (!meetingRequest) {
      return NextResponse.json(
        { error: 'Meeting request not found' },
        { status: 404 }
      )
    }

    // Find the join request
    const joinRequest = meetingRequest.joinRequests?.find(
      (req: any) => req.discordUid === body.discordUid && req.status === 'pending'
    )

    if (!joinRequest) {
      return NextResponse.json(
        { error: 'Join request not found or already processed' },
        { status: 404 }
      )
    }

    // Update the join request status
    joinRequest.status = body.action === 'approve' ? 'approved' : 'rejected'
    joinRequest.processedAt = new Date()
    joinRequest.processedBy = body.processedBy
    joinRequest.reason = body.reason || null

    // If approved, add as participant (since we create team members if they don't exist)
    if (body.action === 'approve') {
      // Find the team member to get their full information
      const teamMember = await TeamMember.findOne({ discordUid: body.discordUid })
      
      if (teamMember) {
        // Add as regular participant
        const newParticipant = {
          memberId: teamMember._id,
          name: teamMember.name,
          discordUid: teamMember.discordUid,
          meetingRole: joinRequest.requestedRole,
          meetingClass: joinRequest.requestedClass,
          position: (meetingRequest.participants?.length || 0) + (meetingRequest.temporaryGuests?.length || 0)
        }

        if (!meetingRequest.participants) {
          meetingRequest.participants = []
        }

        meetingRequest.participants.push(newParticipant)
      } else {
        // Fallback: add as temporary guest if team member not found
        const newGuest = {
          id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: joinRequest.name,
          discordUid: joinRequest.discordUid,
          roles: [joinRequest.requestedRole],
          classes: [joinRequest.requestedClass],
          meetingRole: joinRequest.requestedRole,
          meetingClass: joinRequest.requestedClass,
          position: (meetingRequest.participants?.length || 0) + (meetingRequest.temporaryGuests?.length || 0)
        }

        if (!meetingRequest.temporaryGuests) {
          meetingRequest.temporaryGuests = []
        }

        meetingRequest.temporaryGuests.push(newGuest)
      }
    }

    await meetingRequest.save()

    // Send Discord DM notification
    try {
      const actionText = body.action === 'approve' ? 'chấp nhận' : 'từ chối'
      const reasonText = body.reason ? `\nLý do: ${body.reason}` : ''
      
      const dmMessage = `🎮 **Thông báo yêu cầu tham gia bí cảnh**
      
**Bí cảnh:** ${meetingRequest.title}
**Ngày:** ${meetingRequest.date} lúc ${meetingRequest.time}
**Trạng thái:** ${actionText}
**Vai trò yêu cầu:** ${joinRequest.requestedRole} - ${joinRequest.requestedClass}${reasonText}

${body.action === 'approve' 
  ? '✅ Bạn đã được chấp nhận tham gia bí cảnh này!' 
  : '❌ Yêu cầu tham gia của bạn đã bị từ chối.'
}
`

      // Send DM to the user
      const dmResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/discord/dm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          discordUid: body.discordUid,
          message: dmMessage
        }),
      })

      if (!dmResponse.ok) {
        console.error('Failed to send Discord DM notification:', dmResponse.statusText)
        // Don't fail the request if DM fails, just log it
      } else {
        console.log('Discord DM notification sent successfully')
      }
    } catch (dmError) {
      console.error('Error sending Discord DM notification:', dmError)
      // Don't fail the request if DM fails, just log it
    }

    return NextResponse.json({
      message: `Join request ${body.action}d successfully`,
      joinRequest
    })
  } catch (error) {
    console.error('Error processing join request:', error)
    return NextResponse.json(
      { error: 'Failed to process join request' },
      { status: 500 }
    )
  }
} 