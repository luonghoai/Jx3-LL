'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Edit, X, GripVertical, Plus } from 'lucide-react'
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
import { getClassValue, getRoleDisplayValue, getClassRoleIcon } from '@/lib/constants'

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

interface TeamMember {
  _id: string
  name: string
  discordUid?: string
  roles: string[]
  classes: string[]
  avatar?: string
  isActive: boolean
}

interface ParticipantGridProps {
  participants: MeetingParticipant[]
  guests: TemporaryGuest[]
  teamMembers: TeamMember[]
  onUpdateParticipant: (participant: MeetingParticipant) => void
  onRemoveParticipant: (memberId: string) => void
  onUpdateGuest: (guestId: string, role: string, classValue: string) => void
  onRemoveGuest: (guestId: string) => void
  onUpdatePositions?: (participants: MeetingParticipant[], guests: TemporaryGuest[]) => void
  onAddGuest?: () => void
}

interface SortableParticipantCardProps {
  participant: {
    id: string
    name: string
    discordUid?: string
    avatar?: string
    meetingRole: string
    meetingClass: string
    type: 'member' | 'guest'
  }
  onUpdate: () => void
  onRemove: () => void
}

function SortableParticipantCard({ participant, onUpdate, onRemove }: SortableParticipantCardProps) {
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
      duration: 0,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  }

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

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes}
      {...listeners}
      className={`participant-card relative cursor-pointer ${isDragging ? 'dragging' : ''}`}
      onClick={(e) => {
        // Only trigger edit if not clicking on the X button
        if (!(e.target as HTMLElement).closest('button')) {
          onUpdate()
        }
      }}
    >
      {/* X button - Top right */}
      <Button
        size="icon"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        className="absolute top-1 right-1 h-5 w-5 p-0 text-red-600 hover:text-red-700 bg-white/80 hover:bg-white z-10"
      >
        <X className="h-3 w-3" />
      </Button>

      <div className="flex items-center w-full h-full">
        {/* Avatar with class icon - Left side */}
        <div className="relative flex-shrink-0 mr-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={participant.avatar || "/images/default.png"} />
            <AvatarFallback className="text-sm">
              {participant.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          {/* Meeting class icon at bottom right */}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center">
            <img 
              src={getClassRoleIcon(participant.meetingClass as any, participant.meetingRole as any)}
              alt={participant.meetingClass}
              className="w-4 h-4 object-contain"
              title={getClassValue(participant.meetingClass as any)}
            />
          </div>
        </div>

        {/* Vertical separator line */}
        <div className="w-px h-10 bg-gray-300 mx-3 flex-shrink-0"></div>

        {/* Text information - Right side */}
        <div className="flex-1 min-w-0">
          {/* Name and Guest indicator */}
          <div className="flex items-center gap-2 min-w-0">
            <h4 className="text-base font-semibold text-gray-800 truncate flex-1 min-w-0">
              {participant.name}
            </h4> 
            {participant.type === 'guest' && (
              <span className="px-0.5 py-0.5 border border-orange-500 text-orange-500 rounded-full text-[10px] bg-transparent flex-shrink-0 whitespace-nowrap">
                Guest
              </span>
            )}    
          </div>

          {/* Role and Class */}
          <div className="mb-1">
            <div className={`text-sm font-bold ${getRoleColor(participant.meetingRole)}`}>
              {getRoleDisplayValue(participant.meetingRole as any)}
            </div>
            <div className="text-sm text-gray-600">
              {getClassValue(participant.meetingClass as any)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ParticipantGrid({
  participants,
  guests,
  teamMembers,
  onUpdateParticipant,
  onRemoveParticipant,
  onUpdateGuest,
  onRemoveGuest,
  onUpdatePositions,
  onAddGuest
}: ParticipantGridProps) {
  const [isDraggingActive, setIsDraggingActive] = useState(false)

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

  // Combine participants and guests for display
  const allParticipants = [
    ...participants.map(participant => {
      const member = teamMembers.find(m => m._id === participant.memberId)
      return {
        id: participant.memberId,
        name: participant.name,
        discordUid: participant.discordUid,
        avatar: member?.avatar,
        meetingRole: participant.meetingRole,
        meetingClass: participant.meetingClass,
        type: 'member' as const,
        position: participant.position || 0
      }
    }),
    ...guests.map(guest => ({
      id: guest.id,
      name: guest.name,
      discordUid: guest.discordUid,
      avatar: guest.avatar,
      meetingRole: guest.meetingRole,
      meetingClass: guest.meetingClass,
      type: 'guest' as const,
      position: guest.position || 0
    }))
  ].sort((a, b) => (a.position || 0) - (b.position || 0))

  // Create 5x5 grid (25 slots)
  const gridSlots = Array.from({ length: 25 }, (_, index) => {
    const participant = allParticipants[index]
    return participant || null
  })

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    setIsDraggingActive(false)
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = allParticipants.findIndex(p => p.id === active.id)
      const newIndex = allParticipants.findIndex(p => p.id === over?.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        // Create new order by swapping the two items
        const newOrder = [...allParticipants]
        const temp = newOrder[oldIndex]
        newOrder[oldIndex] = newOrder[newIndex]
        newOrder[newIndex] = temp
        
        // Update positions in the backend
        updateParticipantPositions(newOrder)
      }
    }
  }

  // Handle drag start
  const handleDragStart = () => {
    setIsDraggingActive(true)
  }

  // Update participant positions
  const updateParticipantPositions = (newOrder: typeof allParticipants) => {
    // Assign new positions based on the new order
    const updatedParticipants = participants.map(participant => {
      const newPosition = newOrder.findIndex(p => p.id === participant.memberId)
      return {
        ...participant,
        position: newPosition >= 0 ? newPosition : participant.position || 0
      }
    })

    const updatedGuests = guests.map(guest => {
      const newPosition = newOrder.findIndex(p => p.id === guest.id)
      return {
        ...guest,
        position: newPosition >= 0 ? newPosition : guest.position || 0
      }
    })

    // Sort both arrays by their new positions to ensure consistency
    updatedParticipants.sort((a, b) => (a.position || 0) - (b.position || 0))
    updatedGuests.sort((a, b) => (a.position || 0) - (b.position || 0))

    // Call the callback to update positions in parent component
    if (onUpdatePositions) {
      onUpdatePositions(updatedParticipants, updatedGuests)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Thành viên đã chọn ({allParticipants.length}/25)
        </h3>
        {isDraggingActive && (
          <span className="text-sm text-blue-600">🔄 Đang sắp xếp...</span>
        )}
      </div>
      
      {allParticipants.length > 0 && (
        <div className="text-sm text-gray-600 mb-4 text-center">
          💡 Kéo và thả để sắp xếp lại vị trí các thành viên
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={allParticipants.map(p => p.id)}
          strategy={rectSortingStrategy}
        >
          <div className="participant-grid">
            {gridSlots.map((participant, index) => (
              <div key={index}>
                {participant ? (
                  <SortableParticipantCard
                    participant={participant}
                    onUpdate={() => {
                      if (participant.type === 'member') {
                        const memberParticipant = participants.find(p => p.memberId === participant.id)
                        if (memberParticipant) {
                          onUpdateParticipant(memberParticipant)
                        }
                      } else {
                        onUpdateGuest(participant.id, participant.meetingRole, participant.meetingClass)
                      }
                    }}
                    onRemove={() => {
                      if (participant.type === 'member') {
                        onRemoveParticipant(participant.id)
                      } else {
                        onRemoveGuest(participant.id)
                      }
                    }}
                  />
                ) : (
                  <div className="empty-slot">
                    {onAddGuest ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onAddGuest}
                        className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Plus className="h-5 w-5" />
                        <span className="text-sm">Thêm khách</span>
                      </Button>
                    ) : (
                      <span>Trống</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {allParticipants.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Không có thành viên đã chọn</p>
        </div>
      )}
    </div>
  )
} 