'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, Plus, Edit, Trash2, Save, X, Users, Mail, Building, User } from 'lucide-react'

interface TeamMember {
  _id: string
  name: string
  email: string
  role: string
  department: string
  avatar?: string
  isActive: boolean
  joinDate: Date
}

export default function AdminPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
  })

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockData: TeamMember[] = [
      {
        _id: '1',
        name: 'John Doe',
        email: 'john.doe@company.com',
        role: 'Senior Developer',
        department: 'Engineering',
        isActive: true,
        joinDate: new Date('2023-01-15'),
      },
      {
        _id: '2',
        name: 'Jane Smith',
        email: 'jane.smith@company.com',
        role: 'Product Manager',
        department: 'Product',
        isActive: true,
        joinDate: new Date('2023-02-20'),
      },
      // Add more mock data
      ...Array.from({ length: 23 }, (_, i) => ({
        _id: String(i + 3),
        name: `Team Member ${i + 3}`,
        email: `member${i + 3}@company.com`,
        role: ['Developer', 'Designer', 'Manager', 'Analyst'][i % 4],
        department: ['Engineering', 'Design', 'Product', 'Marketing'][i % 4],
        isActive: true,
        joinDate: new Date(2023, Math.floor(i / 4), (i % 28) + 1),
      })),
    ]
    setTeamMembers(mockData)
  }, [])

  const handleAdd = () => {
    if (!formData.name || !formData.email || !formData.role || !formData.department) {
      alert('Please fill in all fields')
      return
    }

    const newMember: TeamMember = {
      _id: Date.now().toString(),
      ...formData,
      isActive: true,
      joinDate: new Date(),
    }

    setTeamMembers([...teamMembers, newMember])
    setFormData({ name: '', email: '', role: '', department: '' })
    setIsAdding(false)
  }

  const handleEdit = (id: string) => {
    const member = teamMembers.find(m => m._id === id)
    if (member) {
      setFormData({
        name: member.name,
        email: member.email,
        role: member.role,
        department: member.department,
      })
      setEditingId(id)
    }
  }

  const handleSave = () => {
    if (!formData.name || !formData.email || !formData.role || !formData.department) {
      alert('Please fill in all fields')
      return
    }

    setTeamMembers(teamMembers.map(member =>
      member._id === editingId
        ? { ...member, ...formData }
        : member
    ))
    setFormData({ name: '', email: '', role: '', department: '' })
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this team member?')) {
      setTeamMembers(teamMembers.map(member =>
        member._id === id
          ? { ...member, isActive: false }
          : member
      ))
    }
  }

  const activeMembers = teamMembers.filter(m => m.isActive)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600 mt-2">
                Manage team members and their information
              </p>
            </div>
            <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {(isAdding || editingId) && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {isAdding ? 'Add New Team Member' : 'Edit Team Member'}
              </CardTitle>
              <CardDescription>
                Fill in the information for the team member
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <Input
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="Enter role"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Department</label>
                  <Input
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Enter department"
                  />
                </div>
              </div>
              <div className="flex space-x-2 mt-4">
                <Button onClick={isAdding ? handleAdd : handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  {isAdding ? 'Add Member' : 'Save Changes'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false)
                    setEditingId(null)
                    setFormData({ name: '', email: '', role: '', department: '' })
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Team Members List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeMembers.map((member) => (
            <Card key={member._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatar || undefined} />
                      <AvatarFallback>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <CardDescription>{member.role}</CardDescription>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(member._id)}
                      disabled={editingId !== null}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(member._id)}
                      disabled={editingId !== null}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{member.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Building className="h-4 w-4" />
                  <span>{member.department}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>Joined {member.joinDate.toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{activeMembers.length}</div>
                <div className="text-sm text-gray-600">Active Members</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {new Set(activeMembers.map(m => m.department)).size}
                </div>
                <div className="text-sm text-gray-600">Departments</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(activeMembers.map(m => m.role)).size}
                </div>
                <div className="text-sm text-gray-600">Roles</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {activeMembers.filter(m => m.joinDate.getFullYear() === 2023).length}
                </div>
                <div className="text-sm text-gray-600">Joined in 2023</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 