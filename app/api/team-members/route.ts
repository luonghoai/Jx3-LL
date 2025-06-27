import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import TeamMember from '@/models/TeamMember'

// GET - Fetch all team members
export async function GET() {
  try {
    await connectDB()
    const teamMembers = await TeamMember.find({ isActive: true }).sort({ name: 1 })
    return NextResponse.json(teamMembers)
  } catch (error) {
    console.error('Error fetching team members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    )
  }
}

// POST - Create a new team member
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.roles || !body.classes) {
      return NextResponse.json(
        { error: 'Name, roles, and classes are required' },
        { status: 400 }
      )
    }

    // Validate arrays
    if (!Array.isArray(body.roles) || body.roles.length === 0) {
      return NextResponse.json(
        { error: 'At least one role is required' },
        { status: 400 }
      )
    }

    if (!Array.isArray(body.classes) || body.classes.length === 0) {
      return NextResponse.json(
        { error: 'At least one class is required' },
        { status: 400 }
      )
    }

    // Create new team member
    const teamMember = new TeamMember({
      name: body.name.trim(),
      discordUid: body.discordUid?.trim() || undefined,
      roles: body.roles,
      classes: body.classes,
      avatar: body.avatar || undefined,
      isActive: true
    })
    
    await teamMember.save()
    
    return NextResponse.json(teamMember, { status: 201 })
  } catch (error) {
    console.error('Error creating team member:', error)
    return NextResponse.json(
      { error: 'Failed to create team member' },
      { status: 500 }
    )
  }
} 