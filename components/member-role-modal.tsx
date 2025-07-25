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
  isValidRoleForClass,
  getRoleDisplayValue,
  type Role,
  type ClassCode
} from '@/lib/constants'
import { matchesVietnameseSearch } from '@/lib/utils'

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
      // Check if click is within the search input or the dropdown
      const target = event.target as Node
      const isWithinInput = searchInputRef.current?.contains(target)
      const isWithinDropdown = (event.target as Element)?.closest('.class-dropdown')
      
      if (!isWithinInput && !isWithinDropdown) {
        setShowClassList(false)
      }
    }

    if (showClassList) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
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
                  value={selectedClass ? getClassValue(selectedClass as ClassCode) : classFilter}
                  onChange={(e) => {
                    const value = e.target.value
                    setClassFilter(value)
                    // If user is typing, clear the selected class
                    if (selectedClass) {
                      setSelectedClass('')
                    }
                  }}
                  onFocus={() => setShowClassList(true)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    selectedClass 
                      ? 'border-green-500 bg-green-50 text-green-700' 
                      : 'border-gray-300'
                  }`}
                />
              </div>
              
              {/* Filtered class list */}
              {showClassList && (
                <div className="class-dropdown absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto z-10">
                  {(() => {
                    const filteredClasses = availableClasses.filter(classCode => {
                      if (!classFilter) return true
                      const className = getClassValue(classCode)
                      return matchesVietnameseSearch(className, classFilter)
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
                          setClassFilter('')
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