import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params

    // Validate user ID format
    if (!/^\d+$/.test(userId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid Discord user ID format. Please enter a numeric user ID.' 
        },
        { status: 400 }
      )
    }

    // Get Discord bot token from environment variable
    const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN
    
    if (!DISCORD_BOT_TOKEN) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Discord bot token not configured. Please add DISCORD_BOT_TOKEN to your environment variables.' 
        },
        { status: 500 }
      )
    }

    // Make request to Discord API with bot token authentication
    const response = await fetch(`https://discord.com/api/v10/users/${userId}`, {
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'TeamMeetingApp/1.0'
      }
    })

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Discord authentication failed. Please check your bot token.' 
          },
          { status: 401 }
        )
      }
      if (response.status === 403) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Bot does not have permission to access this user. Make sure the bot is in the same server as the user.' 
          },
          { status: 403 }
        )
      }
      if (response.status === 404) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Discord user not found. Please check the user ID.' 
          },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { 
          success: false, 
          error: `Discord API error: ${response.status} ${response.statusText}` 
        },
        { status: response.status }
      )
    }

    const userData = await response.json()
    
    return NextResponse.json({
      success: true,
      data: userData
    })

  } catch (error) {
    console.error('Discord API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to connect to Discord. Please try again.' 
      },
      { status: 500 }
    )
  }
} 