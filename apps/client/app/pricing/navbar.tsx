'use client';

import { Sun, Moon, Laptop, Plus, Share2, Menu, X } from 'lucide-react';
import { useTheme } from '../components/theme-provider';
import { useState, useEffect } from 'react';
import { ThemeToggle } from '../components/theme-toggle';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import Image from 'next/image';

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-white dark:bg-gray-900 dark:border-gray-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">

        {/* Left: Logo & Mobile Menu */}
        <div className="flex items-center space-x-3">
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            <Menu size={24} className="text-gray-700 dark:text-gray-300" />
          </button>
          <h1
            onClick={() => redirect('/')} 
            className="text-xl font-semibold cursor-pointer flex items-center space-x-2 text-gray-900 dark:text-white">
            <Image
              src={theme === 'dark' ? '/logowhite.png' : '/logoblack.png'}
              alt="Logo"
              width={80}
              height={80}
              className="cursor-pointer"
              />
            SEO Analyzer
          </h1>
        </div>

        <nav className="hidden md:flex space-x-6">
          <Link
            href="/about"
            className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            About Us
          </Link>
          <Link
            href="/features"
            className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            Pricing
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            Contact Us
          </Link>
        </nav>

        <div className="hidden md:flex items-center space-x-2">
          <button className="text-sm flex items-center cursor-pointer space-x-2">
            <Plus size={16} className="mr-2" />
            New Project
          </button>

          <button className="text-sm flex cursor-pointer items-center space-x-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded px-3 py-1 transition-colors">
            <Share2 size={16} className="mr-2" />
            Share
          </button>

          <ThemeToggle />
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {menuOpen && (
        <div className="md:hidden border-t dark:border-gray-800 bg-white dark:bg-gray-900">
          <nav className="px-4 py-3 space-y-2">
            <Link
              href="/about"
              className="block py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
              onClick={() => setMenuOpen(false)}
            >
              About Us
            </Link>
            <Link
              href="/features"
              className="block py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
              onClick={() => setMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="block py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
              onClick={() => setMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/contact"
              className="block py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
              onClick={() => setMenuOpen(false)}
            >
              Contact Us
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
