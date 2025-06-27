'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { X, RefreshCw, User, Hash } from 'lucide-react'
import { DEFAULTS, ERROR_MESSAGES, ROLE_OPTIONS, CLASS_OPTIONS, getAvailableRolesForClass, getAvailableClassesForRole, getClassValue, getClassCode } from '../lib/constants'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Guest {
  id: string
  name: string
  discordUid?: string
  roles: string[]
  classes: string[]
}

interface GuestFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (guestData: { name: string; discordUid?: string; meetingRole: string; meetingClass: string; roles: string[]; classes: string[] }) => void
  editingGuest?: {
    id: string
    name: string
    discordUid?: string
    roles: string[]
    classes: string[]
    meetingRole: string
    meetingClass: string
  } | null
}

export default function GuestFormModal({
  isOpen,
  onClose,
  onSave,
  editingGuest
}: GuestFormModalProps) {
  const [name, setName] = useState(editingGuest?.name || '')
  const [discordUid, setDiscordUid] = useState(editingGuest?.discordUid || '')
  const [meetingRole, setMeetingRole] = useState(editingGuest?.meetingRole || '')
  const [meetingClass, setMeetingClass] = useState(editingGuest?.meetingClass || '')
  const [roles, setRoles] = useState<string[]>(editingGuest?.roles || [])
  const [classes, setClasses] = useState<string[]>(editingGuest?.classes || [])
  const [isLoading, setIsLoading] = useState(false)
  const [availableRoles, setAvailableRoles] = useState<string[]>(ROLE_OPTIONS as unknown as string[])
  const [availableClasses, setAvailableClasses] = useState<string[]>(CLASS_OPTIONS.map(cls => cls.code))

  // Update available options based on selection
  useEffect(() => {
    if (meetingClass) {
      const classCode = meetingClass as any
      const rolesForClass = getAvailableRolesForClass(classCode)
      setAvailableRoles(rolesForClass)
      if (meetingRole && !rolesForClass.includes(meetingRole as any)) {
        setMeetingRole('')
      }
    } else {
      setAvailableRoles(ROLE_OPTIONS as unknown as string[])
    }

    if (meetingRole) {
      const classesForRole = getAvailableClassesForRole(meetingRole as any)
      setAvailableClasses(classesForRole)
      if (meetingClass && !classesForRole.includes(meetingClass as any)) {
        setMeetingClass('')
      }
    } else {
      setAvailableClasses(CLASS_OPTIONS.map(cls => cls.code))
    }
  }, [meetingRole, meetingClass])

  const handleSave = () => {
    if (!name.trim()) {
      alert('Name is required')
      return
    }
    if (!meetingRole) {
      alert('Role is required')
      return
    }
    if (!meetingClass) {
      alert('Class is required')
      return
    }
    onSave({
      name: name.trim(),
      discordUid: discordUid.trim() || undefined,
      meetingRole,
      meetingClass,
      roles: [meetingRole],
      classes: [meetingClass]
    })
    handleClose()
  }

  const handleClose = () => {
    setName('')
    setDiscordUid('')
    setMeetingRole('')
    setMeetingClass('')
    setRoles([])
    setClasses([])
    onClose()
  }

  const handleDiscordSync = async () => {
    setIsLoading(true)
    try {
      // Mock Discord API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      // Mock Discord data
      const mockDiscordData = {
        name: 'Discord User',
        discordUid: 'discord_123456',
        meetingRole: 'DPS',
        meetingClass: 'TS',
        roles: ['DPS'],
        classes: ['TS']
      }
      setName(mockDiscordData.name)
      setDiscordUid(mockDiscordData.discordUid)
      setMeetingRole(mockDiscordData.meetingRole)
      setMeetingClass(mockDiscordData.meetingClass)
      setRoles(mockDiscordData.roles)
      setClasses(mockDiscordData.classes)
    } catch (error) {
      alert('Failed to sync with Discord')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>{editingGuest ? 'Edit Guest' : 'Add Temporary Guest'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Discord UID Section */}
          <div className="border border-blue-200 bg-blue-50 rounded p-4 mb-2 flex items-center gap-3">
            <Hash className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <label className="block text-sm font-semibold text-blue-800 mb-1">Discord UID</label>
              <div className="flex gap-2">
                <Input
                  value={discordUid}
                  onChange={(e) => setDiscordUid(e.target.value)}
                  placeholder="Discord UID (optional)"
                  className="flex-1"
                />
                <Button
                  onClick={handleDiscordSync}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                >
                  {isLoading ? 'Syncing...' : 'Sync'}
                </Button>
              </div>
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium mb-2">Name *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Guest name"
            />
          </div>

          {/* Role Field */}
          <div>
            <label className="block text-sm font-medium mb-2">Role *</label>
            <Select value={meetingRole} onValueChange={setMeetingRole}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Class Field */}
          <div>
            <label className="block text-sm font-medium mb-2">Class *</label>
            <Select value={meetingClass} onValueChange={setMeetingClass}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {availableClasses.map((classCode) => (
                  <SelectItem key={classCode} value={classCode}>
                    {getClassValue(classCode as any)} ({classCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              {editingGuest ? 'Update' : 'Add'} Guest
            </Button>
            <Button onClick={handleClose} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 