'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Users, Settings, Search, Calendar, Clock, MapPin } from 'lucide-react'
import { getClassIcon, getClassValue } from '@/lib/constants'

interface TeamMember {
  _id: string
  name: string
  discordUid?: string
  roles: string[]
  classes: string[]
  avatar?: string
  isActive: boolean
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

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [lastMeeting, setLastMeeting] = useState<MeetingRequest | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch the last meeting request and team members
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch team members
        const membersResponse = await fetch('/api/team-members')
        if (!membersResponse.ok) {
          throw new Error('Failed to fetch team members')
        }
        const membersData = await membersResponse.json()
        setTeamMembers(membersData)

        // Fetch meeting requests
        const meetingsResponse = await fetch('/api/meeting-requests')
        if (!meetingsResponse.ok) {
          throw new Error('Failed to fetch meeting requests')
        }
        const meetingsData = await meetingsResponse.json()
        
        // Get the most recent confirmed meeting
        const confirmedMeetings = meetingsData
          .filter((meeting: MeetingRequest) => meeting.status === 'confirmed' && meeting.isActive)
          .sort((a: MeetingRequest, b: MeetingRequest) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        
        if (confirmedMeetings.length > 0) {
          setLastMeeting(confirmedMeetings[0])
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Combine team members and guests for display
  const allParticipants = useMemo(() => {
    if (!lastMeeting) return []

    const participants = lastMeeting.participants.map(participant => {
      const member = teamMembers.find(m => m._id === participant.memberId)
      return {
        id: participant.memberId,
        name: participant.name,
        discordUid: participant.discordUid,
        avatar: member?.avatar,
        meetingRole: participant.meetingRole,
        meetingClass: participant.meetingClass,
        allClasses: member?.classes || [participant.meetingClass],
        type: 'member' as const
      }
    })

    const guests = lastMeeting.temporaryGuests.map(guest => ({
      id: guest.id,
      name: guest.name,
      discordUid: guest.discordUid,
      avatar: guest.avatar,
      meetingRole: guest.meetingRole,
      meetingClass: guest.meetingClass,
      allClasses: guest.classes || [guest.meetingClass],
      type: 'guest' as const
    }))

    return [...participants, ...guests]
  }, [lastMeeting, teamMembers])

  // Filter participants based on search term
  const filteredParticipants = useMemo(() => {
    if (!searchTerm.trim()) return allParticipants
    
    const searchLower = searchTerm.toLowerCase()
    
    return allParticipants.filter(participant => {
      const nameMatch = participant.name.toLowerCase().includes(searchLower)
      const discordMatch = participant.discordUid?.toLowerCase().includes(searchLower) || false
      const roleMatch = participant.meetingRole.toLowerCase().includes(searchLower)
      const classCodeMatch = participant.meetingClass.toLowerCase().includes(searchLower)
      const classValueMatch = getClassValue(participant.meetingClass as any).toLowerCase().includes(searchLower)
      
      return nameMatch || discordMatch || roleMatch || classCodeMatch || classValueMatch
    })
  }, [allParticipants, searchTerm])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={() => window.location.reload()}>
            Thử lại
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Banner - Full Width */}
      <div className="w-full mb-8">
        <div className="relative overflow-hidden">
          <img 
            src="/images/ll.png" 
            alt="League Legend Banner" 
            className="w-full h-auto max-h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent"></div>
          
          {/* Content Overlay */}
          <div className="absolute inset-0 flex flex-col justify-center items-center p-6">
            {/* Meeting Info - Centered */}
            <div className="text-white text-center">
              {/* Meeting Information */}
              {lastMeeting ? (
                <div>
                  <div className="text-4xl font-bold mb-6 drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                    {lastMeeting.title} - {lastMeeting.description}
                  </div>
                  <div className="flex flex-wrap justify-center gap-4 text-lg">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-white bg-opacity-25 text-white rounded-full shadow-lg border border-white/30 backdrop-blur-sm">
                      <Calendar className="h-5 w-5" />
                      {new Date(lastMeeting.date).toLocaleDateString()}
                    </span>
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-white bg-opacity-25 text-white rounded-full shadow-lg border border-white/30 backdrop-blur-sm">
                      <Clock className="h-5 w-5" />
                      {lastMeeting.time}
                    </span>
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-white bg-opacity-25 text-white rounded-full capitalize shadow-lg border border-white/30 backdrop-blur-sm">
                      <MapPin className="h-5 w-5" />
                      {lastMeeting.status}
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-4xl font-bold drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                    Không có lịch bí cảnh
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-8xl">
        {/* Floating Admin Access Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <Link href="/login">
            <Button variant="outline" className="shadow-lg">
              <Settings className="h-4 w-4 mr-2" />
              Admin Access
            </Button>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, Discord UID, role, or class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Participants Grid */}
        {lastMeeting && (
          <div className="flex flex-wrap justify-center max-w-full mx-auto px-4" style={{ margin: '0 -15px' }}>
            {filteredParticipants.map((participant) => (
              <div key={participant.id} className="card" style={{ margin: '0 5px 10px 5px' }}>
                <div 
                  className="card-photo"
                  style={{
                    backgroundImage: `url(${participant.avatar || "/images/default.png"})`
                  }}
                ></div>
                <div className="card-title">
                  <div className="flex items-center justify-center gap-2">
                    {participant.name}
                    {participant.type === 'guest' && (
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs">
                        Guest
                      </span>
                    )}
                  </div>
                  <span>{participant.meetingRole} - {getClassValue(participant.meetingClass as any)}</span>
                </div>
                <div className="card-socials">
                  {participant.allClasses.slice(0, 3).map((classCode, index) => (
                    <button key={index} className="card-socials-btn" title={classCode}>
                      <img 
                        src={getClassIcon(classCode as any)} 
                        alt={classCode}
                        className="w-5 h-5"
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No results message */}
        {lastMeeting && filteredParticipants.length === 0 && searchTerm && (
          <div className="text-center py-8">
            <p className="text-gray-600">Không tìm thấy thành viên phù hợp với "{searchTerm}"</p>
          </div>
        )}

        {/* No meeting message */}
        {!lastMeeting && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Không có lịch bí cảnh</h3>
            <p className="text-gray-500">Không có lịch bí cảnh để hiển thị.</p>
          </div>
        )}

        {/* Summary Stats */}
        {lastMeeting && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-5 gap-6 max-w-6xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {filteredParticipants.length}
                  </div>
                  <div className="text-sm text-gray-600">Tổng thành viên</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {filteredParticipants.filter(p => p.meetingRole === 'Tank').length}
                  </div>
                  <div className="text-sm text-gray-600">Tank</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {filteredParticipants.filter(p => p.meetingRole === 'DPS').length}
                  </div>
                  <div className="text-sm text-gray-600">DPS</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {filteredParticipants.filter(p => p.meetingRole === 'Buff').length}
                  </div>
                  <div className="text-sm text-gray-600">Buff</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {filteredParticipants.filter(p => p.meetingRole === 'Boss').length}
                  </div>
                  <div className="text-sm text-gray-600">Lão Bản</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
} 