'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Hash } from 'lucide-react'
import { ROLE_OPTIONS, CLASS_OPTIONS, getAvailableRolesForClass, getAvailableClassesForRole, getClassValue, getRoleDisplayValue } from '@/lib/constants'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { fetchDiscordUser, getDiscordAvatarUrl, getDiscordDisplayName, type DiscordUser } from '@/lib/discord'

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
  onSave: (guestData: { name: string; discordUid?: string; meetingRole: string; meetingClass: string; roles: string[]; classes: string[]; avatar?: string }) => void
  editingGuest?: {
    id: string
    name: string
    discordUid?: string
    roles: string[]
    classes: string[]
    meetingRole: string
    meetingClass: string
    avatar?: string
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
  const [discordUser, setDiscordUser] = useState<DiscordUser | null>(null)
  const [discordError, setDiscordError] = useState<string | null>(null)
  const [avatar, setAvatar] = useState<string>('')

  // Load guest data when editing
  useEffect(() => {
    if (editingGuest) {
      setName(editingGuest.name)
      setDiscordUid(editingGuest.discordUid || '')
      setMeetingRole(editingGuest.meetingRole)
      setMeetingClass(editingGuest.meetingClass)
      setRoles(editingGuest.roles)
      setClasses(editingGuest.classes)
      setAvatar(editingGuest.avatar || '')
      setDiscordUser(null)
      setDiscordError(null)
    } else {
      // Reset form when adding new guest
      setName('')
      setDiscordUid('')
      setMeetingRole('')
      setMeetingClass('')
      setRoles([])
      setClasses([])
      setAvatar('')
      setDiscordUser(null)
      setDiscordError(null)
    }
  }, [editingGuest])

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
      alert('Tên là bắt buộc')
      return
    }
    if (!meetingRole) {
      alert('Vai trò là bắt buộc')
      return
    }
    if (!meetingClass) {
      alert('Môn phái là bắt buộc')
      return
    }
    onSave({
      name: name.trim(),
      discordUid: discordUid.trim() || undefined,
      meetingRole,
      meetingClass,
      roles: [meetingRole],
      classes: [meetingClass],
      avatar: avatar || undefined
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
    setAvatar('')
    setDiscordUser(null)
    setDiscordError(null)
    onClose()
  }

  const handleDiscordSync = async () => {
    if (!discordUid.trim()) {
      setDiscordError('Vui lòng nhập UID Discord trước')
      return
    }

    setIsLoading(true)
    setDiscordError(null)
    
    try {
      const result = await fetchDiscordUser(discordUid.trim())
      
      if (result.success && result.data) {
        const user = result.data
        setDiscordUser(user)
        setName(getDiscordDisplayName(user))
        setDiscordUid(user.id)
        
        // Store Discord avatar URL
        if (user.avatar) {
          const avatarUrl = getDiscordAvatarUrl(user.id, user.avatar, 256)
          setAvatar(avatarUrl || '')
        } else {
          setAvatar('')
        }
        
        setDiscordError(null)
      } else {
        setDiscordError(result.error || 'Không thể tải thông tin Discord')
        setDiscordUser(null)
        setAvatar('')
      }
    } catch (error) {
      console.error('Discord sync error:', error)
      setDiscordError('Không thể đồng bộ với Discord. Vui lòng thử lại.')
      setDiscordUser(null)
      setAvatar('')
    } finally {
      setIsLoading(false)
    }
  }

  // Get avatar URL for preview
  const getAvatarUrl = () => {
    if (discordUser?.avatar) {
      return getDiscordAvatarUrl(discordUser.id, discordUser.avatar, 64)
    }
    return null
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>{editingGuest ? 'Sửa khách mời' : 'Thêm khách mời'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Discord UID Section */}
          <div className="border border-blue-200 bg-blue-50 rounded p-4 mb-2">
            <div className="flex items-center gap-3 mb-3">
              <Hash className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <label className="block text-sm font-semibold text-blue-800 mb-1">Discord UID</label>
                <div className="flex gap-2">
                  <Input
                    value={discordUid}
                    onChange={(e) => setDiscordUid(e.target.value)}
                    placeholder="UID Discord (ví dụ: 123456789012345678)"
                    className="flex-1"
                  />
                  <Button
                    onClick={handleDiscordSync}
                    disabled={isLoading}
                    variant="outline"
                    size="sm"
                  >
                    {isLoading ? 'Đồng bộ...' : 'Đồng bộ'}
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Discord User Preview */}
            {discordUser && (
              <div className="flex items-center gap-3 p-3 bg-white rounded border">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={getAvatarUrl() || undefined} />
                  <AvatarFallback className="text-xs">
                    {discordUser.username.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium text-sm">{getDiscordDisplayName(discordUser)}</div>
                  <div className="text-xs text-gray-600">@{discordUser.username}</div>
                </div>
                <div className="text-xs text-green-600 font-medium">✓ Đã kết nối</div>
              </div>
            )}
            
            {/* Discord Error */}
            {discordError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {discordError}
              </div>
            )}
          </div>

          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium mb-2">Tên *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tên khách mời"
            />
          </div>

          {/* Role Field */}
          <div>
            <label className="block text-sm font-medium mb-2">Vai trò *</label>
            <Select value={meetingRole} onValueChange={setMeetingRole}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {getRoleDisplayValue(role as any)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Class Field */}
          <div>
            <label className="block text-sm font-medium mb-2">Môn phái *</label>
            <Select value={meetingClass} onValueChange={setMeetingClass}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Chọn môn phái" />
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
              {editingGuest ? 'Cập nhật' : 'Thêm'} khách mời
            </Button>
            <Button onClick={handleClose} variant="outline" className="flex-1">
              Hủy
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 