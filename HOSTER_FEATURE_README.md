# Hoster Feature Documentation

## Overview

The Hoster feature allows each **confirmed** meeting request to have one designated hoster (leader) who is selected randomly with score-weighted probability. Higher-scoring members have a better chance of being selected as hoster. **Hoster selection is only available for meetings with confirmed status.**

## Features

### 1. **Score-Weighted Random Selection**
- Members with higher scores have higher chances of being selected
- Uses weighted random algorithm based on user scores
- Only team members (participants) are eligible, not temporary guests

### 2. **Hoster Display**
- Special visual styling for hoster cards with blinking/pulsing effects
- Crown icon and score display
- Dedicated hoster section in meeting details

### 3. **API Endpoints**

#### Select Hoster
```http
POST /api/meeting-requests/{meetingId}/select-hoster
```

**Response:**
```json
{
  "success": true,
  "message": "Hoster selected successfully",
  "hoster": {
    "memberId": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "discordUid": "123456789",
    "meetingRole": "Tank",
    "meetingClass": "TV",
    "score": 105,
    "selectedAt": "2024-01-15T10:30:00.000Z"
  },
  "alreadySelected": false
}
```

#### Get Hoster
```http
GET /api/meeting-requests/{meetingId}/select-hoster
```

**Response:**
```json
{
  "success": true,
  "hoster": {
    "memberId": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "discordUid": "123456789",
    "meetingRole": "Tank",
    "meetingClass": "TV",
    "score": 105,
    "selectedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 4. **Discord Bot Commands**

#### Select Hoster
```bash
!selecthoster                    # Select hoster for latest confirmed meeting
!selecthoster 507f1f77bcf86cd799439011  # Select hoster for specific confirmed meeting
```

#### Get Hoster Info
```bash
!hoster                    # Get hoster for latest confirmed meeting
!hoster 507f1f77bcf86cd799439011  # Get hoster for specific meeting
```

#### List Meetings with Hoster Status
```bash
!meetings  # Shows latest confirmed meeting info including hoster status
```

### 5. **Python API Usage**

```python
import asyncio
from meeting_api import MeetingAPI

async def main():
    api = MeetingAPI("https://your-domain.com", "your-api-key")
    
    # Select hoster for a meeting
    result = await api.select_hoster("meeting_id_here")
    
    if result["success"]:
        hoster = result["data"]["hoster"]
        print(f"Hoster selected: {hoster['name']} (Score: {hoster['score']})")
    
    # Get current hoster
    hoster_result = await api.get_hoster("meeting_id_here")
    
    if hoster_result["success"]:
        hoster = hoster_result["data"]
        if hoster:
            print(f"Current hoster: {hoster['name']}")
        else:
            print("No hoster selected yet")

asyncio.run(main())
```

## Technical Implementation

### 1. **Database Schema**

The `MeetingRequest` schema now includes a `hoster` field:

```typescript
hoster: {
  memberId: String,
  name: String,
  discordUid: String,
  meetingRole: String,
  meetingClass: String,
  score: Number,
  selectedAt: Date
}
```

### 2. **Score-Weighted Selection Algorithm**

```typescript
function selectWeightedRandomHoster(participants: any[]): any {
  // Calculate total weight (sum of all scores)
  const totalWeight = participants.reduce((sum, participant) => sum + participant.score, 0)
  
  // Generate random number between 0 and total weight
  const random = Math.random() * totalWeight
  
  // Find the participant based on weighted random selection
  let currentWeight = 0
  
  for (const participant of participants) {
    currentWeight += participant.score
    
    if (random <= currentWeight) {
      return participant
    }
  }
  
  return participants[participants.length - 1]
}
```

### 3. **CSS Animations**

Custom CSS animations for hoster visual effects:

```css
@keyframes hoster-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.02); }
}

@keyframes hoster-glow {
  0%, 100% { box-shadow: 0 0 5px rgba(251, 191, 36, 0.5); }
  50% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.8); }
}

.hoster-card {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(249, 115, 22, 0.1) 100%);
  border: 2px solid rgba(251, 191, 36, 0.5);
  animation: hoster-pulse 2s ease-in-out infinite;
}
```

## Business Logic

### 1. **Selection Rules**
- **Only confirmed meetings** are eligible for hoster selection
- Only team members (participants) are eligible for hoster selection
- Temporary guests are not eligible
- Members with higher scores have proportionally higher chances
- Once a hoster is selected, it cannot be changed (returns existing hoster)

### 2. **Score Impact**
- Base score: 100 points
- Each confirmed meeting: +1 point
- Higher scores = higher selection probability
- Example: Member with 105 points has 5% higher chance than member with 100 points

### 3. **Visual Indicators**
- Hoster cards have special styling with animations
- Crown icon (👑) displayed next to hoster name
- Score prominently displayed
- Blinking/pulsing effects to draw attention

## Usage Examples

### 1. **Select Hoster via Discord**
```
User: !selecthoster
Bot: 🎉 Hoster Selected!
     👑 New Hoster: John Doe
     Role: Tank - TV
     Score: 105
     Selection Method: Score-weighted random selection
```

### 2. **Check Current Hoster**
```
User: !hoster
Bot: 👑 Current Hoster
     Hoster: John Doe
     Role: Tank - TV
     Score: 105
     Selected At: 2024-01-15T10:30:00.000Z
```

### 3. **View Meeting with Hoster Status**
```
User: !meetings
Bot: 📅 Latest Confirmed Meeting
     Title: Weekly Raid
     Date: 2024-01-20
     Time: 20:00
     Status: confirmed
     Participants: 8
     👑 Hoster: John Doe (Tank - TV) - Score: 105
```

### 4. **Error - Meeting Not Confirmed**
```
User: !selecthoster
Bot: ❌ Hoster can only be selected for confirmed meetings
```

## Error Handling

### 1. **No Participants**
```json
{
  "success": false,
  "error": "No participants available to select hoster from"
}
```

### 2. **Hoster Already Selected**
```json
{
  "success": true,
  "message": "Hoster already selected",
  "hoster": { ... },
  "alreadySelected": true
}
```

### 3. **Meeting Not Confirmed**
```json
{
  "success": false,
  "error": "Hoster can only be selected for confirmed meetings"
}
```

### 4. **Meeting Not Found**
```json
{
  "success": false,
  "error": "Meeting request not found"
}
```

## Future Enhancements

1. **Hoster Rotation**: Allow changing hoster if needed
2. **Hoster History**: Track hoster selection history
3. **Hoster Preferences**: Allow members to opt-out of hoster selection
4. **Team Balance**: Consider team composition when selecting hoster
5. **Hoster Bonuses**: Additional score bonuses for being hoster 