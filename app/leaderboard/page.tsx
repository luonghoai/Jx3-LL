'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, Trophy, Medal, Award, Users, TrendingUp } from 'lucide-react'

interface UserScore {
  _id: string
  memberId: {
    _id: string
    name: string
    discordUid?: string
    avatar?: string
  }
  discordUid: string
  name: string
  score: number
  totalMeetingsJoined: number
  lastUpdated: string
}

function LeaderboardContent() {
  const [userScores, setUserScores] = useState<UserScore[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch user scores
  const fetchUserScores = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/user-scores?leaderboard=true&limit=50')
      if (!response.ok) {
        throw new Error('Không thể tải bảng xếp hạng')
      }
      const data = await response.json()
      setUserScores(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching user scores:', err)
    } finally {
      setLoading(false)
    }
  }

  // Load user scores on mount
  useEffect(() => {
    fetchUserScores()
  }, [])

  // Get rank icon based on position
  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-6 w-6 text-yellow-500" />
    if (index === 1) return <Medal className="h-6 w-6 text-gray-400" />
    if (index === 2) return <Award className="h-6 w-6 text-amber-600" />
    return <span className="text-lg font-bold text-gray-600">{index + 1}</span>
  }

  // Get rank color based on position
  const getRankColor = (index: number) => {
    if (index === 0) return 'bg-yellow-50 border-yellow-200'
    if (index === 1) return 'bg-gray-50 border-gray-200'
    if (index === 2) return 'bg-amber-50 border-amber-200'
    return 'bg-white border-gray-200'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại trang chủ
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Trophy className="h-8 w-8 text-yellow-500" />
                Bảng Xếp Hạng
              </h1>
              <p className="text-gray-600 mt-2">
                Xem điểm số và thứ hạng của các thành viên
              </p>
            </div>
            <Button onClick={fetchUserScores} disabled={loading}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Làm mới
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng Thành Viên</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userScores.length}</div>
              <p className="text-xs text-muted-foreground">
                Thành viên có điểm số
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Điểm Cao Nhất</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {userScores.length > 0 ? userScores[0].score : 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {userScores.length > 0 ? userScores[0].name : 'Chưa có dữ liệu'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Điểm Trung Bình</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userScores.length > 0 
                  ? Math.round(userScores.reduce((sum, user) => sum + user.score, 0) / userScores.length)
                  : 0
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Điểm trung bình của tất cả thành viên
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải bảng xếp hạng...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="text-red-800">
                <p className="font-medium">Lỗi khi tải bảng xếp hạng</p>
                <p className="text-sm">{error}</p>
                <button 
                  onClick={fetchUserScores}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Thử lại
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        {!loading && !error && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Bảng Xếp Hạng Thành Viên</CardTitle>
                <CardDescription>
                  Điểm số dựa trên số lần tham gia bí cảnh đã xác nhận
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userScores.length === 0 ? (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Chưa có dữ liệu điểm số</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Điểm số sẽ được tính khi thành viên tham gia bí cảnh đã xác nhận
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userScores.map((user, index) => (
                      <div
                        key={user._id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${getRankColor(index)} hover:shadow-md transition-shadow`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-8 h-8">
                            {getRankIcon(index)}
                          </div>
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.memberId?.avatar || "/images/default.png"} />
                            <AvatarFallback>
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-lg">{user.name}</h3>
                            <p className="text-sm text-gray-600">
                              {user.memberId?.discordUid || user.discordUid}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {user.score}
                          </div>
                          <div className="text-sm text-gray-600">
                            {user.totalMeetingsJoined} bí cảnh
                          </div>
                          <div className="text-xs text-gray-500">
                            Cập nhật: {new Date(user.lastUpdated).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default function LeaderboardPage() {
  return <LeaderboardContent />
} 