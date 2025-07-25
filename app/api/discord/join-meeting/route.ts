import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import MeetingRequest from '@/models/MeetingRequest'
import TeamMember from '@/models/TeamMember'
import { validateApiKey } from '@/lib/api-auth'

// POST - Discord bot endpoint to request joining a meeting
export async function POST(request: NextRequest) {
  try {
    // Validate API key
    const authValidation = validateApiKey(request)
    if (!authValidation.isValid) {
      return NextResponse.json(
        { 
          success: false,
          error: authValidation.error || 'Unauthorized' 
        },
        { status: 401 }
      )
    }

    await connectDB()
    const body = await request.json()
    
    // Validate required fields
    if (!body.discordUid || !body.requestedRole || !body.requestedClass || !body.meetingId) {
      return NextResponse.json(
        { error: 'Discord UID, requested role, requested class, and meetingId are required' },
        { status: 400 }
      )
    }

    // Additional fields required for creating new members
    if (!body.name) {
      return NextResponse.json(
        { error: 'Name is required for creating new team members' },
        { status: 400 }
      )
    }

    // Find the team member to get their name
    let teamMember = await TeamMember.findOne({ discordUid: body.discordUid })
    let newMemberCreated = false
    
    // If team member doesn't exist, create a new one
    if (!teamMember) {
      try {
        // Create new team member with Discord information
        const newTeamMember = new TeamMember({
          name: body.name,
          discordUid: body.discordUid,
          roles: [body.requestedRole], // Start with the requested role
          classes: [body.requestedClass], // Start with the requested class
          avatar: body.avatar || null, // Discord avatar URL if provided
          isActive: true
        })
        
        await newTeamMember.save()
        teamMember = newTeamMember
        newMemberCreated = true
        
        console.log(`Created new team member: ${body.name} (${body.discordUid})`)
      } catch (createError) {
        console.error('Error creating new team member:', createError)
        return NextResponse.json(
          { error: 'Failed to create new team member' },
          { status: 500 }
        )
      }
    }

    // Find the specific meeting by ID
    const meetingRequest = await MeetingRequest.findById(body.meetingId)
    
    if (!meetingRequest) {
      return NextResponse.json(
        { error: 'Meeting request not found' },
        { status: 404 }
      )
    }

    // Check if meeting is active and not confirmed/cancelled
    if (!meetingRequest.isActive || meetingRequest.status === 'confirmed' || meetingRequest.status === 'canceled') {
      return NextResponse.json(
        { error: 'Meeting is not available for join requests' },
        { status: 400 }
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
      name: teamMember.name,
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

    // Send Discord DM notification for join request submission
    try {
      const dmMessage = `🎮 **Yêu cầu tham gia đã được gửi**
      
**Bí cảnh:** ${meetingRequest.title}
**Ngày:** ${meetingRequest.date} lúc ${meetingRequest.time}
**Vai trò yêu cầu:** ${joinRequest.requestedRole} - ${joinRequest.requestedClass}

✅ Yêu cầu tham gia của bạn đã được gửi thành công!
⏳ Vui lòng chờ admin phê duyệt yêu cầu của bạn.

Bạn sẽ nhận được thông báo khi yêu cầu được xử lý.`

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
        console.error('Failed to send Discord DM notification for join request submission:', dmResponse.statusText)
        // Don't fail the request if DM fails, just log it
      } else {
        console.log('Discord DM notification for join request submission sent successfully')
      }
    } catch (dmError) {
      console.error('Error sending Discord DM notification for join request submission:', dmError)
      // Don't fail the request if DM fails, just log it
    }

    return NextResponse.json({
      message: 'Join request submitted successfully',
      joinRequest,
      meetingTitle: meetingRequest.title,
      newMemberCreated
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating join request from Discord:', error)
    return NextResponse.json(
      { error: 'Failed to create join request' },
      { status: 500 }
    )
  }
} 