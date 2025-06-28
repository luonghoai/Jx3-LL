// Discord API service for fetching user information

export interface DiscordUser {
  id: string
  username: string
  discriminator?: string
  avatar?: string
  global_name?: string
  display_name?: string
}

export interface DiscordUserResponse {
  success: boolean
  data?: DiscordUser
  error?: string
}

/**
 * Fetch Discord user information by user ID
 * @param userId - Discord user ID (not username)
 * @returns Promise with Discord user data
 */
export async function fetchDiscordUser(userId: string): Promise<DiscordUserResponse> {
  try {
    // Validate user ID format (should be numeric)
    if (!/^\d+$/.test(userId)) {
      return {
        success: false,
        error: 'Invalid Discord user ID format. Please enter a numeric user ID.'
      }
    }

    // Call our server-side API route which handles Discord API calls securely
    const response = await fetch(`/api/discord/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.error || `HTTP error: ${response.status}`
      }
    }

    const result = await response.json()
    
    return {
      success: result.success,
      data: result.data,
      error: result.error
    }
  } catch (error) {
    console.error('Discord API error:', error)
    return {
      success: false,
      error: 'Failed to connect to Discord. Please try again.'
    }
  }
}

/**
 * Get Discord avatar URL
 * @param userId - Discord user ID
 * @param avatarHash - Avatar hash from Discord user data
 * @param size - Avatar size (16, 32, 64, 128, 256, 512, 1024, 2048, 4096)
 * @returns Avatar URL or null if no avatar
 */
export function getDiscordAvatarUrl(userId: string, avatarHash?: string, size: number = 256): string | null {
  if (!avatarHash) {
    return null
  }
  
  // Check if avatar is animated (starts with 'a_')
  const extension = avatarHash.startsWith('a_') ? 'gif' : 'png'
  
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${extension}?size=${size}`
}

/**
 * Get display name for Discord user
 * @param user - Discord user data
 * @returns Display name (global_name, username, or username#discriminator)
 */
export function getDiscordDisplayName(user: DiscordUser): string {
  // Prefer global_name (new Discord naming system)
  if (user.global_name) {
    return user.global_name
  }
  
  // Fall back to username with discriminator if available
  if (user.discriminator && user.discriminator !== '0') {
    return `${user.username}#${user.discriminator}`
  }
  
  // Just username
  return user.username
}

/**
 * Validate Discord user ID format
 * @param userId - User ID to validate
 * @returns true if valid format
 */
export function isValidDiscordUserId(userId: string): boolean {
  return /^\d{17,19}$/.test(userId)
}

/**
 * Setup instructions for Discord integration
 */
export const DISCORD_SETUP_INSTRUCTIONS = `
To enable real Discord integration:

1. Create a Discord Application:
   - Go to https://discord.com/developers/applications
   - Click "New Application"
   - Give it a name (e.g., "Team Meeting App")

2. Create a Bot:
   - Go to the "Bot" section in your application
   - Click "Add Bot"
   - Copy the bot token

3. Set Bot Permissions:
   - In the Bot section, enable "Server Members Intent"
   - This allows the bot to fetch user information

4. Add Environment Variable:
   - Add DISCORD_BOT_TOKEN=your_bot_token to your .env file

5. Update the Code:
   - Uncomment the real API call code in lib/discord.ts
   - Comment out the mock data section

Note: The bot needs to be in the same server as the users you want to fetch.
` 