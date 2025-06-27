import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Settings, Calendar } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Team Meeting App
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage your team members and track meeting participants with ease.
            Future-ready for Discord integration.
          </p>
        </div>

        {/* Main Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* View Team Members */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-blue-600" />
                <CardTitle>View Team Members</CardTitle>
              </div>
              <CardDescription>
                See all team members who will join the meeting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Display the 25 team members with their information, roles, and departments.
              </p>
              <Link href="/team-members">
                <Button className="w-full">
                  View Team Members
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Admin Panel */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Settings className="h-6 w-6 text-green-600" />
                <CardTitle>Admin Panel</CardTitle>
              </div>
              <CardDescription>
                Manage team member information and settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Add, edit, or remove team members. Update roles and departments.
              </p>
              <Link href="/admin">
                <Button className="w-full" variant="outline">
                  Access Admin Panel
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Meeting Schedule */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Calendar className="h-6 w-6 text-purple-600" />
                <CardTitle>Meeting Schedule</CardTitle>
              </div>
              <CardDescription>
                View upcoming meetings and participants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Track meeting schedules and participant lists.
              </p>
              <Link href="/meetings">
                <Button className="w-full" variant="outline">
                  View Meetings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Features</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Current Features</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Team member management with MongoDB</li>
                <li>• Admin interface for CRUD operations</li>
                <li>• Responsive design with modern UI</li>
                <li>• Real-time data updates</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Future Integration</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Discord.js integration</li>
                <li>• Automatic user sync from Discord</li>
                <li>• Avatar and nickname import</li>
                <li>• Real-time Discord status</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 