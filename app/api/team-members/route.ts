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
    
    const teamMember = new TeamMember(body)
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