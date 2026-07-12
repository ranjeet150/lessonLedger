'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, BookOpen } from 'lucide-react'
import { api } from '@/lib/api'
import { getStoredAuth } from '@/lib/auth'
import Navbar from '@/components/Navbar'

interface Roadmap {
  id: string
  title: string
  description: string
  category: string
  sections: any[]
}

export default function RoadmapsPage() {
  const router = useRouter()
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const { user } = getStoredAuth()
    setUser(user)
    fetchRoadmaps()
  }, [])

  const fetchRoadmaps = async () => {
    const { data } = await api.getRoadmaps()
    if (data) {
      setRoadmaps(data as Roadmap[])
    }
    setLoading(false)
  }

  const colors = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-red-500',
    'from-indigo-500 to-purple-500',
    'from-yellow-500 to-orange-500',
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-600">Loading roadmaps...</p>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Learning Roadmaps</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Choose a path and start your learning journey</p>
        </div>
      </div>

      {/* Roadmaps Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {roadmaps.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-sm sm:text-base text-gray-600">No roadmaps available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {roadmaps.map((roadmap, idx) => (
              <Link key={roadmap.id} href={`/roadmaps/${roadmap.id}`}>
                <div className="card hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className={`h-24 sm:h-32 bg-gradient-to-r ${colors[idx % colors.length]} rounded-lg mb-4 flex items-center justify-center`}>
                    <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-white opacity-50" />
                  </div>

                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 line-clamp-2">{roadmap.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{roadmap.description}</p>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{roadmap.sections?.length || 0} sections</span>
                      <span className="font-semibold text-primary">0%</span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: '0%' }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center text-primary font-semibold text-sm sm:text-base">
                    View Roadmap
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
