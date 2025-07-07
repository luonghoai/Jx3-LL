'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Hash } from 'lucide-react'
import { ROLE_OPTIONS, CLASS_OPTIONS, getAvailableRolesForClass, getAvailableClassesForRole, getClassValue, getClassCode, getRoleDisplayValue } from '@/lib/constants'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { fetchDiscordUser, getDiscordAvatarUrl, getDiscordDisplayName, type DiscordUser } from '@/lib/discord'

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
  onSave: (memberData: { name: string; discordUid?: string; roles: string[]; classes: string[]; avatar?: string }) => void
  editingMember?: {
    _id: string
    name: string
    discordUid?: string
    roles: string[]
    classes: string[]
    avatar?: string
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
  const [availableRoles, setAvailableRoles] = useState<string[]>([...ROLE_OPTIONS])
  const [availableClasses, setAvailableClasses] = useState<string[]>(CLASS_OPTIONS.map(cls => cls.code))
  const [discordUser, setDiscordUser] = useState<DiscordUser | null>(null)
  const [discordError, setDiscordError] = useState<string | null>(null)
  const [avatar, setAvatar] = useState<string>('')

  // Load member data when editing
  useEffect(() => {
    if (editingMember) {
      setName(editingMember.name)
      setDiscordUid(editingMember.discordUid || '')
      setRoles(editingMember.roles) // Load actual roles without default
      setClasses(editingMember.classes)
      setAvatar(editingMember.avatar || '')
      setDiscordUser(null)
      setDiscordError(null)
    } else {
      // Reset form when adding new member
      setName('')
      setDiscordUid('')
      setRoles([])
      setClasses([])
      setAvatar('')
      setDiscordUser(null)
      setDiscordError(null)
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
      setAvailableRoles([...ROLE_OPTIONS])
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
      alert('Tên là bắt buộc')
      return
    }
    if (classes.length === 0) {
      alert('Ít nhất một môn phái là bắt buộc')
      return
    }

    onSave({
      name: name.trim(),
      discordUid: discordUid.trim() || undefined,
      roles: roles, // Send actual roles array (API will handle default if empty)
      classes,
      avatar: avatar || undefined
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
          <CardTitle>{editingMember ? 'Sửa thành viên' : 'Thêm thành viên'}</CardTitle>
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
              placeholder="Tên thành viên"
            />
          </div>

          {/* Roles Field - Only show when editing */}
          {editingMember && (
            <div>
              <label className="block text-sm font-medium mb-2">Vai trò</label>
              <div className="mb-2">
                <Select value={selectedRole} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vai trò để thêm" />
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
              <div className="flex flex-wrap gap-1">
                {roles.map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                  >
                    {getRoleDisplayValue(role as any)}
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
          )}

          {/* Classes Field */}
          <div>
            <label className="block text-sm font-medium mb-2">Môn phái *</label>
            <div className="mb-2">
              <Select value={selectedClass} onValueChange={handleClassChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn môn phái để thêm" />
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
              {editingMember ? 'Cập nhật' : 'Thêm'} thành viên
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