'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Users, Settings, Search, Calendar, Clock, MapPin } from 'lucide-react'
import { getClassIcon, getClassValue } from '@/lib/constants'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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

interface CountdownTime {
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface SortableParticipantCardProps {
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
}

function SortableParticipantCard({ participant, getRoleColor }: SortableParticipantCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: participant.id,
    transition: {
      duration: 0, // Disable transition during drag
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition, // No transition during drag
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes}
      {...listeners}
      data-dragging={isDragging}
      className={`flex items-center p-3 w-full h-24 bg-white rounded-md shadow-lg cursor-move hover:shadow-xl transition-shadow sortable-card ${isDragging ? 'dragging' : ''}`}
    >
      <section className="flex justify-center items-center w-12 h-12 rounded-full shadow-md bg-gradient-to-r from-[#F9C97C] to-[#A2E9C1] hover:from-[#C9A9E9] hover:to-[#7EE7FC] hover:scale-110 duration-300 overflow-hidden flex-shrink-0">
        <img 
          src={participant.avatar || "/images/default.png"}
          alt={participant.name}
          className="w-10 h-10 rounded-full object-cover"
        />
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
          <h3 className="text-sm font-bold truncate">
            <span className={getRoleColor(participant.meetingRole)}>{participant.meetingRole}</span>
            <span className="text-gray-600"> - {getClassValue(participant.meetingClass as any)}</span>
          </h3>
        </div>
        <div className="flex gap-1 pt-1 pl-2">
          {participant.allClasses.slice(0, 3).map((classCode, index) => (
            <img 
              key={index}
              src={getClassIcon(classCode as any)} 
              alt={classCode}
              className="w-6 h-6 hover:scale-125 duration-200 hover:cursor-pointer flex-shrink-0"
              title={classCode}
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
  const [isDraggingEnabled, setIsDraggingEnabled] = useState(false)
  const [isUpdatingPositions, setIsUpdatingPositions] = useState(false)

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // State to track if dragging is active
  const [isDraggingActive, setIsDraggingActive] = useState(false)

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

  // Check if drag and drop should be enabled (5x5 grid or less)
  useEffect(() => {
    if (allParticipants.length <= 25) {
      setIsDraggingEnabled(true)
    } else {
      setIsDraggingEnabled(false)
    }
  }, [allParticipants.length])

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

  // Function to get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Tank':
        return 'text-green-400'
      case 'DPS':
        return 'text-purple-400'
      case 'Buff':
        return 'text-yellow-400'
      case 'Boss':
        return 'text-red-400'
      default:
        return 'text-gray-600'
    }
  }

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    setIsDraggingActive(false)
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = filteredParticipants.findIndex(p => p.id === active.id)
      const newIndex = filteredParticipants.findIndex(p => p.id === over?.id)

      if (oldIndex !== -1 && newIndex !== -1) {

        // Create new order by swapping the two items
        const newOrder = [...filteredParticipants]
        const temp = newOrder[oldIndex]
        newOrder[oldIndex] = newOrder[newIndex]
        newOrder[newIndex] = temp
        
        
        // Update positions in the backend
        await updateParticipantPositions(newOrder)
      }
    }
  }

  // Handle drag start - prevent other cards from moving
  const handleDragStart = (event: any) => {
    setIsDraggingActive(true)
  }



