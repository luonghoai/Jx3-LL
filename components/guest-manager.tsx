'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getClassValue } from '@/lib/constants'
import { Plus, X, Edit } from 'lucide-react'

interface TemporaryGuest {
  id: string
  name: string
  discordUid?: string
  roles: string[]
  classes: string[]
  meetingRole: string
  meetingClass: string
}

interface GuestManagerProps {
  guests: TemporaryGuest[]
  onAddGuest: () => void
  onRemoveGuest: (guestId: string) => void
  onUpdateGuest?: (guestId: string, role: string, classValue: string) => void
}

export default function GuestManager({ guests, onAddGuest, onRemoveGuest, onUpdateGuest }: GuestManagerProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">Temporary Guests ({guests.length})</h3>
        <Button
          onClick={onAddGuest}
          size="sm"
          variant="outline"
          className="text-orange-600 border-orange-300 hover:bg-orange-50"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Guest
        </Button>
      </div>

      {/* Guest List */}
      <div className="flex flex-wrap gap-2 mb-4">
        {guests.map((guest) => (
          <div key={guest.id} className="flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-200 rounded-full text-xs">
            <span className="font-medium text-orange-800 truncate">{guest.name}</span>
            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">{guest.meetingRole}</span>
            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">{getClassValue(guest.meetingClass as any)}</span>
            {onUpdateGuest && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onUpdateGuest(guest.id, guest.meetingRole, guest.meetingClass)}
                className="h-6 w-6 p-0"
              >
                <Edit className="h-3 w-3" />
              </Button>
            )}
            <Button
              onClick={() => onRemoveGuest(guest.id)}
              size="icon"
              variant="ghost"
              className="h-6 w-6 p-0 text-orange-600 hover:text-orange-800"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        {guests.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            No temporary guests added
          </div>
        )}
      </div>
    </div>
  )
} 