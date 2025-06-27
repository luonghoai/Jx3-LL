'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Input } from '../components/ui/input'
import { Users, MessageSquare, Swords, User, Settings, Search } from 'lucide-react'

// Mock data for 25 team members
const teamMembers = [
  {
    _id: '1',
    name: 'John Doe',
    discordUid: 'john.doe#1234',
    roles: ['Senior Developer', 'Tech Lead'],
    classes: ['Class A', 'Class B'],
    avatar: null,
  },
  {
    _id: '2',
    name: 'Jane Smith',
    discordUid: 'jane.smith#5678',
    roles: ['Product Manager', 'Scrum Master'],
    classes: ['Class C', 'Class D'],
    avatar: null,
  },
  {
    _id: '3',
    name: 'Mike Johnson',
    discordUid: 'mike.johnson#9012',
    roles: ['UX Designer', 'UI Developer'],
    classes: ['Class E', 'Class F'],
    avatar: null,
  },
  // Add more mock data to reach 25 members
  ...Array.from({ length: 22 }, (_, i) => ({
    _id: String(i + 4),
    name: `Team Member ${i + 4}`,
    discordUid: `member${i + 4}#${String(i + 4).padStart(4, '0')}`,
    roles: [
      ['Developer', 'Code Reviewer'][i % 2],
      ['Designer', 'Analyst'][i % 2]
    ],
    classes: [
      ['Class A', 'Class B'][i % 2],
      ['Class C', 'Class D'][i % 2]
    ],
    avatar: null,
  })),
]

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('')

  // Filter team members based on search term
  const filteredMembers = useMemo(() => {
    if (!searchTerm.trim()) return teamMembers
    
    return teamMembers.filter(member =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.discordUid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.roles.some(role => role.toLowerCase().includes(searchTerm.toLowerCase())) ||
      member.classes.some(cls => cls.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [searchTerm])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-8xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Team Meeting Participants
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {filteredMembers.length} team members will join the meeting today
          </p>
        </div>

        {/* Admin Access Button */}
        <div className="text-center mb-8">
          <Link href="/login">
            <Button variant="outline" className="mb-4">
              <Settings className="h-4 w-4 mr-2" />
              Admin Access
            </Button>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, Discord UID, role, or class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Team Members Grid */}
        <div className="grid grid-cols-5 gap-4 max-w-full mx-auto px-4">
          {filteredMembers.map((member) => (
            <Card key={member._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar || "/images/default.png"} />
                    <AvatarFallback>
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{member.name}</CardTitle>
                    <CardDescription className="truncate">{member.roles.join(', ')}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MessageSquare className="h-4 w-4" />
                  <span className="truncate">{member.discordUid}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Swords className="h-4 w-4" />
                  <span>{member.classes.join(', ')}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No results message */}
        {filteredMembers.length === 0 && searchTerm && (
          <div className="text-center py-8">
            <p className="text-gray-600">No team members found matching "{searchTerm}"</p>
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{filteredMembers.length}</div>
                <div className="text-sm text-gray-600">Total Members</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {new Set(filteredMembers.flatMap(m => m.classes)).size}
                </div>
                <div className="text-sm text-gray-600">Classes</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(filteredMembers.flatMap(m => m.roles)).size}
                </div>
                <div className="text-sm text-gray-600">Roles</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 