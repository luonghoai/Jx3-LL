'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, Plus, Edit, Trash2, X, Users, MessageSquare, Swords, Calendar, Search } from 'lucide-react'
import AuthGuard from '@/components/auth-guard'
import GuestManager from '@/components/guest-manager'
import MemberRoleModal from '@/components/member-role-modal'
import MemberFormModal from '@/components/member-form-modal'
import GuestFormModal from '@/components/guest-form-modal'
import { 
  MEETING_FILTER_OPTIONS,
  type MeetingFilterOption,
  getClassValue,
} from '@/lib/constants'

interface TeamMember {
  _id: string
  name: string
  discordUid?: string
  roles: string[]
  classes: string[]
  avatar?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface MeetingParticipant {
  memberId: string
  name: string
  discordUid?: string
  meetingRole: string
  meetingClass: string
}

interface TemporaryGuest {
  id: string
  name: string
  discordUid?: string
  roles: string[]
  classes: string[]
  meetingRole: string
  meetingClass: string
  avatar?: string
}

interface MeetingRequest {
  _id: string
  title: string
  description: string
  date: string
  time: string
  status: string
  participants: MeetingParticipant[]
  temporaryGuests: TemporaryGuest[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

function AdminPageContent() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [meetingRequests, setMeetingRequests] = useState<MeetingRequest[]>([])
  const [meetingLoading, setMeetingLoading] = useState(true)
  const [meetingError, setMeetingError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'members' | 'meetings'>('members')
  const [participantSearch, setParticipantSearch] = useState('')
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [editingParticipantId, setEditingParticipantId] = useState<string | null>(null)
  const [showMemberRoleModal, setShowMemberRoleModal] = useState(false)
  const [showGuestModal, setShowGuestModal] = useState(false)
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [editingGuest, setEditingGuest] = useState<TemporaryGuest | null>(null)
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null)
  const [showGuestRoleModal, setShowGuestRoleModal] = useState(false)
  
  // Meeting filter state
  const [meetingFilter, setMeetingFilter] = useState<MeetingFilterOption>(MEETING_FILTER_OPTIONS.ALL)
  
  // Pagination state for meeting requests
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 3

  // Filter and sort meeting requests
  const filteredMeetings = meetingRequests
    .filter(meeting => {
      if (meetingFilter === MEETING_FILTER_OPTIONS.ALL) return true
      return meeting.status === meetingFilter
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  // Paginate meeting requests
  const totalPages = Math.ceil(filteredMeetings.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedMeetings = filteredMeetings.slice(startIndex, endIndex)

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [meetingFilter])

  // Team Members pagination and search
  const [memberSearch, setMemberSearch] = useState('')
  const [memberCurrentPage, setMemberCurrentPage] = useState(1)
  const memberItemsPerPage = 25

  // Filter and sort team members
  const filteredMembers = teamMembers
    .filter(member => member.isActive)
    .filter(member =>
      member.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      member.discordUid?.toLowerCase().includes(memberSearch.toLowerCase()) ||
      member.roles.some(role => role.toLowerCase().includes(memberSearch.toLowerCase())) ||
      member.classes.some(cls => cls.toLowerCase().includes(memberSearch.toLowerCase()))
    )
    .sort((a, b) => a.name.localeCompare(b.name))

  // Paginate team members
  const memberTotalPages = Math.ceil(filteredMembers.length / memberItemsPerPage)
  const memberStartIndex = (memberCurrentPage - 1) * memberItemsPerPage
  const memberEndIndex = memberStartIndex + memberItemsPerPage
  const paginatedMembers = filteredMembers.slice(memberStartIndex, memberEndIndex)

  // Reset member page when search changes
  useEffect(() => {
    setMemberCurrentPage(1)
  }, [memberSearch])

  // Fetch team members from API
  const fetchTeamMembers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/team-members')
      if (!response.ok) {
        throw new Error('Không thể tải danh sách thành viên')
      }
      const data = await response.json()
      setTeamMembers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching team members:', err)
    } finally {
      setLoading(false)
    }
  }

  // Load team members on mount
  useEffect(() => {
    fetchTeamMembers()
  }, [])

  // Update CRUD functions to use API
  const handleAddMember = async (memberData: { name: string; discordUid?: string; roles: string[]; classes: string[]; avatar?: string }) => {
    try {
      const response = await fetch('/api/team-members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memberData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Không thể tạo thành viên')
      }

      const newMember = await response.json()
      setTeamMembers(prev => [...prev, newMember])
      setShowMemberModal(false)
      setEditingMember(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể tạo thành viên')
      console.error('Error creating team member:', err)
    }
  }

  const handleUpdateMember = async (memberData: { name: string; discordUid?: string; roles: string[]; classes: string[]; avatar?: string }) => {
    if (!editingMember) return
    
    try {
      const response = await fetch(`/api/team-members/${editingMember._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memberData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Không thể cập nhật thành viên')
      }

      const updatedMember = await response.json()
      setTeamMembers(prev => 
        prev.map(member => 
          member._id === editingMember._id ? updatedMember : member
        )
      )
      setShowMemberModal(false)
      setEditingMember(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể cập nhật thành viên')
      console.error('Error updating team member:', err)
    }
  }

  const handleDeleteMember = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thành viên này không?')) return
    
    try {
      const response = await fetch(`/api/team-members/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Không thể xóa thành viên')
      }

      setTeamMembers(prev => 
        prev.map(member =>
          member._id === id ? { ...member, isActive: false } : member
        )
      )
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể xóa thành viên')
      console.error('Error deleting team member:', err)
    }
  }

  // Meeting form state
  const [meetingForm, setMeetingForm] = useState(() => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    return {
      title: '',
      description: '',
      date: tomorrow.toISOString().split('T')[0],
      time: '21:00',
      participants: [] as MeetingParticipant[],
      temporaryGuests: [] as TemporaryGuest[]
    }
  })

