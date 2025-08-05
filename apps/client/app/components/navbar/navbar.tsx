'use client';

import { Plus, Share2, Menu, X, LogOut, Settings, User } from 'lucide-react';
import { useTheme } from '../theme-provider';
import { useState, useEffect, useRef } from 'react';
import { ThemeToggle } from '../theme-toggle';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useAuth } from '../providers/session-provider';
import { useRouter } from 'next/navigation';


interface NavbarProps {
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
}

export default function Navbar({ sidebarOpen, setSidebarOpen }: NavbarProps) {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleSidebar = () => {
    if (setSidebarOpen) {
      setSidebarOpen(!sidebarOpen);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-white dark:bg-gray-900 dark:border-gray-800">
      <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 py-3">

        {/* Left: Mobile Menu & Logo */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Combined Mobile Navigation Toggle */}
          <button 
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors motion-reduce:transition-none" 
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              setSidebarOpen && setSidebarOpen(!mobileMenuOpen);
            }}
            aria-label="Open menu"
            style={{ width: '44px', height: '44px' }}
          >
            {mobileMenuOpen ? (
              <X size={24} className="text-gray-700 dark:text-gray-300" />
            ) : (
              <Menu size={24} className="text-gray-700 dark:text-gray-300" />
            )}
          </button>
          
          <h1 
            onClick={() => redirect('/')}
            className="text-lg sm:text-xl font-semibold cursor-pointer text-gray-900 dark:text-white truncate">
            Rank Rover
          </h1>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex space-x-4 lg:space-x-6">
          <Link
            href="/about"
            className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition whitespace-nowrap"
          >
            About Us
          </Link>
          <Link
            href="/features"
            className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition whitespace-nowrap"
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition whitespace-nowrap"
          >
            Pricing
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition whitespace-nowrap"
          >
            Contact Us
          </Link>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Desktop Actions - Only show if authenticated */}
          {user?.id && (
            <div className="hidden lg:flex items-center space-x-2">
              <button className="text-sm flex items-center cursor-pointer space-x-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-2 py-1 transition-colors">
                <Plus size={16} />
                <span className="hidden xl:inline">New Project</span>
              </button>

              <button className="text-sm flex cursor-pointer items-center space-x-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded px-3 py-1 transition-colors">
                <Share2 size={16} />
                <span className="hidden xl:inline">Share</span>
              </button>
            </div>
          )}
          
          {/* Mobile Actions - Only show if authenticated */}
          {user?.id && (
            <div className="flex lg:hidden items-center space-x-1">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
                <Plus size={18} className="text-gray-700 dark:text-gray-300" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
                <Share2 size={18} className="text-gray-700 dark:text-gray-300" />
              </button>
            </div>
          )}

          <ThemeToggle />
          
          {/* Authentication Section */}
          {user ? (
            /* User Avatar and Menu */
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border dark:border-gray-700 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">
                      <div className="font-medium">{user?.name || 'User'}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</div>
                    </div>
                    
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User size={16} className="mr-2" />
                      Profile
                    </Link>
                    
                    <Link
                      href="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings size={16} className="mr-2" />
                      Settings
                    </Link>
                    
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                        router.push('/');
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <LogOut size={16} className="mr-2" />
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Sign In Button */
            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t dark:border-gray-800 bg-white dark:bg-gray-900">
          <nav className="px-4 py-3 space-y-2">
            <Link
              href="/about"
              className="block py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </Link>
            <Link
              href="/features"
              className="block py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="block py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/contact"
              className="block py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact Us
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
