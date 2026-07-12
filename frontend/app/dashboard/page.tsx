'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Flame, Target, BookOpen, Award } from 'lucide-react'
import { getStoredAuth, setStoredAuth } from '@/lib/auth'
import { api } from '@/lib/api'
import StreakCard from '@/components/StreakCard'
import TaskList from '@/components/TaskList'

const mockData = [
  { day: 'Mon', hours: 2 },
  { day: 'Tue', hours: 3 },
  { day: 'Wed', hours: 2.5 },
  { day: 'Thu', hours: 4 },
  { day: 'Fri', hours: 3.5 },
  { day: 'Sat', hours: 5 },
  { day: 'Sun', hours: 2 },
]

export default function DashboardPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [user, setUser] = useState<any>(null)
  const [achievements, setAchievements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Handle NextAuth session
    if (session?.accessToken && session.user) {
      const user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      }
      setStoredAuth(user, session.accessToken as string)
    }

    const { user } = getStoredAuth()
    if (!user) {
      router.push('/auth/login')
      return
    }
    setUser(user)
    fetchAchievements()
  }, [router, session])

  const fetchAchievements = async () => {
    const { data } = await api.getAchievements()
    if (data) {
      setAchievements(data as any[])
    }
    setLoading(false)
  }

  if (!user) return null
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Welcome back! Here's your learning progress.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Welcome */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold">Welcome back, {user.name}!</h2>
          <p className="text-sm sm:text-base text-gray-600">Here's your learning progress.</p>
        </div>

        {/* Streak Card */}
        <div className="mb-6 sm:mb-8">
          <StreakCard />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="card">
            <h2 className="text-base sm:text-lg font-semibold mb-4">Weekly Study Hours</h2>
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <div className="min-w-[300px]">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={mockData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="hours" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-base sm:text-lg font-semibold mb-4">Progress Trend</h2>
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <div className="min-w-[300px]">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={mockData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="hours" stroke="#8b5cf6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks and Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="card">
            <TaskList />
          </div>

          <div className="card">
            <h3 className="text-base sm:text-lg font-semibold mb-4">Recent Achievements</h3>
            {achievements.length === 0 ? (
              <p className="text-gray-500 text-center py-8 text-sm">No achievements yet. Keep learning!</p>
            ) : (
              <div className="space-y-3">
                {achievements.slice(0, 5).map((achievement) => (
                  <div key={achievement.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Award className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{achievement.title}</p>
                      <p className="text-xs text-gray-500 line-clamp-2">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