  // Fetch meeting requests from API
  const fetchMeetingRequests = async () => {
    try {
      setMeetingLoading(true)
      setMeetingError(null)
      const response = await fetch('/api/meeting-requests')
      if (!response.ok) {
        throw new Error('Không thể tải lịch bí cảnh')
      }
      const data = await response.json()
      setMeetingRequests(data)
    } catch (err) {
      setMeetingError(err instanceof Error ? err.message : 'Lỗi khi tải lịch bí cảnh')
      console.error('Error fetching meeting requests:', err)
    } finally {
      setMeetingLoading(false)
    }
  }

  // Load meeting requests on mount
  useEffect(() => {
    fetchMeetingRequests()
  }, [])

  // Update meeting request functions to use API
  const handleCreateMeeting = async () => {
    const missingFields = []
    if (!meetingForm.title) missingFields.push('Title')
    if (!meetingForm.description) missingFields.push('Description')
    if (!meetingForm.date) missingFields.push('Date')
    if (!meetingForm.time) missingFields.push('Time')
    if (meetingForm.participants.length === 0 && meetingForm.temporaryGuests.length === 0) {
      missingFields.push('Ít nhất một thành viên hoặc khách mời')
    }
    
    if (missingFields.length > 0) {
      alert(`Vui lòng điền các trường bắt buộc: ${missingFields.join(', ')}`)
      return
    }

    try {
      const response = await fetch('/api/meeting-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: meetingForm.title,
          description: meetingForm.description,
          date: meetingForm.date,
          time: meetingForm.time,
          participants: meetingForm.participants,
          temporaryGuests: meetingForm.temporaryGuests
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Không thể tạo lịch bí cảnh')
      }

      const newMeeting = await response.json()
      setMeetingRequests(prev => [newMeeting, ...prev]) // Add to beginning since sorted by date DESC
      
      // Reset form
      setMeetingForm({
        title: '',
        description: '',
        date: '',
        time: '',
        participants: [],
        temporaryGuests: [],
      })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể tạo lịch bí cảnh')
      console.error('Error creating meeting request:', err)
    }
  }

