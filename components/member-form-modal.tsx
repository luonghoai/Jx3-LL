'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { X, RefreshCw, User, Hash } from 'lucide-react'
import FlexibleInput from './flexible-input'
import { ROLE_OPTIONS, CLASS_OPTIONS, getAvailableRolesForClass, getAvailableClassesForRole, getClassValue, getClassCode } from '@/lib/constants'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface TeamMember {
  _id: string
  name: string
  discordUid?: string
  roles: string[]
  classes: string[]
  avatar?: string
  isActive: boolean
}

interface MemberFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (memberData: { name: string; discordUid?: string; roles: string[]; classes: string[] }) => void
  editingMember?: {
    _id: string
    name: string
    discordUid?: string
    roles: string[]
    classes: string[]
  } | null
}

export default function MemberFormModal({
  isOpen,
  onClose,
  onSave,
  editingMember
}: MemberFormModalProps) {
  const [name, setName] = useState('')
  const [discordUid, setDiscordUid] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [roles, setRoles] = useState<string[]>([])
  const [classes, setClasses] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [availableRoles, setAvailableRoles] = useState<string[]>(ROLE_OPTIONS)
  const [availableClasses, setAvailableClasses] = useState<string[]>(CLASS_OPTIONS.map(cls => cls.code))

  // Load member data when editing
  useEffect(() => {
    if (editingMember) {
      setName(editingMember.name)
      setDiscordUid(editingMember.discordUid || '')
      setRoles(editingMember.roles)
      setClasses(editingMember.classes)
    } else {
      // Reset form when adding new member
      setName('')
      setDiscordUid('')
      setRoles([])
      setClasses([])
    }
    setSelectedRole('')
    setSelectedClass('')
  }, [editingMember])

  // Update available options based on selection
  useEffect(() => {
    if (selectedClass) {
      const classCode = selectedClass as any
      const rolesForClass = getAvailableRolesForClass(classCode)
      setAvailableRoles(rolesForClass)
      
      if (selectedRole && !rolesForClass.includes(selectedRole as any)) {
        setSelectedRole('')
      }
    } else {
      setAvailableRoles(ROLE_OPTIONS)
    }

    if (selectedRole) {
      const classesForRole = getAvailableClassesForRole(selectedRole as any)
      setAvailableClasses(classesForRole)
      
      if (selectedClass && !classesForRole.includes(selectedClass as any)) {
        setSelectedClass('')
      }
    } else {
      setAvailableClasses(CLASS_OPTIONS.map(cls => cls.code))
    }
  }, [selectedRole, selectedClass])

  // Handle role selection - add to roles array when selected
  const handleRoleChange = (role: string) => {
    if (role && !roles.includes(role)) {
      setRoles([...roles, role])
    }
    setSelectedRole('')
  }

  // Handle class selection - add to classes array when selected
  const handleClassChange = (classCode: string) => {
    if (classCode && !classes.includes(classCode)) {
      setClasses([...classes, classCode])
    }
    setSelectedClass('')
  }

  const handleRemoveRole = (roleToRemove: string) => {
    setRoles(roles.filter(role => role !== roleToRemove))
  }

  const handleRemoveClass = (classToRemove: string) => {
    setClasses(classes.filter(cls => cls !== classToRemove))
  }

  const handleSave = () => {
    if (!name.trim()) {
      alert('Name is required')
      return
    }
    if (roles.length === 0) {
      alert('At least one role is required')
      return
    }
    if (classes.length === 0) {
      alert('At least one class is required')
      return
    }

    onSave({
      name: name.trim(),
      discordUid: discordUid.trim() || undefined,
      roles,
      classes
    })
    handleClose()
  }

  const handleClose = () => {
    setName('')
    setDiscordUid('')
    setSelectedRole('')
    setSelectedClass('')
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
        roles: ['DPS'],
        classes: ['TS']
      }
      
      setName(mockDiscordData.name)
      setDiscordUid(mockDiscordData.discordUid)
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
          <CardTitle>{editingMember ? 'Edit Member' : 'Add Team Member'}</CardTitle>
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
              placeholder="Member name"
            />
          </div>

          {/* Roles Field */}
          <div>
            <label className="block text-sm font-medium mb-2">Roles *</label>
            <div className="mb-2">
              <Select value={selectedRole} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role to add" />
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
            <div className="flex flex-wrap gap-1">
              {roles.map((role) => (
                <span
                  key={role}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                >
                  {role}
                  <button
                    onClick={() => handleRemoveRole(role)}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Classes Field */}
          <div>
            <label className="block text-sm font-medium mb-2">Classes *</label>
            <div className="mb-2">
              <Select value={selectedClass} onValueChange={handleClassChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a class to add" />
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
            <div className="flex flex-wrap gap-1">
              {classes.map((classCode) => (
                <span
                  key={classCode}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs"
                >
                  {getClassValue(classCode as any)} ({classCode})
                  <button
                    onClick={() => handleRemoveClass(classCode)}
                    className="hover:bg-green-200 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              {editingMember ? 'Update' : 'Add'} Member
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