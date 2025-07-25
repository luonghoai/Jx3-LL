import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import MeetingRequest from '@/models/MeetingRequest'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    // Find the latest meeting request that is not confirmed or cancelled
    const latestMeeting = await MeetingRequest.findOne({
      status: { $nin: ['confirmed', 'canceled'] },
      isActive: true
    }).sort({ createdAt: -1 })
    
    if (!latestMeeting) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No active meeting requests found' 
        },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: latestMeeting
    })
    
  } catch (error) {
    console.error('Error fetching latest active meeting:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch latest active meeting' 
      },
      { status: 500 }
    )
  }
} 