  const handleConfirmMeeting = async (meetingId: string) => {
    try {
      const response = await fetch(`/api/meeting-requests/${meetingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'confirmed' }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Không thể xác nhận lịch bí cảnh')
      }

      const updatedMeeting = await response.json()
      setMeetingRequests(prev => 
        prev.map(meeting => 
          meeting._id === meetingId ? updatedMeeting : meeting
        )
      )

      // Send Discord notification
      try {
        // Collect all Discord UIDs from participants and guests
        const discordUids: string[] = []
        
        // Add participant Discord UIDs
        updatedMeeting.participants.forEach((participant: MeetingParticipant) => {
          if (participant.discordUid) {
            discordUids.push(participant.discordUid)
          }
        })
        
        // Add guest Discord UIDs
        updatedMeeting.temporaryGuests.forEach((guest: TemporaryGuest) => {
          if (guest.discordUid) {
            discordUids.push(guest.discordUid)
          }
        })

        // Send Discord webhook if there are Discord UIDs
        if (discordUids.length > 0) {
          const webhookResponse = await fetch('/api/discord/webhook', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              meetingTitle: updatedMeeting.title,
              meetingDescription: updatedMeeting.description,
              meetingDate: updatedMeeting.date,
              meetingTime: updatedMeeting.time,
              discordUids: discordUids
            }),
          })

          if (!webhookResponse.ok) {
            console.error('Failed to send Discord notification:', webhookResponse.statusText)
          } else {
            console.log('Discord notification sent successfully')
          }
        }
      } catch (webhookError) {
        console.error('Error sending Discord notification:', webhookError)
        // Don't throw error here as the meeting was already confirmed successfully
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể xác nhận lịch bí cảnh')
      console.error('Error confirming meeting:', err)
    }
  }

  const handleCancelMeeting = async (meetingId: string) => {
    if (!confirm('Bạn có chắc chắn muốn hủy lịch bí cảnh này không?')) return
    
    try {
      const response = await fetch(`/api/meeting-requests/${meetingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'canceled' }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Không thể hủy lịch bí cảnh')
      }

      const updatedMeeting = await response.json()
      setMeetingRequests(prev => 
        prev.map(meeting => 
          meeting._id === meetingId ? updatedMeeting : meeting
        )
      )
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể hủy lịch bí cảnh')
      console.error('Error canceling meeting:', err)
    }
  }

  // Filter participants based on search
  const filteredParticipants = teamMembers.filter(member =>
    member.isActive && (
      member.name.toLowerCase().includes(participantSearch.toLowerCase()) ||
      member.discordUid?.toLowerCase().includes(participantSearch.toLowerCase()) ||
      member.roles.some(role => role.toLowerCase().includes(participantSearch.toLowerCase())) ||
      member.classes.some(dept => dept.toLowerCase().includes(participantSearch.toLowerCase()))
    )
  )

