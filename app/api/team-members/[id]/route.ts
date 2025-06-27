import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import TeamMember from '@/models/TeamMember'

// GET - Fetch a specific team member
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const teamMember = await TeamMember.findById(params.id)
    
    if (!teamMember) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(teamMember)
  } catch (error) {
    console.error('Error fetching team member:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team member' },
      { status: 500 }
    )
  }
}

// POST - Create a new team member
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const body = await request.json()
    
    // Create new team member with default values
    const newTeamMember = new TeamMember({
      ...body,
      isActive: true,
      joinDate: new Date(),
      lastUpdated: new Date()
    })
    
    const savedTeamMember = await newTeamMember.save()
    
    return NextResponse.json(savedTeamMember, { status: 201 })
  } catch (error) {
    console.error('Error creating team member:', error)
    return NextResponse.json(
      { error: 'Failed to create team member' },
      { status: 500 }
    )
  }
}


// PUT - Update a team member
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Prepare update data
    const updateData = {
      name: body.name.trim(),
      discordUid: body.discordUid?.trim() || undefined,
      roles: body.roles,
      classes: body.classes,
      avatar: body.avatar || undefined,
      lastUpdated: new Date()
    }
    
    const teamMember = await TeamMember.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    )
    
    if (!teamMember) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(teamMember)
  } catch (error) {
    console.error('Error updating team member:', error)
    return NextResponse.json(
      { error: 'Failed to update team member' },
      { status: 500 }
    )
  }
}

// DELETE - Soft delete a team member (set isActive to false)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const teamMember = await TeamMember.findByIdAndUpdate(
      params.id,
      { isActive: false, lastUpdated: new Date() },
      { new: true }
    )
    
    if (!teamMember) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: 'Team member deleted successfully' })
  } catch (error) {
    console.error('Error deleting team member:', error)
    return NextResponse.json(
      { error: 'Failed to delete team member' },
      { status: 500 }
    )
  }
} 