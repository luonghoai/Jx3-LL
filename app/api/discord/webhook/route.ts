import { NextRequest, NextResponse } from 'next/server'

interface DiscordWebhookPayload {
  content: string
  username?: string
  avatar_url?: string
}

export async function POST(request: NextRequest) {
  try {
    const { meetingTitle, meetingDescription, meetingDate, meetingTime, discordUids } = await request.json()

    // Get Discord webhook URL from environment
    const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK
    
    if (!DISCORD_WEBHOOK_URL) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Discord webhook URL not configured. Please add DISCORD_WEBHOOK to your environment variables.' 
        },
        { status: 500 }
      )
    }

    // Format the message content
    const mentions = discordUids.map((uid: string) => `<@${uid}>`).join(' ')
    const meetingLink = `${process.env.NEXT_PUBLIC_APP_URL || '...'}`
    const content = `${meetingTitle} - ${meetingDescription} vào lúc ${meetingDate} - ${meetingTime} nhé mọi người ! ${mentions} <br> ${meetingLink}`

    // Prepare webhook payload
    const payload: DiscordWebhookPayload = {
      content
    }

    // Send to Discord webhook
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      console.error('Discord webhook error:', response.status, response.statusText)
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to send Discord message: ${response.status} ${response.statusText}` 
        },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Discord notification sent successfully'
    })

  } catch (error) {
    console.error('Discord webhook error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send Discord notification. Please try again.' 
      },
      { status: 500 }
    )
  }
} 