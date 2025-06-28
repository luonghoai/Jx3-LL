# Discord Integration Setup Guide

## Current Status
The Discord integration is currently using mock data for demonstration purposes. To enable real Discord API calls, follow the setup instructions below.

## Setup Steps

### 1. Create a Discord Application
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Give your application a name (e.g., "Team Meeting App")
4. Click "Create"

### 2. Create a Bot
1. In your application, go to the "Bot" section in the left sidebar
2. Click "Add Bot"
3. Click "Yes, do it!" to confirm
4. Copy the bot token (you'll need this later)

### 3. Configure Bot Permissions
1. In the Bot section, scroll down to "Privileged Gateway Intents"
2. Enable "Server Members Intent" (required to fetch user information)
3. Save your changes

### 4. Add Bot to Your Server
1. Go to the "OAuth2" → "URL Generator" section
2. In "Scopes", select "bot"
3. In "Bot Permissions", select:
   - Read Messages/View Channels
   - Read Message History
4. Copy the generated URL and open it in a browser
5. Select your server and authorize the bot

### 5. Configure Environment Variables
1. Create or update your `.env.local` file in the project root
2. Add your Discord bot token:
   ```
   DISCORD_BOT_TOKEN=your_bot_token_here
   ```
3. Replace `your_bot_token_here` with the actual bot token you copied

### 6. Enable Real API Calls
1. Open `lib/discord.ts`
2. Comment out the mock data section (lines with mockUserData)
3. Uncomment the real API call section (lines with DISCORD_BOT_TOKEN)

### 7. Restart Your Development Server
```bash
npm run dev
```

## Testing the Integration

1. Open your app and go to the admin panel
2. Try to add a new member or guest
3. Enter a Discord user ID (numeric format, e.g., 123456789012345678)
4. Click "Sync" - you should now see real Discord data

## Troubleshooting

### 401 Unauthorized Error
- Check that your bot token is correct
- Ensure the bot is added to your Discord server
- Verify the environment variable is set correctly

### 404 User Not Found
- Make sure the user ID is correct
- Ensure the user is in the same server as your bot
- Check that the bot has proper permissions

### Bot Token Security
- Never commit your bot token to version control
- Use environment variables for sensitive data
- Regenerate your bot token if it gets exposed

## Alternative Approach (No Bot Required)

If you don't want to set up a Discord bot, you can still use Discord avatars by:

1. Manually entering Discord user IDs
2. Using the avatar URL format: `https://cdn.discordapp.com/avatars/{userId}/{avatarHash}.png`
3. The app will still work with the default avatar fallback

## Support

If you encounter issues:
1. Check the Discord Developer Portal for API documentation
2. Verify your bot permissions and server membership
3. Check the browser console for detailed error messages 