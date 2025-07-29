import aiohttp
import json
from typing import Dict, Any, Optional
from dataclasses import dataclass

@dataclass
class JoinMeetingRequest:
    """Request to join a specific meeting"""
    meeting_id: str
    discord_uid: str
    name: str
    requested_role: str
    requested_class: str
    avatar: Optional[str] = None

@dataclass
class JoinMeetingResponse:
    """Response from join meeting API"""
    success: bool
    message: str
    meeting_title: Optional[str] = None
    new_member_created: bool = False
    error: Optional[str] = None



@dataclass
class MeetingRequest:
    """Meeting request data"""
    _id: str
    title: str
    description: str
    date: str
    time: str
    status: str
    is_active: bool
    participants: list
    temporary_guests: list
    join_requests: list
    created_at: str
    updated_at: str

class MeetingAPI:
    """API client for meeting requests"""
    
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
    
    async def _make_request(self, method: str, endpoint: str, data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Make HTTP request to the API"""
        url = f"{self.base_url}{endpoint}"
        
        async with aiohttp.ClientSession() as session:
            async with session.request(
                method=method,
                url=url,
                headers=self.headers,
                json=data
            ) as response:
                response_data = await response.json()
                
                if response.status == 200 or response.status == 201:
                    return {
                        "success": True,
                        "data": response_data
                    }
                elif response.status == 401:
                    return {
                        "success": False,
                        "error": "Invalid API key - check your DISCORD_BOT_API_KEY"
                    }
                else:
                    return {
                        "success": False,
                        "error": response_data.get("error", f"HTTP {response.status}")
                    }
    
    async def get_latest_active_meeting(self) -> Dict[str, Any]:
        """Get the latest meeting request that is not confirmed or cancelled"""
        return await self._make_request('GET', '/api/meeting-requests/latest-active')
    
    async def get_latest_confirmed_meeting(self) -> Dict[str, Any]:
        """Get the latest meeting request with confirmed status"""
        return await self._make_request('GET', '/api/meeting-requests/latest-confirmed')
    
    async def select_hoster_for_latest_confirmed(self) -> Dict[str, Any]:
        """Select hoster for the latest confirmed meeting"""
        # First get the latest confirmed meeting
        meeting_result = await self.get_latest_confirmed_meeting()
        
        if not meeting_result["success"]:
            return meeting_result
        
        meeting_id = meeting_result["data"]["_id"]
        
        # Then select hoster for that meeting
        return await self.select_hoster(meeting_id)
    
    async def request_join_meeting(self, request: JoinMeetingRequest) -> JoinMeetingResponse:
        """Request to join a specific meeting with API key authentication"""
        payload = {
            "meetingId": request.meeting_id,
            "discordUid": str(request.discord_uid),
            "name": request.name,
            "requestedRole": request.requested_role,
            "requestedClass": request.requested_class
        }
        
        if request.avatar:
            payload["avatar"] = request.avatar
        
        result = await self._make_request('POST', '/api/discord/join-meeting', payload)
        
        if result["success"]:
            data = result["data"]
            return JoinMeetingResponse(
                success=True,
                message=data.get("message", "Join request submitted successfully"),
                meeting_title=data.get("meetingTitle"),
                new_member_created=data.get("newMemberCreated", False)
            )
        else:
            return JoinMeetingResponse(
                success=False,
                error=result["error"]
            )
    
    async def get_meeting_requests(self) -> Dict[str, Any]:
        """Get all meeting requests"""
        return await self._make_request('GET', '/api/meeting-requests')
    
    async def get_meeting_request(self, meeting_id: str) -> Dict[str, Any]:
        """Get a specific meeting request"""
        return await self._make_request('GET', f'/api/meeting-requests/{meeting_id}')
    
    async def get_join_requests(self, meeting_id: str) -> Dict[str, Any]:
        """Get join requests for a specific meeting"""
        return await self._make_request('GET', f'/api/meeting-requests/{meeting_id}/join-requests')
    
    async def approve_join_request(self, meeting_id: str, discord_uid: str, processed_by: str, reason: Optional[str] = None) -> Dict[str, Any]:
        """Approve a join request"""
        payload = {
            "discordUid": discord_uid,
            "action": "approve",
            "processedBy": processed_by
        }
        if reason:
            payload["reason"] = reason
        return await self._make_request('PATCH', f'/api/meeting-requests/{meeting_id}/join-requests', payload)
    
    async def reject_join_request(self, meeting_id: str, discord_uid: str, processed_by: str, reason: Optional[str] = None) -> Dict[str, Any]:
        """Reject a join request"""
        payload = {
            "discordUid": discord_uid,
            "action": "reject",
            "processedBy": processed_by
        }
        if reason:
            payload["reason"] = reason
        return await self._make_request('PATCH', f'/api/meeting-requests/{meeting_id}/join-requests', payload)
    
    async def send_discord_dm(self, discord_uid: str, message: str) -> Dict[str, Any]:
        """Send Discord DM to a user"""
        payload = {
            "discordUid": discord_uid,
            "message": message
        }
        return await self._make_request('POST', '/api/discord/dm', payload)
    
    async def select_hoster(self, meeting_id: str) -> Dict[str, Any]:
        """Select a random hoster for a meeting"""
        return await self._make_request('POST', f'/api/meeting-requests/{meeting_id}/select-hoster')
    
    async def get_hoster(self, meeting_id: str) -> Dict[str, Any]:
        """Get the current hoster for a meeting"""
        return await self._make_request('GET', f'/api/meeting-requests/{meeting_id}/select-hoster') 