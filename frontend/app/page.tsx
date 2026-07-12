'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { BookOpen, Target, TrendingUp, Award, Zap } from 'lucide-react'
import { getStoredAuth } from '@/lib/auth'
import Navbar from '@/components/Navbar'

export default function Home() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const { user } = getStoredAuth()
    setUser(user)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
            Master Your Learning Journey
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Organize, track, and stay accountable to your academic and career goals with structured roadmaps, task tracking, and blockchain-verified achievements.
          </p>
          {!user ? (
            <Link href="/auth/signup" className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 inline-block min-h-[44px]">
              Get Started Free
            </Link>
          ) : (
            <Link href="/dashboard" className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 inline-block min-h-[44px]">
              Go to Dashboard
            </Link>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-12 sm:mt-16">
          <div className="card hover:shadow-md transition-shadow">
            <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-primary mb-4" />
            <h3 className="font-semibold text-base sm:text-lg mb-2">Learning Roadmaps</h3>
            <p className="text-gray-600 text-sm">Structured, hierarchical learning paths for any skill</p>
          </div>

          <div className="card hover:shadow-md transition-shadow">
            <Target className="w-8 h-8 sm:w-10 sm:h-10 text-secondary mb-4" />
            <h3 className="font-semibold text-base sm:text-lg mb-2">Task Tracking</h3>
            <p className="text-gray-600 text-sm">Daily and weekly goals with progress monitoring</p>
          </div>

          <div className="card hover:shadow-md transition-shadow">
            <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-accent mb-4" />
            <h3 className="font-semibold text-base sm:text-lg mb-2">Progress Analytics</h3>
            <p className="text-gray-600 text-sm">Streak tracking and GitHub-style contribution heatmap</p>
          </div>

          <div className="card hover:shadow-md transition-shadow">
            <Award className="w-8 h-8 sm:w-10 sm:h-10 text-success mb-4" />
            <h3 className="font-semibold text-base sm:text-lg mb-2">NFT Achievements</h3>
            <p className="text-gray-600 text-sm">Verifiable on-chain learning credentials</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 sm:mt-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 sm:p-12 text-white text-center">
          <Zap className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 px-4">Ready to Transform Your Learning?</h2>
          <p className="text-base sm:text-lg mb-6 opacity-90 px-4">
            Join thousands of learners building accountability and earning verifiable achievements
          </p>
          {!user && (
            <Link href="/auth/signup" className="bg-white text-blue-600 font-semibold px-6 sm:px-8 py-3 rounded-lg hover:bg-gray-100 inline-block min-h-[44px]">
              Start Learning Today
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-center text-gray-600">
            Built with ❤️ for learners and educators worldwide
          </p>
        </div>
      </footer>
    </div>
  )
