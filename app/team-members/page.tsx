import React from 'react'
import Link from 'next/link'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { ArrowLeft, Users, Mail, Building, User } from 'lucide-react'

// This would be replaced with actual data fetching in a real app
const mockTeamMembers = [
  {
    _id: '1',
    name: 'John Doe',
    email: 'john.doe@company.com',
    role: 'Senior Developer',
    department: 'Engineering',
    avatar: null,
    joinDate: new Date('2023-01-15'),
  },
  {
    _id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@company.com',
    role: 'Product Manager',
    department: 'Product',
    avatar: null,
    joinDate: new Date('2023-02-20'),
  },
  {
    _id: '3',
    name: 'Mike Johnson',
    email: 'mike.johnson@company.com',
    role: 'UX Designer',
    department: 'Design',
    avatar: null,
    joinDate: new Date('2023-03-10'),
  },
  // Add more mock data to reach 25 members
  ...Array.from({ length: 22 }, (_, i) => ({
    _id: String(i + 4),
    name: `Team Member ${i + 4}`,
    email: `member${i + 4}@company.com`,
    role: ['Developer', 'Designer', 'Manager', 'Analyst'][i % 4],
    department: ['Engineering', 'Design', 'Product', 'Marketing'][i % 4],
    avatar: null,
    joinDate: new Date(2023, Math.floor(i / 4), (i % 28) + 1),
  })),
]

export default function TeamMembersPage() {
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
              <h1 className="text-3xl font-bold text-gray-900">Team Members</h1>
              <p className="text-gray-600 mt-2">
                {mockTeamMembers.length} team members will join the meeting
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Users className="h-4 w-4" />
              <span>Active Members</span>
            </div>
          </div>
        </div>

        {/* Team Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockTeamMembers.map((member) => (
            <Card key={member._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar || undefined} />
                    <AvatarFallback>
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{member.name}</CardTitle>
                    <CardDescription className="truncate">{member.role}</CardDescription>
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
                <div className="text-2xl font-bold text-blue-600">{mockTeamMembers.length}</div>
                <div className="text-sm text-gray-600">Total Members</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {new Set(mockTeamMembers.map(m => m.department)).size}
                </div>
                <div className="text-sm text-gray-600">Departments</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(mockTeamMembers.map(m => m.role)).size}
                </div>
                <div className="text-sm text-gray-600">Roles</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {mockTeamMembers.filter(m => m.joinDate.getFullYear() === 2023).length}
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