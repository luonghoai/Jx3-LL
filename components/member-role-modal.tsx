'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search } from 'lucide-react'
import { 
  ROLE_OPTIONS, 
  CLASS_OPTIONS, 
  getAvailableRolesForClass, 
  getAvailableClassesForRole, 
  getClassValue, 
  getClassCode,
  getDefaultDPSRoleForClass,
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
  const [classFilter, setClassFilter] = useState('')
  const [showClassList, setShowClassList] = useState(false)
  const searchInputRef = React.useRef<HTMLInputElement>(null)

  // Reset to defaults when modal opens
  useEffect(() => {
    if (isOpen) {
      // Reset filter and list visibility
      setClassFilter('')
      setShowClassList(false)
      
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
        // Only class provided - automatically set default DPS role
        setSelectedClass(initialClass)
        const defaultDPSRole = getDefaultDPSRoleForClass(initialClass as ClassCode)
        setSelectedRole(defaultDPSRole)
        setAvailableRoles(getAvailableRolesForClass(initialClass as ClassCode))
        setAvailableClasses(getAvailableClassesForRole(defaultDPSRole))
      } else if (initialRole) {
        // Only role provided
        setSelectedRole(initialRole)
        setSelectedClass('')
        setAvailableClasses(getAvailableClassesForRole(initialRole as Role))
        setAvailableRoles([...ROLE_OPTIONS])
      } else {
        // No initial values - set Boss as default role
        setSelectedRole('Boss')
        setSelectedClass('')
        setAvailableRoles([...ROLE_OPTIONS])
        setAvailableClasses(getAvailableClassesForRole('Boss'))
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
      
      // If no role is selected, automatically set the default DPS role
      if (!selectedRole) {
        const defaultDPSRole = getDefaultDPSRoleForClass(classCode)
        setSelectedRole(defaultDPSRole)
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

  // Keep input focused when filtering
  useEffect(() => {
    if (searchInputRef.current && classFilter) {
      searchInputRef.current.focus()
    }
  }, [classFilter])

  // Handle click outside to close class list
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowClassList(false)
      }
    }

    if (showClassList) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showClassList])

  const handleSave = () => {
    if (selectedRole && selectedClass) {
      onSave(selectedRole, selectedClass)
      onClose()
    }
  }

  const handleClose = () => {
    setSelectedRole('')
    setSelectedClass('')
    setClassFilter('')
    setShowClassList(false)
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
            
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Tìm kiếm môn phái..."
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  onFocus={() => setShowClassList(true)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Filtered class list */}
              {showClassList && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto z-10">
                  {(() => {
                    const filteredClasses = availableClasses.filter(classCode => {
                      if (!classFilter) return true
                      const className = getClassValue(classCode).toLowerCase()
                      return className.includes(classFilter.toLowerCase())
                    })
                    
                    if (filteredClasses.length === 0 && classFilter) {
                      return (
                        <div className="px-3 py-2 text-sm text-gray-500 text-center">
                          Không tìm thấy môn phái "{classFilter}"
                        </div>
                      )
                    }
                    
                    return filteredClasses.map((classCode) => (
                      <div
                        key={classCode}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={() => {
                          setSelectedClass(classCode)
                          setClassFilter(getClassValue(classCode))
                          setShowClassList(false)
                        }}
                      >
                        {getClassValue(classCode)} ({classCode})
                      </div>
                    ))
                  })()}
                </div>
              )}
            </div>
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