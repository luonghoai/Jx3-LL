'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Users, Settings, Search, Calendar, Clock, MapPin, Trophy } from 'lucide-react'
import { getClassRoleIcon, getClassIcon, getClassValue, getRoleDisplayValue } from '@/lib/constants'
import { matchesVietnameseSearch } from '@/lib/utils'


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
  position?: number
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
  position?: number
}

interface Hoster {
  memberId: string
  name: string
  discordUid?: string
  meetingRole: string
  meetingClass: string
  score: number
  selectedAt: string
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
  hoster?: Hoster
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface CountdownTime {
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface ParticipantCardProps {
  participant: {
    id: string
    name: string
    discordUid?: string
    avatar?: string
    meetingRole: string
    meetingClass: string
    allClasses: string[]
    type: 'member' | 'guest'
  }
  getRoleColor: (role: string) => string
  isHoster: boolean
}

function ParticipantCard({ participant, getRoleColor, isHoster }: ParticipantCardProps) {
  return (
    <div className={`flex items-center p-3 w-full h-24 rounded-md shadow-lg hover:shadow-xl transition-shadow ${
      isHoster && participant.type === 'member' ? 'hoster-card animate-hoster-pulse' : 'bg-white'
    }`}>
      <section className="relative flex justify-center items-center w-12 h-12 rounded-full shadow-md bg-gradient-to-r from-[#F9C97C] to-[#A2E9C1] hover:from-[#C9A9E9] hover:to-[#7EE7FC] hover:scale-110 duration-300 flex-shrink-0">
        <img 
          src={participant.avatar || "/images/default.png"}
          alt={participant.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        {/* Meeting class icon at bottom right */}
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center">
          <img 
            src={getClassRoleIcon(participant.meetingClass as any, participant.meetingRole as any)}
            alt={participant.meetingClass}
            className="w-4 h-4 object-contain"
            title={getClassValue(participant.meetingClass as any)}
          />
        </div>
      </section>

      <section className="block border-l border-gray-300 m-2 flex-1 min-w-0">
        <div className="pl-2">
          <h3 className="text-gray-600 font-semibold text-xs flex items-center gap-1 truncate">
            {participant.name}
            {participant.type === 'guest' && (
              <span className="px-1 py-0.5 border border-orange-500 text-orange-500 rounded-full text-xs bg-transparent flex-shrink-0">
                Guest
              </span>
            )}
          </h3>
          <h3 className="text-[10px] font-bold truncate">
            <span className={getRoleColor(participant.meetingRole)}>{getRoleDisplayValue(participant.meetingRole as any)}</span>
            <span className="text-gray-600"> - {getClassValue(participant.meetingClass as any)}</span>
          </h3>
        </div>
        <div className="flex gap-1 pt-1 pl-2">
          {participant.allClasses.slice(0, 3).map((classCode, index) => (
            <img 
              key={index}
              src={getClassIcon(classCode as any)}
              alt={getClassValue(classCode as any)}
              className="w-6 h-6 hover:scale-125 duration-200 hover:cursor-pointer flex-shrink-0"
              title={getClassValue(classCode as any)}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [lastMeeting, setLastMeeting] = useState<MeetingRequest | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<CountdownTime>({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  // Calculate countdown timer
  useEffect(() => {
    if (!lastMeeting) return

    const calculateCountdown = () => {
      const meetingDateTime = new Date(`${lastMeeting.date}T${lastMeeting.time}`)
      const now = new Date()
      const difference = meetingDateTime.getTime() - now.getTime()

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setCountdown({ days, hours, minutes, seconds })
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    calculateCountdown()
    const timer = setInterval(calculateCountdown, 1000)

    return () => clearInterval(timer)
  }, [lastMeeting])

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
        type: 'member' as const,
        position: participant.position || 0
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
      type: 'guest' as const,
      position: guest.position || 0
    }))

    // Sort by position if available, otherwise by original order
    const combined = [...participants, ...guests]
    return combined.sort((a, b) => (a.position || 0) - (b.position || 0))
  }, [lastMeeting, teamMembers])



  // Filter participants based on search term
  const filteredParticipants = useMemo(() => {
    if (!searchTerm.trim()) return allParticipants
    
    return allParticipants.filter(participant => {
      const nameMatch = matchesVietnameseSearch(participant.name, searchTerm)
      const discordMatch = participant.discordUid ? matchesVietnameseSearch(participant.discordUid, searchTerm) : false
      const roleMatch = matchesVietnameseSearch(participant.meetingRole, searchTerm)
      const roleValueMatch = matchesVietnameseSearch(getRoleDisplayValue(participant.meetingRole as any), searchTerm)
      const classCodeMatch = matchesVietnameseSearch(participant.meetingClass, searchTerm)
      const classValueMatch = matchesVietnameseSearch(getClassValue(participant.meetingClass as any), searchTerm)
      
      return nameMatch || discordMatch || roleMatch || roleValueMatch || classCodeMatch || classValueMatch
    })
  }, [allParticipants, searchTerm])

  // Function to get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Tank':
        return 'text-green-400'
      case 'DPS':
        return 'text-purple-400'
      case 'DPS1':
        return 'text-blue-400'
      case 'Buff':
        return 'text-yellow-400'
      case 'Boss':
        return 'text-red-400'
      default:
        return 'text-gray-600'
    }
  }





  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error: {error}</p>
          <Button onClick={() => window.location.reload()} className="bg-green-600 hover:bg-green-700">
            Thử lại
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Full-screen background video */}
      <div className="fixed inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="https://pic.pikbest.com/19/63/17/814888piC3Gw.mp4" type="video/mp4" />
          {/* Fallback background image if video fails to load */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-pulse"
            style={{
              backgroundImage: `url('/images/ll.png')`,
              animation: 'pulse 4s ease-in-out infinite'
            }}
          />
        </video>
        {/* Dark gradient overlay (light green to black) */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/60 via-green-800/50 to-black/80"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header Section */}
        <div className="flex-1 flex flex-col justify-center items-center px-4 pt-12">
          {/* Headline */}
          <div className="text-center mb-6">
            <h1 className="neon-text text-8xl md:text-8xl mb-2">
              Lục Long
            </h1>
            {loading ? (
              <div className="space-y-6">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-2xl animate-pulse" 
                    style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.8)' }}>
                  Đang tải...
                </h2>
                <p className="text-2xl md:text-3xl text-green-200 font-medium drop-shadow-lg animate-pulse">
                  Đang tải thông tin bí cảnh
                </p>
              </div>
            ) : lastMeeting ? (
              <div className="space-y-6">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-2xl" 
                    style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.8)' }}>
                  {lastMeeting.title}
                </h2>
                <p className="text-2xl md:text-3xl text-green-200 font-medium drop-shadow-lg">
                  {lastMeeting.description}
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-2xl" 
                    style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.8)' }}>
                  Không có lịch bí cảnh
                </h2>
              </div>
            )}
          </div>

          {/* Countdown Timer */}
          {!loading && lastMeeting && (
            <div className="mb-4">
              {/* <div className="grid grid-cols-4 gap-4 md:gap-8">
                <div className="text-center">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="text-3xl md:text-5xl font-bold text-white mb-2">
                      {countdown.days.toString().padStart(2, '0')}
                    </div>
                    <div className="text-sm md:text-base text-amber-200">Ngày</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="text-3xl md:text-5xl font-bold text-white mb-2">
                      {countdown.hours.toString().padStart(2, '0')}
                    </div>
                    <div className="text-sm md:text-base text-amber-200">Giờ</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="text-3xl md:text-5xl font-bold text-white mb-2">
                      {countdown.minutes.toString().padStart(2, '0')}
                    </div>
                    <div className="text-sm md:text-base text-amber-200">Phút</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="text-3xl md:text-5xl font-bold text-white mb-2">
                      {countdown.seconds.toString().padStart(2, '0')}
                    </div>
                    <div className="text-sm md:text-base text-amber-200">Giây</div>
                  </div>
                </div>
              </div> */}
              
              {/* Meeting details */}
              <div className="flex flex-wrap justify-center gap-4">
                <span className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-full border border-white/20">
                  <Calendar className="h-5 w-5" />
                  {lastMeeting.date && new Date(lastMeeting.date).toLocaleDateString()}
                </span>
                <span className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-full border border-white/20">
                  <Clock className="h-5 w-5" />
                  {lastMeeting.time}
                </span>
                <span className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-full capitalize border border-white/20">
                  <MapPin className="h-5 w-5" />
                  {lastMeeting.status}
                </span>
              </div>
              
              {/* Hoster Display */}
              {lastMeeting.hoster && (
                <div className="mt-4 p-4 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-lg border border-yellow-400/30">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                      <span className="text-yellow-900 font-bold text-sm">👑</span>
                    </div>
                    <div className="text-center">
                      <p className="text-yellow-300 font-semibold">Hoster</p>
                      <p className="text-white font-bold">{lastMeeting.hoster.name}</p>
                      <p className="text-green-200 text-sm">
                        {getRoleDisplayValue(lastMeeting.hoster.meetingRole as any)} - {getClassValue(lastMeeting.hoster.meetingClass as any)}
                      </p>
                      <p className="text-yellow-200 text-xs">Score: {lastMeeting.hoster.score}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Search Bar */}
          <div className="w-full max-w-2xl mb-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-green-200 h-5 w-5 z-10" />
              <Input
                type="text"
                placeholder="Tìm kiếm theo tên, vai trò, hoặc môn phái..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 bg-white/10 backdrop-blur-sm border-white/20 text-white focus:bg-white/20 focus:border-green-400 [&::placeholder]:text-white [&::placeholder]:opacity-100"
                style={{
                  '--tw-placeholder-opacity': '1'
                } as React.CSSProperties}
              />
            </div>
          </div>
        </div>

        {/* Body Section */}
        <div className="px-4 pb-8">
          {/* Floating Action Buttons */}
          <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
            <Link href="/leaderboard">
              <Button variant="outline" className="shadow-lg bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                <Trophy className="h-4 w-4 mr-2" />
                Bảng Xếp Hạng
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="shadow-lg bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                <Settings className="h-4 w-4 mr-2" />
                Admin Access
              </Button>
            </Link>
          </div>

          {/* Participants Grid */}
          {loading ? (
            <div className="max-w-7xl mx-auto">
              <div className="flex-col gap-4 w-full flex items-center justify-center py-12">
                <div className="w-16 h-16 border-4 text-green-400 text-2xl animate-spin border-gray-300 flex items-center justify-center border-t-green-400 rounded-full">
                  <img 
                    src="/images/daithiet.webp" 
                    alt="Loading" 
                    className="w-8 h-8 animate-ping"
                  />
                </div>
                <p className="text-green-200 text-sm">Đang tải danh sách thành viên...</p>
              </div>
            </div>
          ) : lastMeeting ? (
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredParticipants.map((participant) => (
                  <ParticipantCard
                    key={participant.id}
                    participant={participant}
                    getRoleColor={getRoleColor}
                    isHoster={lastMeeting?.hoster?.discordUid === participant.discordUid}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {/* No results message */}
          {!loading && lastMeeting && filteredParticipants.length === 0 && searchTerm && (
            <div className="text-center py-8">
              <p className="text-green-200">Không tìm thấy thành viên phù hợp với "{searchTerm}"</p>
            </div>
          )}

          {/* No meeting message */}
          {!loading && !lastMeeting && (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-green-200 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-200 mb-2">Không có lịch bí cảnh</h3>
              <p className="text-green-100">Không có lịch bí cảnh để hiển thị.</p>
            </div>
          )}

          {/* Summary Stats */}
          {!loading && lastMeeting && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-6 gap-6 max-w-6xl mx-auto">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {filteredParticipants.length}
                    </div>
                    <div className="text-sm text-white">Tổng thành viên</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {filteredParticipants.filter(p => p.meetingRole === 'Tank').length}
                    </div>
                    <div className="text-sm text-white">{getRoleDisplayValue('Tank')}</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {filteredParticipants.filter(p => p.meetingRole === 'DPS').length}
                    </div>
                    <div className="text-sm text-white">{getRoleDisplayValue('DPS')}</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {filteredParticipants.filter(p => p.meetingRole === 'DPS1').length}
                    </div>
                    <div className="text-sm text-white">{getRoleDisplayValue('DPS1')}</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">
                      {filteredParticipants.filter(p => p.meetingRole === 'Buff').length}
                    </div>
                    <div className="text-sm text-white">{getRoleDisplayValue('Buff')}</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">
                      {filteredParticipants.filter(p => p.meetingRole === 'Boss').length}
                    </div>
                    <div className="text-sm text-white">{getRoleDisplayValue('Boss')}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 