# Join Request Feature Documentation

## Overview
This feature allows team members to request to join meeting requests via their Discord UID, with admin approval functionality.

## Features Implemented

### 1. Database Schema Updates
- Added `joinRequestSchema` to `MeetingRequest` model
- Includes fields: discordUid, name, requestedRole, requestedClass, status, timestamps, etc.

### 2. API Endpoints

#### `/api/meeting-requests/[id]/join-requests`
- **GET**: Fetch join requests for a specific meeting
- **POST**: Submit a join request
- **PATCH**: Approve or reject a join request (admin only)

#### `/api/discord/join-meeting`
- **POST**: Discord bot endpoint for submitting join requests
- Validates team member exists by Discord UID
- Returns meeting title for confirmation

### 3. Frontend Features

#### Admin Interface
- Join requests section visible only to admins
- Shows pending requests with member details
- Approve/Reject buttons with optional reason for rejection
- Real-time updates after processing requests

#### Test Interface
- `/test-join-request` page for testing the feature
- Form to submit test join requests
- Shows success/error messages

## How to Use

### For Discord Bot Integration

1. **Setup API Key Authentication**:
   ```bash
   # Generate a secure API key
   node scripts/generate-api-key.js
   
   # Add to your .env file
   DISCORD_BOT_API_KEY=your_generated_api_key_here
   ```

2. **Submit Join Request via Discord Bot** (automatically joins the latest meeting):
   - The system automatically uses the most recent active meeting
   - No need to specify meeting ID in Discord commands
   - Requires API key authentication
   ```javascript
   const response = await fetch('/api/discord/join-meeting', {
     method: 'POST',
     headers: { 
       'Content-Type': 'application/json',
       'Authorization': 'Bearer your_api_key_here'
     },
     body: JSON.stringify({
       discordUid: 'user_discord_uid',
       name: 'User Display Name', // Required for new members
       requestedRole: 'Tank', // Tank, DPS, DPS1, Buff, Boss
       requestedClass: 'A', // A-Z
       avatar: 'https://cdn.discordapp.com/avatars/user_id/avatar.png' // Optional
     })
   })
   ```

2. **Response Format**:
   ```json
   {
     "message": "Join request submitted successfully",
     "joinRequest": { /* request details */ },
     "meetingTitle": "Meeting Title",
     "newMemberCreated": true // true if a new team member was created
   }
   ```

### For Admin Approval

1. **Enable Admin Mode**: Click the "Bật Admin" button in the top-right corner
2. **View Pending Requests**: Join requests section appears below participants
3. **Approve/Reject**: Click buttons to process requests
4. **Optional Reason**: Provide rejection reason if needed

### For Testing

1. Navigate to `/test-join-request`
2. Fill out the form with test data
3. Submit to test the join request flow

## API Response Examples

### Successful Join Request (Existing Member)
```json
{
  "message": "Join request submitted successfully",
  "joinRequest": {
    "discordUid": "123456789",
    "name": "John Doe",
    "requestedRole": "Tank",
    "requestedClass": "A",
    "status": "pending",
    "requestedAt": "2024-01-01T00:00:00.000Z"
  },
  "meetingTitle": "Weekly Raid",
  "newMemberCreated": false
}
```

### Successful Join Request (New Member Created)
```json
{
  "message": "Join request submitted successfully",
  "joinRequest": {
    "discordUid": "987654321",
    "name": "Jane Smith",
    "requestedRole": "DPS",
    "requestedClass": "B",
    "status": "pending",
    "requestedAt": "2024-01-01T00:00:00.000Z"
  },
  "meetingTitle": "Weekly Raid",
  "newMemberCreated": true
}
```

### Error Response
```json
{
  "error": "You already have a pending request for this meeting"
}
```

## Validation Rules

1. **User must exist or be created**: Discord UID must match a team member, or a new member will be created
2. **Name required**: Name is required for creating new team members
3. **No duplicate requests**: User can't have multiple pending requests for same meeting
4. **Not already participating**: User can't request if already a participant or guest
5. **Valid role/class**: Requested role and class must be valid

## Status Flow

1. **pending** → Initial state when request is submitted
2. **approved** → Admin approves, user becomes regular participant (since team members are created if they don't exist)
3. **rejected** → Admin rejects with optional reason

## Security Considerations

- **API Key Authentication**: Discord bot endpoints require valid API key
- Admin toggle is currently for testing - implement proper authentication
- Discord UID validation ensures only team members can request
- New team members are automatically created with basic information
- All API endpoints include proper error handling
- Database operations are atomic and safe
- API keys should be kept secure and rotated periodically

## Discord DM Notifications

### Automatic Notifications
The system now automatically sends Discord DMs to users at key points:

1. **Join Request Submission**: User receives confirmation when their request is submitted
2. **Request Approval**: User receives notification when their request is approved
3. **Request Rejection**: User receives notification when their request is rejected (with optional reason)

### DM Message Examples

#### Join Request Submission
```
🎮 **Yêu cầu tham gia meeting đã được gửi**

**Meeting:** Weekly Raid
**Ngày:** 2024-01-15 lúc 21:00
**Vai trò yêu cầu:** Tank - A

✅ Yêu cầu tham gia của bạn đã được gửi thành công!
⏳ Vui lòng chờ admin phê duyệt yêu cầu của bạn.

Bạn sẽ nhận được thông báo khi yêu cầu được xử lý.
```

#### Request Approval
```
🎮 **Thông báo yêu cầu tham gia meeting**

**Meeting:** Weekly Raid
**Ngày:** 2024-01-15 lúc 21:00
**Trạng thái:** chấp nhận
**Vai trò yêu cầu:** Tank - A

✅ Bạn đã được chấp nhận tham gia bí cảnh này với tư cách thành viên!

Xử lý bởi: Admin
```

#### Request Rejection
```
🎮 **Thông báo yêu cầu tham gia meeting**

**Meeting:** Weekly Raid
**Ngày:** 2024-01-15 lúc 21:00
**Trạng thái:** từ chối
**Vai trò yêu cầu:** Tank - A
**Lý do:** Không đủ slot cho Tank

❌ Yêu cầu tham gia của bạn đã bị từ chối.

Xử lý bởi: Admin
```

### Technical Implementation
- Uses Discord Bot API to create DM channels and send messages
- Requires `DISCORD_BOT_TOKEN` environment variable
- DM failures don't affect the main request processing
- All DM attempts are logged for debugging

## Future Enhancements

1. **Real-time notifications** for admins when new requests arrive
2. **Request history** and analytics
3. **Bulk approval/rejection** for multiple requests
4. **Request templates** for common roles/classes
5. **Customizable DM message templates** 