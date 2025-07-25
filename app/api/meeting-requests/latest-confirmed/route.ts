import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import MeetingRequest from '@/models/MeetingRequest'

// Disable Next.js caching for this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    // Find the latest meeting request with confirmed status
    const latestConfirmedMeeting = await MeetingRequest.findOne({
      status: 'confirmed',
      isActive: true
    }).sort({ createdAt: -1 })
    
    if (!latestConfirmedMeeting) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No confirmed meeting requests found' 
        },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: latestConfirmedMeeting
    })
    
  } catch (error) {
    console.error('Error fetching latest confirmed meeting:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch latest confirmed meeting' 
      },
      { status: 500 }
    )
  }
} 