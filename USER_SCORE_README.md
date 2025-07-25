# User Score System Documentation

## Overview
The User Score System tracks points for team members based on their participation in confirmed meetings. Each member starts with 100 points and earns 1 point for each confirmed meeting they join. Scores are only applied to team members (not temporary guests).

## Features

### 1. Database Schema
- **UserScore Model**: Tracks individual member scores
- **Default Score**: 100 points for new members
- **Meeting Tracking**: Counts total meetings joined
- **Timestamps**: Tracks when scores were last updated

### 2. Point System
- **Starting Points**: 100 points for all new members
- **Earning Points**: +1 point per confirmed meeting
- **Automatic Awarding**: Points are awarded when meetings are confirmed
- **No Deductions**: Points only increase, never decrease

### 3. API Endpoints

#### `/api/user-scores`
- **GET**: Fetch all user scores or leaderboard
  - `?leaderboard=true` - Returns top scores only
  - `?limit=10` - Limit number of results
- **POST**: Create or update user score

#### `/api/user-scores/[id]`
- **GET**: Fetch specific user score by member ID
- **PUT**: Update specific user score
- **DELETE**: Delete user score



### 4. Frontend Features

#### Leaderboard Page (`/leaderboard`)
- **Ranking Display**: Shows top 50 members by score
- **Visual Rankings**: Trophy, medal, and award icons for top 3
- **Statistics**: Total members, highest score, average score
- **Member Details**: Name, Discord UID, avatar, meeting count
- **Real-time Updates**: Refresh button to get latest data

#### Main Page Integration
- **Leaderboard Link**: Floating button to access leaderboard
- **Easy Access**: Quick navigation from main page



## How It Works

### 1. Member Creation
When a new team member is created:
- No UserScore record is created initially
- Score record is created on-demand when they join their first confirmed meeting

### 2. Meeting Confirmation
When a meeting is confirmed:
- System checks all team member participants (not guests)
- For each team member:
  - If no UserScore exists: Creates new record with 100 base points + 1 for this meeting
  - If UserScore exists: Adds 1 point to current score
- Updates total meetings joined count
- Logs the point awarding process

### 3. Score Calculation
```typescript
// Example score calculation
let userScore = await UserScore.findOne({ memberId })

if (!userScore) {
  // Create new user score with base score
  userScore = new UserScore({
    memberId,
    discordUid,
    name,
    score: 100, // Base score
    totalMeetingsJoined: 0
  })
}

// Award 1 point for this meeting
userScore.score += 1
userScore.totalMeetingsJoined += 1
await userScore.save()
```

## Database Schema Details

### UserScore Model
```typescript
{
  memberId: ObjectId,        // Reference to TeamMember
  discordUid: String,        // Discord user ID
  name: String,              // Member name
  score: Number,             // Current score (default: 100)
  totalMeetingsJoined: Number, // Total meetings participated
  lastUpdated: Date,         // Last score update
  timestamps: true           // Created/updated timestamps
}
```

### Indexes
- `memberId`: For efficient member lookups
- `discordUid`: For Discord-based queries
- `score`: For leaderboard sorting

## API Usage Examples

### Get Leaderboard
```javascript
const response = await fetch('/api/user-scores?leaderboard=true&limit=10')
const leaderboard = await response.json()
```

### Get All Scores
```javascript
const response = await fetch('/api/user-scores')
const allScores = await response.json()
```

### Get Specific User Score
```javascript
const response = await fetch('/api/user-scores/memberId123')
const userScore = await response.json()
```

### Update User Score
```javascript
const response = await fetch('/api/user-scores/memberId123', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    score: 150,
    totalMeetingsJoined: 50
  })
})
```



## Leaderboard Features

### Visual Rankings
- **🥇 1st Place**: Gold trophy icon
- **🥈 2nd Place**: Silver medal icon  
- **🥉 3rd Place**: Bronze award icon
- **4th+**: Number ranking

### Statistics Display
- **Total Members**: Count of members with scores
- **Highest Score**: Top performer's score
- **Average Score**: Mean score across all members

### Member Information
- **Avatar**: Member profile picture
- **Name**: Display name
- **Discord UID**: Discord identifier
- **Score**: Current point total
- **Meetings**: Total meetings joined
- **Last Updated**: When score was last modified

## Integration Points

### 1. Meeting Confirmation
- Automatically awards points when meeting status changes to 'confirmed'
- Only applies to team members (participants), not temporary guests
- Graceful error handling - meeting confirmation doesn't fail if point awarding fails

### 2. Join Request Approval
- When join requests are approved, members become participants
- Points are awarded when the meeting is later confirmed
- Maintains consistency with the point system

### 3. Team Member Management
- UserScore records are created on-demand when members join confirmed meetings
- Score records are linked to team member data
- No automatic creation - scores are earned through participation

## Future Enhancements

1. **Point Multipliers**: Different point values for different meeting types
2. **Achievement System**: Special rewards for milestones
3. **Seasonal Rankings**: Reset scores periodically
4. **Point History**: Track point changes over time
5. **Admin Controls**: Manual point adjustments
6. **Discord Integration**: Automatic score announcements
7. **Export Features**: Download leaderboard data
8. **Advanced Statistics**: Detailed analytics and trends

## Error Handling

### Graceful Degradation
- Point awarding failures don't affect meeting confirmation
- Individual member failures don't stop other members from getting points
- Detailed logging for debugging

### Data Consistency
- Automatic UserScore creation for new members
- Fallback handling for missing team member data
- Validation of required fields

## Security Considerations

- Score updates are tied to meeting confirmation (admin-only action)
- No direct score manipulation through public APIs
- Proper validation of all input data
- Audit trail through timestamps and logging 