'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ROLE_OPTIONS, CLASS_OPTIONS, getAvailableRolesForClass, getAvailableClassesForRole, getClassValue, getClassCode } from '@/lib/constants'

interface TeamMember {
  _id: string
  name: string
  email: string
  roles: string[]
  departments: string[]
  avatar?: string
  isActive: boolean
  joinDate: Date
}

interface MeetingParticipant {
  memberId: string
  name: string
  email: string
  meetingRole: string
  meetingDepartment: string
}

interface MemberRoleModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (role: string, classValue: string) => void
  initialRole?: string
  initialClass?: string
  title?: string
}

export default function MemberRoleModal({
  isOpen,
  onClose,
  onSave,
  initialRole = '',
  initialClass = '',
  title = 'Set Meeting Role & Class'
}: MemberRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState(initialRole)
  const [selectedClass, setSelectedClass] = useState(initialClass)
  const [availableRoles, setAvailableRoles] = useState<string[]>(ROLE_OPTIONS)
  const [availableClasses, setAvailableClasses] = useState<string[]>(CLASS_OPTIONS.map(cls => cls.code))

  // Update available options based on selection
  useEffect(() => {
    if (selectedClass) {
      // When class is selected, filter roles to only show available ones for that class
      const classCode = selectedClass as any
      const rolesForClass = getAvailableRolesForClass(classCode)
      setAvailableRoles(rolesForClass)
      
      // If current role is not available for selected class, clear it
      if (selectedRole && !rolesForClass.includes(selectedRole as any)) {
        setSelectedRole('')
      }
    } else {
      setAvailableRoles(ROLE_OPTIONS)
    }

    if (selectedRole) {
      // When role is selected, filter classes to only show available ones for that role
      const classesForRole = getAvailableClassesForRole(selectedRole as any)
      setAvailableClasses(classesForRole)
      
      // If current class is not available for selected role, clear it
      if (selectedClass && !classesForRole.includes(selectedClass as any)) {
        setSelectedClass('')
      }
    } else {
      setAvailableClasses(CLASS_OPTIONS.map(cls => cls.code))
    }
  }, [selectedRole, selectedClass])

  const handleSave = () => {
    if (selectedRole && selectedClass) {
      onSave(selectedRole, selectedClass)
      onClose()
    }
  }

  const handleClose = () => {
    setSelectedRole(initialRole)
    setSelectedClass(initialClass)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
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

          <div>
            <label className="block text-sm font-medium mb-2">Class</label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
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
            <Button
              onClick={handleSave}
              disabled={!selectedRole || !selectedClass}
              className="flex-1"
            >
              Save
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