import React from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { ArrowLeft, Users, MessageSquare, Swords, User } from 'lucide-react'

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
  // Redirect to homepage since team members are now displayed there
  redirect('/')
} 