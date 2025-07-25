import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware to validate API key for Discord bot requests
 */
export function validateApiKey(request: NextRequest): { isValid: boolean; error?: string } {
  const apiKey = process.env.DISCORD_BOT_API_KEY
  
  if (!apiKey) {
    return {
      isValid: false,
      error: 'API key not configured on server'
    }
  }

  const authHeader = request.headers.get('authorization')
  
  if (!authHeader) {
    return {
      isValid: false,
      error: 'Authorization header missing'
    }
  }

  // Check for Bearer token format
  if (!authHeader.startsWith('Bearer ')) {
    return {
      isValid: false,
      error: 'Invalid authorization format. Use: Bearer <api_key>'
    }
  }

  const providedKey = authHeader.substring(7) // Remove 'Bearer ' prefix
  
  if (providedKey !== apiKey) {
    return {
      isValid: false,
      error: 'Invalid API key'
    }
  }

  return { isValid: true }
}

/**
 * Wrapper function to add API key validation to API routes
 */
export function withApiKeyAuth(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const validation = validateApiKey(request)
    
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false,
          error: validation.error || 'Unauthorized' 
        },
        { status: 401 }
      )
    }

    return handler(request)
  }
}

/**
 * Generate a secure API key
 */
export function generateApiKey(): string {
  const crypto = require('crypto')
  return crypto.randomBytes(32).toString('hex')
} 