  // Update participant positions in the backend
  const updateParticipantPositions = async (newOrder: typeof filteredParticipants) => {
    if (!lastMeeting) return

    try {
      setIsUpdatingPositions(true)

      // Assign new positions based on the new order
      const updatedParticipants = lastMeeting.participants.map(participant => {
        const newPosition = newOrder.findIndex(p => p.id === participant.memberId)
        return {
          ...participant,
          position: newPosition >= 0 ? newPosition : participant.position || 0
        }
      })

      const updatedGuests = lastMeeting.temporaryGuests.map(guest => {
        const newPosition = newOrder.findIndex(p => p.id === guest.id)
        return {
          ...guest,
          position: newPosition >= 0 ? newPosition : guest.position || 0
        }
      })

      // Sort both arrays by their new positions to ensure consistency
      updatedParticipants.sort((a, b) => (a.position || 0) - (b.position || 0))
      updatedGuests.sort((a, b) => (a.position || 0) - (b.position || 0))

      const response = await fetch(`/api/meeting-requests/${lastMeeting._id}/positions`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participants: updatedParticipants,
          temporaryGuests: updatedGuests
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update positions')
      }

      const updatedMeeting = await response.json()
      setLastMeeting(updatedMeeting)
    } catch (error) {
      console.error('Error updating positions:', error)
      // You might want to show a toast notification here
    } finally {
      setIsUpdatingPositions(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-black flex items-center justify-center">
        <div className="flex-col gap-4 w-full flex items-center justify-center">
          <div className="w-28 h-28 border-8 text-blue-400 text-4xl animate-spin border-gray-300 flex items-center justify-center border-t-blue-400 rounded-full">
            <img 
              src="/images/daithiet.webp" 
              alt="Loading" 
              className="w-16 h-16 animate-ping"
            />
          </div>
          <p className="text-amber-100">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error: {error}</p>
          <Button onClick={() => window.location.reload()} className="bg-amber-600 hover:bg-amber-700">
            Thử lại
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Full-screen background slideshow */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-pulse"
          style={{
            backgroundImage: `url('/images/ll.png')`,
            animation: 'pulse 4s ease-in-out infinite'
          }}
        />
        {/* Dark gradient overlay (tan to black) */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/80 via-amber-800/70 to-black/90"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header Section */}
        <div className="flex-1 flex flex-col justify-center items-center px-4 py-12">
          {/* Headline */}
          <div className="text-center mb-12">
            {lastMeeting ? (
              <div className="space-y-6">
                <h1 className="neon-text text-6xl md:text-8xl mb-2">
                  Lục Long
                </h1>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-2xl" 
                    style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.8)' }}>
                  {lastMeeting.title}
                </h2>
                <p className="text-2xl md:text-3xl text-amber-200 font-medium drop-shadow-lg">
                  {lastMeeting.description}
                </p>
              </div>
            ) : (
              <div>
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-2xl" 
                    style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.8)' }}>
                  Không có lịch bí cảnh
                </h1>
              </div>
            )}
          </div>

          {/* Countdown Timer */}
          {lastMeeting && (
            <div className="mb-12">
              <div className="grid grid-cols-4 gap-4 md:gap-8">
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
              </div>
              
              {/* Meeting details */}
              <div className="mt-8 flex flex-wrap justify-center gap-4">
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
            </div>
          )}

          {/* Search Bar */}
          <div className="w-full max-w-2xl mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-200 h-5 w-5 z-10" />
              <Input
                type="text"
                placeholder="Tìm kiếm theo tên, Discord UID, vai trò, hoặc môn phái..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 bg-white/10 backdrop-blur-sm border-white/20 text-white focus:bg-white/20 focus:border-amber-400 [&::placeholder]:text-white [&::placeholder]:opacity-100"
                style={{
                  '--tw-placeholder-opacity': '1'
                } as React.CSSProperties}
              />
            </div>
          </div>
        </div>

        {/* Body Section */}
        <div className="px-4 pb-8">
          {/* Floating Admin Access Button */}
          <div className="fixed bottom-6 right-6 z-50">
            <Link href="/login">
              <Button variant="outline" className="shadow-lg bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                <Settings className="h-4 w-4 mr-2" />
                Admin Access
              </Button>
            </Link>
          </div>

          {/* Participants Grid */}
          {lastMeeting && (
            <div className="max-w-7xl mx-auto">
              {isDraggingEnabled ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={filteredParticipants.map(p => p.id)}
                    strategy={rectSortingStrategy}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {filteredParticipants.map((participant) => (
                        <SortableParticipantCard
                          key={participant.id}
                          participant={participant}
                          getRoleColor={getRoleColor}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredParticipants.map((participant) => (
                    <div key={participant.id} className="flex items-center p-3 w-full h-24 bg-white rounded-md shadow-lg">
                      <section className="flex justify-center items-center w-12 h-12 rounded-full shadow-md bg-gradient-to-r from-[#F9C97C] to-[#A2E9C1] hover:from-[#C9A9E9] hover:to-[#7EE7FC] hover:cursor-pointer hover:scale-110 duration-300 overflow-hidden flex-shrink-0">
                        <img 
                          src={participant.avatar || "/images/default.png"}
                          alt={participant.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
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
                          <h3 className="text-sm font-bold truncate">
                            <span className={getRoleColor(participant.meetingRole)}>{participant.meetingRole}</span>
                            <span className="text-gray-600"> - {getClassValue(participant.meetingClass as any)}</span>
                          </h3>
                        </div>
                        <div className="flex gap-1 pt-1 pl-2">
                          {participant.allClasses.slice(0, 3).map((classCode, index) => (
                            <img 
                              key={index}
                              src={getClassIcon(classCode as any)} 
                              alt={classCode}
                              className="w-6 h-6 hover:scale-125 duration-200 hover:cursor-pointer flex-shrink-0"
                              title={classCode}
                            />
                          ))}
                        </div>
                      </section>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Drag and drop status indicator */}
              {isDraggingEnabled && (
                <div className="mt-4 text-center">
                  <p className="text-amber-200 text-sm">
                    💡 Kéo và thả thẻ để hoán đổi vị trí các thành viên
                    {isUpdatingPositions && <span className="ml-2">🔄 Đang cập nhật...</span>}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* No results message */}
          {lastMeeting && filteredParticipants.length === 0 && searchTerm && (
            <div className="text-center py-8">
              <p className="text-amber-200">Không tìm thấy thành viên phù hợp với "{searchTerm}"</p>
            </div>
          )}

          {/* No meeting message */}
          {!lastMeeting && (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-amber-200 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-amber-200 mb-2">Không có lịch bí cảnh</h3>
              <p className="text-amber-100">Không có lịch bí cảnh để hiển thị.</p>
            </div>
          )}

          {/* Summary Stats */}
          {lastMeeting && (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-5 gap-6 max-w-6xl mx-auto">
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
                    <div className="text-sm text-white">Tank</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {filteredParticipants.filter(p => p.meetingRole === 'DPS').length}
                    </div>
                    <div className="text-sm text-white">DPS</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">
                      {filteredParticipants.filter(p => p.meetingRole === 'Buff').length}
                    </div>
                    <div className="text-sm text-white">Buff</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">
                      {filteredParticipants.filter(p => p.meetingRole === 'Boss').length}
                    </div>
                    <div className="text-sm text-white">Lão Bản</div>
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