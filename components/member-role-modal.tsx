'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ROLE_OPTIONS, 
  CLASS_OPTIONS, 
  getAvailableRolesForClass, 
  getAvailableClassesForRole, 
  getClassValue, 
  getClassCode,
  getDefaultRoleForClass,
  getDefaultClassForRole,
  isValidRoleForClass,
  isValidClassForRole,
  getRoleDisplayValue,
  type Role,
  type ClassCode
} from '@/lib/constants'

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
  title = 'Đặt vai trò và môn phái'
}: MemberRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [availableRoles, setAvailableRoles] = useState<Role[]>([])
  const [availableClasses, setAvailableClasses] = useState<ClassCode[]>([])

  // Reset to defaults when modal opens
  useEffect(() => {
    if (isOpen) {
      // Set initial values if provided
      if (initialClass && initialRole) {
        // Validate that the initial role is valid for the initial class
        if (isValidRoleForClass(initialRole as Role, initialClass as ClassCode)) {
          setSelectedClass(initialClass)
          setSelectedRole(initialRole)
          setAvailableRoles(getAvailableRolesForClass(initialClass as ClassCode))
          setAvailableClasses(getAvailableClassesForRole(initialRole as Role))
        } else {
          // If invalid combination, set class first and get available roles
          setSelectedClass(initialClass)
          setSelectedRole('')
          setAvailableRoles(getAvailableRolesForClass(initialClass as ClassCode))
          setAvailableClasses(CLASS_OPTIONS.map(cls => cls.code as ClassCode))
        }
      } else if (initialClass) {
        // Only class provided
        setSelectedClass(initialClass)
        setSelectedRole('')
        setAvailableRoles(getAvailableRolesForClass(initialClass as ClassCode))
        setAvailableClasses(CLASS_OPTIONS.map(cls => cls.code as ClassCode))
      } else if (initialRole) {
        // Only role provided
        setSelectedRole(initialRole)
        setSelectedClass('')
        setAvailableClasses(getAvailableClassesForRole(initialRole as Role))
        setAvailableRoles([...ROLE_OPTIONS])
      } else {
        // No initial values
        setSelectedRole('')
        setSelectedClass('')
        setAvailableRoles([...ROLE_OPTIONS])
        setAvailableClasses(CLASS_OPTIONS.map(cls => cls.code as ClassCode))
      }
    }
  }, [isOpen, initialRole, initialClass])

  // Update available options based on selection
  useEffect(() => {
    if (selectedClass) {
      // When class is selected, filter roles to only show available ones for that class
      const classCode = selectedClass as ClassCode
      const rolesForClass = getAvailableRolesForClass(classCode)
      setAvailableRoles(rolesForClass)
      
      // If current role is not available for selected class, clear it
      if (selectedRole && !rolesForClass.includes(selectedRole as Role)) {
        setSelectedRole('')
      }
    } else {
      setAvailableRoles([...ROLE_OPTIONS])
    }

    if (selectedRole) {
      // When role is selected, filter classes to only show available ones for that role
      const classesForRole = getAvailableClassesForRole(selectedRole as Role)
      setAvailableClasses(classesForRole)
      
      // If current class is not available for selected role, clear it
      if (selectedClass && !classesForRole.includes(selectedClass as ClassCode)) {
        setSelectedClass('')
      }
    } else {
      setAvailableClasses(CLASS_OPTIONS.map(cls => cls.code as ClassCode))
    }
  }, [selectedRole, selectedClass])

  const handleSave = () => {
    if (selectedRole && selectedClass) {
      onSave(selectedRole, selectedClass)
      onClose()
    }
  }

  const handleClose = () => {
    setSelectedRole('')
    setSelectedClass('')
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
            <label className="block text-sm font-medium mb-2">Vai trò</label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {getRoleDisplayValue(role)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedClass && availableRoles.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Môn phái {getClassValue(selectedClass as ClassCode)} có thể đảm nhận: {availableRoles.map(role => getRoleDisplayValue(role)).join(', ')}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Môn phái</label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn môn phái" />
              </SelectTrigger>
              <SelectContent>
                {availableClasses.map((classCode) => (
                  <SelectItem key={classCode} value={classCode}>
                    {getClassValue(classCode)} ({classCode})
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
              Lưu
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