# Score Modification Feature Documentation

## Overview

The Score Modification feature allows administrators to manually adjust user scores by adding or subtracting points from specific Discord members. This feature includes audit trails and prevents negative scores.

## Features

### 1. **Score Modification**
- Add or subtract points from user scores
- Prevent negative scores (minimum score is 0)
- Full audit trail of all modifications
- Requires reason for modification

### 2. **Audit Trail**
- Track all score modifications with timestamps
- Record who processed the modification
- Store old score, new score, and change amount
- Maintain modification history

### 3. **API Endpoints**

#### Modify User Score
```http
POST /api/user-scores/modify
```

**Request Body:**
```json
{
  "discordUid": "123456789",
  "scoreChange": 5,
  "reason": "Excellent performance in raid",
  "processedBy": "admin_user"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Score modified successfully",
  "data": {
    "discordUid": "123456789",
    "name": "John Doe",
    "oldScore": 105,
    "newScore": 110,
    "scoreChange": 5,
    "reason": "Excellent performance in raid",
    "processedBy": "admin_user",
    "processedAt": "2024-01-15T10:30:00.000Z",
    "teamMember": {
      "name": "John Doe",
      "roles": ["Tank", "DPS"],
      "classes": ["TV", "BD"],
      "isActive": true
    }
  }
}
```

#### Get User Score by Discord UID
```http
GET /api/user-scores/modify?discordUid=123456789
```

**Response:**
```json
{
  "success": true,
  "data": {
    "discordUid": "123456789",
    "name": "John Doe",
    "score": 110,
    "totalMeetingsJoined": 10,
    "lastUpdated": "2024-01-15T10:30:00.000Z",
    "modifications": [
      {
        "scoreChange": 5,
        "oldScore": 105,
        "newScore": 110,
        "reason": "Excellent performance in raid",
        "processedBy": "admin_user",
        "processedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "teamMember": {
      "name": "John Doe",
      "roles": ["Tank", "DPS"],
      "classes": ["TV", "BD"],
      "isActive": true
    }
  }
}
```

### 4. **Python API Usage**

```python
import asyncio
from meeting_api import MeetingAPI

async def main():
    api = MeetingAPI("https://your-domain.com", "your-api-key")
    
    # Add points to user
    result = await api.modify_user_score(
        discord_uid="123456789",
        score_change=5,
        reason="Excellent performance in raid",
        processed_by="admin_user"
    )
    
    if result["success"]:
        data = result["data"]
        print(f"✅ Score modified: {data['oldScore']} → {data['newScore']} (+{data['scoreChange']})")
        print(f"Reason: {data['reason']}")
    else:
        print(f"❌ Error: {result['error']}")
    
    # Subtract points from user
    result = await api.modify_user_score(
        discord_uid="123456789",
        score_change=-3,
        reason="Late to meeting",
        processed_by="admin_user"
    )
    
    if result["success"]:
        data = result["data"]
        print(f"✅ Score modified: {data['oldScore']} → {data['newScore']} ({data['scoreChange']})")
    
    # Get user score details
    score_result = await api.get_user_score_by_discord_uid("123456789")
    
    if score_result["success"]:
        data = score_result["data"]
        print(f"User: {data['name']}")
        print(f"Current Score: {data['score']}")
        print(f"Total Meetings: {data['totalMeetingsJoined']}")
        print(f"Modifications: {len(data['modifications'])}")

asyncio.run(main())
```

## Technical Implementation

### 1. **Database Schema**

The `UserScore` schema now includes a `modifications` field:

```typescript
modifications: [{
  scoreChange: Number,
  oldScore: Number,
  newScore: Number,
  reason: String,
  processedBy: String,
  processedAt: Date
}]
```

### 2. **Score Validation**

```typescript
// Calculate new score with minimum protection
const oldScore = userScore.score
const newScore = Math.max(0, oldScore + scoreChange) // Prevent negative scores
```

### 3. **Modification History**

Each score change is recorded with:
- **scoreChange**: Amount added/subtracted
- **oldScore**: Score before modification
- **newScore**: Score after modification
- **reason**: Why the score was modified
- **processedBy**: Who made the modification
- **processedAt**: When the modification was made

## Business Logic

### 1. **Score Rules**
- Base score: 100 points
- Minimum score: 0 points (cannot go negative)
- Automatic +1 point per confirmed meeting
- Manual modifications can add/subtract any amount

### 2. **Modification Rules**
- Only users with existing scores can be modified
- All modifications require a reason
- All modifications are tracked in audit trail
- Score cannot go below 0

### 3. **Audit Trail**
- Complete history of all score changes
- Timestamps for all modifications
- User accountability (who made the change)
- Reason tracking for transparency

## Usage Examples

### 1. **Reward Good Performance**
```python
# Reward a player for excellent performance
await api.modify_user_score(
    discord_uid="123456789",
    score_change=10,
    reason="Outstanding leadership in raid",
    processed_by="raid_leader"
)
```

### 2. **Penalty for Misconduct**
```python
# Penalize a player for being late
await api.modify_user_score(
    discord_uid="123456789",
    score_change=-5,
    reason="Late to scheduled meeting",
    processed_by="admin"
)
```

### 3. **Check Modification History**
```python
# Get user's score history
score_data = await api.get_user_score_by_discord_uid("123456789")

if score_data["success"]:
    user = score_data["data"]
    print(f"User: {user['name']}")
    print(f"Current Score: {user['score']}")
    
    for mod in user['modifications']:
        print(f"{mod['processedAt']}: {mod['scoreChange']:+d} points - {mod['reason']}")
```

## Error Handling

### 1. **User Not Found**
```json
{
  "success": false,
  "error": "User score not found for this Discord UID"
}
```

### 2. **Missing Required Fields**
```json
{
  "success": false,
  "error": "Missing required fields: discordUid, scoreChange, reason"
}
```

### 3. **Invalid Score Change**
```json
{
  "success": false,
  "error": "scoreChange must be a number"
}
```

## Security Considerations

1. **API Key Required**: All score modifications require valid API key
2. **Audit Trail**: All changes are logged with user accountability
3. **Reason Required**: Every modification must have a reason
4. **No Negative Scores**: System prevents scores from going below 0
5. **Input Validation**: All inputs are validated before processing

## Future Enhancements

1. **Bulk Modifications**: Modify multiple users at once
2. **Modification Limits**: Set maximum/minimum modification amounts
3. **Approval Workflow**: Require approval for large score changes
4. **Notification System**: Notify users of score changes
5. **Score Recovery**: Allow score recovery for certain cases 