import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/api-auth'

interface DiscordDMPayload {
  recipient_id: string
  content: string
}

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

    const { discordUid, message } = await request.json()

    // Validate required fields
    if (!discordUid || !message) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: discordUid and message' 
        },
        { status: 400 }
      )
    }

    // Get Discord bot token from environment
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

    // Create DM channel with the user
    const createDMResponse = await fetch(`https://discord.com/api/v10/users/@me/channels`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient_id: discordUid
      }),
    })

    if (!createDMResponse.ok) {
      console.error('Failed to create DM channel:', createDMResponse.status, createDMResponse.statusText)
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to create DM channel: ${createDMResponse.status} ${createDMResponse.statusText}` 
        },
        { status: createDMResponse.status }
      )
    }

    const dmChannel = await createDMResponse.json()

    // Send message to the DM channel
    const sendMessageResponse = await fetch(`https://discord.com/api/v10/channels/${dmChannel.id}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: message
      }),
    })

    if (!sendMessageResponse.ok) {
      console.error('Failed to send DM:', sendMessageResponse.status, sendMessageResponse.statusText)
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to send DM: ${sendMessageResponse.status} ${sendMessageResponse.statusText}` 
        },
        { status: sendMessageResponse.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Discord DM sent successfully'
    })

  } catch (error) {
    console.error('Discord DM error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send Discord DM. Please try again.' 
      },
      { status: 500 }
    )
  }
} 