  const activeMembers = teamMembers.filter(m => m.isActive)

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member)
    setShowMemberModal(true)
  }

  const handleAddParticipant = (member: TeamMember) => {
    const totalMembers = meetingForm.participants.length + meetingForm.temporaryGuests.length
    if (totalMembers >= 25) {
      alert('Tối đa 25 thành viên (bao gồm khách mời) cho mỗi lịch bí cảnh')
      return
    }
    setSelectedMember(member)
    setEditingParticipantId(null)
    setShowMemberRoleModal(true)
  }

  const handleUpdateParticipant = (participant: MeetingParticipant) => {
    const member = teamMembers.find(m => m._id === participant.memberId)
    if (member) {
      setSelectedMember(member)
      setEditingParticipantId(participant.memberId)
      setShowMemberRoleModal(true)
    }
  }

  const handleSaveParticipantRole = (role: string, classValue: string) => {
    if (!selectedMember) return

    if (editingParticipantId) {
      // Update existing participant
      setMeetingForm(prev => ({
        ...prev,
        participants: prev.participants.map(p =>
          p.memberId === editingParticipantId
            ? { ...p, meetingRole: role, meetingClass: classValue }
            : p
        )
      }))
    } else {
      // Add new participant
      const newParticipant: MeetingParticipant = {
        memberId: selectedMember._id,
        name: selectedMember.name,
        discordUid: selectedMember.discordUid,
        meetingRole: role,
        meetingClass: classValue
      }
      setMeetingForm(prev => ({
        ...prev,
        participants: [...prev.participants, newParticipant]
      }))
    }
  }

  const handleAddGuest = (guestData: { name: string; discordUid?: string; roles: string[]; classes: string[]; avatar?: string }) => {
    const totalMembers = meetingForm.participants.length + meetingForm.temporaryGuests.length
    if (totalMembers >= 25) {
      alert('Tối đa 25 thành viên (bao gồm khách mời) cho mỗi lịch bí cảnh')
      return
    }
    const newGuest: TemporaryGuest = {
      id: `guest_${Date.now()}`,
      name: guestData.name,
      discordUid: guestData.discordUid,
      roles: guestData.roles,
      classes: guestData.classes,
      meetingRole: guestData.roles[0] || '',
      meetingClass: guestData.classes[0] || '',
      avatar: guestData.avatar,
    }
    setMeetingForm(prev => ({
      ...prev,
      temporaryGuests: [...prev.temporaryGuests, newGuest]
    }))
  }

  const handleRemoveGuest = (guestId: string) => {
    setMeetingForm(prev => ({
      ...prev,
      temporaryGuests: prev.temporaryGuests.filter(guest => guest.id !== guestId)
    }))
  }

  const handleUpdateGuestRole = (guestId: string, role: string, classValue: string) => {
    const guest = meetingForm.temporaryGuests.find(g => g.id === guestId)
    if (guest) {
      setEditingGuest(guest)
      setEditingGuestId(guestId)
      setShowGuestRoleModal(true)
    }
  }

  const handleSaveGuestRole = (role: string, classValue: string) => {
    if (!editingGuestId) return
    
    setMeetingForm(prev => ({
      ...prev,
      temporaryGuests: prev.temporaryGuests.map(guest =>
        guest.id === editingGuestId
          ? { ...guest, meetingRole: role, meetingClass: classValue }
          : guest
      )
    }))
    setEditingGuestId(null)
    setEditingGuest(null)
    setShowGuestRoleModal(false)
  }

  const handleFillAllMembers = () => {
    const totalMembers = teamMembers.filter(m => m.isActive).length + meetingForm.temporaryGuests.length
    if (totalMembers > 25) {
      alert('Tối đa 25 thành viên (bao gồm khách mời) cho mỗi lịch bí cảnh')
      return
    }

    const allActiveMembers = teamMembers.filter(m => m.isActive)
    const newParticipants: MeetingParticipant[] = allActiveMembers.map(member => ({
      memberId: member._id,
      name: member.name,
      discordUid: member.discordUid,
      meetingRole: member.roles[0] || 'DPS', // Use first role as default
      meetingClass: member.classes[0] || 'BD' // Use first class as default
    }))

    setMeetingForm(prev => ({
      ...prev,
      participants: newParticipants
    }))
  }

  const handleCopyFromMeeting = (meeting: MeetingRequest) => {
    const totalMembers = meeting.participants.length + meeting.temporaryGuests.length + meetingForm.temporaryGuests.length
    if (totalMembers > 25) {
      alert('Tối đa 25 thành viên (bao gồm khách mời) cho mỗi lịch bí cảnh')
      return
    }

    // Copy participants from the selected meeting
    setMeetingForm(prev => ({
      ...prev,
      participants: [...meeting.participants],
      temporaryGuests: [...meeting.temporaryGuests]
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại trang chủ
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bảng điều khiển Admin</h1>
              <p className="text-gray-600 mt-2">
                Quản lý thành viên và lịch bí cảnh
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-white p-1 rounded-lg shadow-sm">
          <Button
            variant={activeTab === 'members' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('members')}
            className="flex-1"
          >
            <Users className="h-4 w-4 mr-2" />
            Thành viên
          </Button>
          <Button
            variant={activeTab === 'meetings' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('meetings')}
            className="flex-1"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Lịch bí cảnh
          </Button>
        </div>

        {/* Team Members Tab */}
        {activeTab === 'members' && (
          <div>
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm theo tên, UID Discord, vai trò, hoặc lớp..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Đang tải thành viên...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <div className="text-red-800">
                    <p className="font-medium">Lỗi khi tải thành viên</p>
                    <p className="text-sm">{error}</p>
                    <button 
                      onClick={fetchTeamMembers}
                      className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                    >
                      Thử lại
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Team Members List */}
            {!loading && !error && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Thành viên ({filteredMembers.length})</h2>
                  <Button onClick={() => setShowMemberModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm thành viên
                  </Button>
                </div>

                {filteredMembers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">
                      {memberSearch ? 'Không tìm thấy thành viên phù hợp với tìm kiếm của bạn.' : 'Không tìm thấy thành viên.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paginatedMembers.map((member) => (
                      <Card key={member._id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-4">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={member.avatar || "/images/default.png"} />
                              <AvatarFallback>
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg truncate">{member.name}</CardTitle>
                              <CardDescription className="truncate">{member.roles.join(', ')}</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <MessageSquare className="h-4 w-4" />
                            <span className="truncate">{member.discordUid || 'No Discord UID'}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Swords className="h-4 w-4" />
                            <span>{member.classes.map(cls => getClassValue(cls as any)).join(', ')}</span>
                          </div>
                          <div className="flex space-x-2 pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditMember(member)}
                              className="flex-1"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Sửa
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteMember(member._id)}
                              className="flex-1 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Xóa
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Team Members Pagination Controls */}
                {memberTotalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-700">
                      Showing {memberStartIndex + 1} to {Math.min(memberEndIndex, filteredMembers.length)} of {filteredMembers.length} members
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setMemberCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={memberCurrentPage === 1}
                      >
                        Trước
                      </Button>
                      
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: memberTotalPages }, (_, i) => i + 1).map(page => (
                          <Button
                            key={page}
                            variant={memberCurrentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setMemberCurrentPage(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setMemberCurrentPage(prev => Math.min(prev + 1, memberTotalPages))}
                        disabled={memberCurrentPage === memberTotalPages}
                      >
                        Tiếp
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Meeting Requests Tab */}
        {activeTab === 'meetings' && (
          <div className="space-y-6">
            {/* Meeting Request Form */}
            <Card>
              <CardHeader>
                <CardTitle>Tạo lịch bí cảnh mới</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tiêu đề</label>
                    <Input
                      value={meetingForm.title}
                      onChange={(e) => setMeetingForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Tiêu đề lịch bí cảnh"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Ngày</label>
                    <Input
                      type="date"
                      value={meetingForm.date}
                      onChange={(e) => setMeetingForm(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Thời gian</label>
                    <Input
                      type="time"
                      value={meetingForm.time}
                      onChange={(e) => setMeetingForm(prev => ({ ...prev, time: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Mô tả</label>
                    <Input
                      value={meetingForm.description}
                      onChange={(e) => setMeetingForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Mô tả lịch bí cảnh"
                    />
                  </div>
                </div>

                {/* Participant Selection */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">Chọn thành viên</label>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleFillAllMembers}
                      className="text-xs"
                    >
                      Thêm tất cả thành viên
                    </Button>
                  </div>
                  <Input
                    placeholder="Tìm kiếm thành viên..."
                    value={participantSearch}
                    onChange={(e) => setParticipantSearch(e.target.value)}
                    className="mb-3"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-80 overflow-y-auto border rounded p-2">
                    {filteredParticipants.map((member) => (
                      <button
                        key={member._id}
                        onClick={() => handleAddParticipant(member)}
                        disabled={meetingForm.participants.some(p => p.memberId === member._id)}
                        className={`text-left p-2 rounded text-sm flex items-center gap-2 ${
                          meetingForm.participants.some(p => p.memberId === member._id)
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : 'hover:bg-blue-50 border'
                        }`}
                      >
                        <Avatar className="h-6 w-6 flex-shrink-0">
                          <AvatarImage src={member.avatar || "/images/default.png"} />
                          <AvatarFallback className="text-xs">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">{member.name}</div>
                          <div className="text-xs text-gray-600 truncate">
                            {member.roles.join(', ')} • {member.classes.map(cls => getClassValue(cls as any)).join(', ')}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Participants */}
                <div>
                  <label className="block text-sm font-medium mb-2">Thành viên đã chọn ({meetingForm.participants.length})</label>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                    {meetingForm.participants.map((participant) => {
                      const member = teamMembers.find(m => m._id === participant.memberId)
                      return (
                        <div key={participant.memberId} className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs">
                          <Avatar className="h-5 w-5 flex-shrink-0">
                            <AvatarImage src={member?.avatar || "/images/default.png"} />
                            <AvatarFallback className="text-xs">
                              {participant.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-blue-900 truncate">{participant.name}</span>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{participant.meetingRole}</span>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{getClassValue(participant.meetingClass as any)}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleUpdateParticipant(participant)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setMeetingForm(prev => ({
                                ...prev,
                                participants: prev.participants.filter(p => p.memberId !== participant.memberId)
                              }))
                            }}
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                  {meetingForm.participants.length === 0 && (
                    <p className="text-sm text-gray-500">Không có thành viên đã chọn</p>
                  )}
                </div>

                {/* Guest Manager */}
                <GuestManager
                  guests={meetingForm.temporaryGuests}
                  onAddGuest={() => setShowGuestModal(true)}
                  onRemoveGuest={handleRemoveGuest}
                  onUpdateGuest={handleUpdateGuestRole}
                />

                {/* Summary Stats */}
                <div className="grid grid-cols-5 gap-2 p-3 bg-gray-50 rounded">
                  <div className="text-center">
                    <div className="text-lg font-bold">{meetingForm.participants.length + meetingForm.temporaryGuests.length}</div>
                    <div className="text-xs text-gray-600">Tổng</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {[...meetingForm.participants, ...meetingForm.temporaryGuests].filter(p => p.meetingRole === 'Tank').length}
                    </div>
                    <div className="text-xs text-gray-600">Tank</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">
                      {[...meetingForm.participants, ...meetingForm.temporaryGuests].filter(p => p.meetingRole === 'DPS').length}
                    </div>
                    <div className="text-xs text-gray-600">DPS</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {[...meetingForm.participants, ...meetingForm.temporaryGuests].filter(p => p.meetingRole === 'Buff').length}
                    </div>
                    <div className="text-xs text-gray-600">Buff</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">
                      {[...meetingForm.participants, ...meetingForm.temporaryGuests].filter(p => p.meetingRole === 'Boss').length}
                    </div>
                    <div className="text-xs text-gray-600">Lão Bản</div>
                  </div>
                </div>

                <Button onClick={handleCreateMeeting} className="w-full">
                  Tạo lịch bí cảnh
                </Button>
              </CardContent>
            </Card>

            {/* Meeting Requests List */}
            <Card>
              <CardHeader>
                <CardTitle>Lịch bí cảnh</CardTitle>
              </CardHeader>
              <CardContent>
                {meetingLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Đang tải lịch bí cảnh...</p>
                  </div>
                ) : meetingError ? (
                  <div className="text-center py-8">
                    <p className="text-red-600 mb-2">Lỗi khi tải lịch bí cảnh</p>
                    <p className="text-sm text-gray-600 mb-4">{meetingError}</p>
                    <Button onClick={fetchMeetingRequests} variant="outline">
                      Thử lại
                    </Button>
                  </div>
                ) : meetingRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Không tìm thấy lịch bí cảnh</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {meetingRequests.map((meeting) => (
                      <div key={meeting._id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{meeting.title}</h3>
                            <p className="text-gray-600 text-sm">{meeting.description}</p>
                            <p className="text-gray-500 text-sm">
                              {meeting.date} at {meeting.time}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {meeting.status === 'draft' && (
                              <Button
                                size="sm"
                                onClick={() => handleConfirmMeeting(meeting._id)}
                              >
                                Xác nhận
                              </Button>
                            )}
                            {meeting.status === 'draft' && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleCancelMeeting(meeting._id)}
                              >
                                Hủy
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCopyFromMeeting(meeting)}
                            >
                              Sao chép thành viên
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            meeting.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                            meeting.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            meeting.status === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                          </span>
                          <span className="text-sm text-gray-600">
                            {meeting.participants.length + meeting.temporaryGuests.length} thành viên
                          </span>
                        </div>

                        {/* Participants */}
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Thành viên:</h4>
                          <div className="flex flex-wrap gap-1">
                            {meeting.participants.map((participant) => (
                              <span
                                key={participant.memberId}
                                className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                                title={`${participant.meetingRole} • ${participant.meetingClass}`}
                              >
                                {participant.name} - {participant.meetingRole} - {getClassValue(participant.meetingClass as any)}
                              </span>
                            ))}
                            {meeting.temporaryGuests.map((guest) => (
                              <span
                                key={guest.id}
                                className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs"
                                title={`${guest.meetingRole} • ${guest.meetingClass} (Guest)`}
                              >
                                {guest.name} - {guest.meetingRole} - {getClassValue(guest.meetingClass as any)} (G)
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Member Role Modal */}
      <MemberRoleModal
        isOpen={showMemberRoleModal}
        onClose={() => setShowMemberRoleModal(false)}
        onSave={handleSaveParticipantRole}
        initialRole={editingParticipantId ? 
          meetingForm.participants.find(p => p.memberId === editingParticipantId)?.meetingRole || '' : ''}
        initialClass={editingParticipantId ? 
          meetingForm.participants.find(p => p.memberId === editingParticipantId)?.meetingClass || '' : ''}
      />

      {/* Member Form Modal */}
      <MemberFormModal
        onSave={(memberData) => {
          if (editingMember) {
            handleUpdateMember(memberData)
          } else {
            handleAddMember(memberData)
          }
          setEditingMember(null)
        }}
        editingMember={editingMember}
        isOpen={showMemberModal}
        onClose={() => setShowMemberModal(false)}
      />

      {/* Guest Form Modal */}
      <GuestFormModal
        isOpen={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        onSave={handleAddGuest}
        editingGuest={editingGuest}
      />

      {/* Guest Role Modal */}
      <MemberRoleModal
        isOpen={showGuestRoleModal}
        onClose={() => {
          setShowGuestRoleModal(false)
          setEditingGuestId(null)
          setEditingGuest(null)
        }}
        onSave={handleSaveGuestRole}
        initialRole={editingGuest?.meetingRole || ''}
        initialClass={editingGuest?.meetingClass || ''}
        title="Đặt vai trò và lớp cho khách mời"
      />
    </div>
  )
}

export default function AdminPage() {
  return (
    <AuthGuard>
      <AdminPageContent />
    </AuthGuard>
  )
} 