'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Plus, X } from 'lucide-react'
import { ROLE_OPTIONS, CLASS_OPTIONS, getClassValue, getClassCode } from '@/lib/constants'

interface FlexibleInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  options: string[]
  className?: string
}

export default function FlexibleInput({
  label,
  value,
  onChange,
  placeholder = "Type or select...",
  options,
  className = ""
}: FlexibleInputProps) {
  const [isCustom, setIsCustom] = useState(!options.includes(value))

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === 'custom') {
      setIsCustom(true)
      onChange('')
    } else {
      setIsCustom(false)
      onChange(selectedValue)
    }
  }

  const handleInputChange = (inputValue: string) => {
    onChange(inputValue)
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-2">{label}</label>
      {isCustom ? (
        <Input
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <Select value={value} onValueChange={handleSelectChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
            <SelectItem value="custom">Custom...</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  )
}

// Specialized components for roles and classes
export function RoleInput({ value, onChange, className }: { value: string; onChange: (value: string) => void; className?: string }) {
  return (
    <FlexibleInput
      label="Role"
      value={value}
      onChange={onChange}
      options={[...ROLE_OPTIONS]}
      placeholder="Enter role..."
      className={className}
    />
  )
}

export function ClassInput({ value, onChange, className }: { value: string; onChange: (value: string) => void; className?: string }) {
  // Convert class codes to display values for the dropdown
  const classDisplayOptions = CLASS_OPTIONS.map(cls => cls.value)
  
  const handleClassChange = (selectedValue: string) => {
    // If it's a custom value, use as is
    if (!classDisplayOptions.includes(selectedValue)) {
      onChange(selectedValue)
      return
    }
    
    // If it's a predefined class, convert to code for storage
    const classCode = getClassCode(selectedValue as any)
    onChange(classCode)
  }
  
  // Convert stored code to display value
  const displayValue = value ? getClassValue(value as any) : ''
  
  return (
    <FlexibleInput
      label="Class"
      value={displayValue}
      onChange={handleClassChange}
      options={[...classDisplayOptions]}
      placeholder="Enter class..."
      className={className}
    />
  )
} 