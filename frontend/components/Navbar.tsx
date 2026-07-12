'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getStoredAuth, clearStoredAuth } from '@/lib/auth';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const { user } = getStoredAuth();
    setUser(user);
  }, []);

  const handleLogout = () => {
    clearStoredAuth();
    setUser(null);
    setIsMenuOpen(false);
    router.push('/');
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl sm:text-2xl font-bold text-blue-600" onClick={closeMenu}>
            LearnPath
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Dashboard
                </Link>
                <Link href="/roadmaps" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Roadmaps
                </Link>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 max-w-[120px] truncate">{user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors min-h-[44px]"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-[44px]"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-blue-600 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            {user ? (
              <div className="flex flex-col space-y-3">
                <div className="px-4 py-2 text-sm text-gray-600 border-b border-gray-100">
                  {user.name}
                </div>
                <Link
                  href="/dashboard"
                  className="px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-lg min-h-[44px] flex items-center"
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>
                <Link
                  href="/roadmaps"
                  className="px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-lg min-h-[44px] flex items-center"
                  onClick={closeMenu}
                >
                  Roadmaps
                </Link>
                <button
                  onClick={handleLogout}
                  className="mx-4 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors min-h-[44px]"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-3">
                <Link
                  href="/auth/login"
                  className="px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-lg min-h-[44px] flex items-center"
                  onClick={closeMenu}
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="mx-4 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-[44px] text-center"
                  onClick={closeMenu}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
