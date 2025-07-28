'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '../theme-provider';
import { useState, useRef, useEffect } from 'react';
import { navItems, seoNavItems } from '@/libs/data';
import { PanelLeft, PanelLeftClose, UserPlus, X, LogOut, Settings, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useAuth } from '../providers/session-provider';

interface SidebarProps {
  open: boolean;
  selectedProject?: any;
}

export default function Sidebar({ open, selectedProject }: SidebarProps) {
  const { theme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();


  const activeProject = !!selectedProject;
  const [menuOpen, setMenuOpen] = useState(false);
   const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    setCollapsed(!collapsed);
  };
  const isFeaturePage = pathname.startsWith('/features');

  const itemsToRender = isFeaturePage
    ? seoNavItems()
    : navItems(activeProject);
 

  return (
    <aside
      className={`${
        collapsed ? 'w-16 lg:w-18' : 'w-64 lg:w-64'
      } transition-all duration-300 h-screen bg-white dark:bg-gray-900 border-r dark:border-gray-800 flex flex-col fixed lg:relative z-40`}
    >
      {/* Header Logo + Toggle */}
      <div className="flex items-center justify-between p-2 border-b dark:border-gray-800 relative group min-h-[4rem]">
        {!collapsed && (
          <>
            <Image
              src={theme === 'dark' ? '/logowhite.png' : '/logoblack.png'}
              alt="Logo"
              width={40}
              height={40}
              className="transition-all lg:w-[50px] lg:h-[50px]"
            />
            {/* Mobile close button */}
            <button 
              className="lg:hidden text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded"
              onClick={() => window.dispatchEvent(new CustomEvent('closeSidebar'))}
            >
              <X size={20} />
            </button>
          </>
        )}
        {collapsed && (
          <button
            onClick={handleToggle}
            className="opacity-75 group-hover:opacity-100 transition-opacity mx-auto"          
          >
            <PanelLeft size={24} className="lg:w-[27px] lg:h-[27px]" />
          </button>
        )}
        {!collapsed && (
          <button 
            onClick={handleToggle} 
            className="hidden lg:block text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded"
          >
            <PanelLeftClose size={20} className="lg:w-[24px] lg:h-[24px]" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="p-3 lg:p-4 space-y-2 lg:space-y-3 flex-1 overflow-y-auto">
        {itemsToRender.map(({ name, href, icon: Icon, disabled }) => (
          <Link
            key={name}
            href={disabled ? '#' : href}
            className={`flex items-center gap-2 lg:gap-3 px-2 lg:px-3 py-2 lg:py-2 rounded text-sm transition-colors ${
              disabled
                ? 'cursor-not-allowed text-gray-400 dark:text-gray-600'
                : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
            } ${collapsed ? 'justify-center' : ''}`}
          >
            <Icon size={18} className="lg:w-[20px] lg:h-[20px] flex-shrink-0" />
            {!collapsed && (
              <span className="truncate">{name}</span>
            )}
          </Link>
        ))}
      </nav>

      {/* Sign In Button */}
      <div className="p-3 lg:p-4 border-t dark:border-gray-800 relative">
        {user ? (
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-full flex items-center justify-start"
          >
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
          </button>
        ) : (
          <Link
            href="/login"
            className={`bg-blue-600 text-white hover:bg-blue-700 rounded transition-colors w-full flex items-center justify-center ${collapsed ? 'p-2' : 'px-4 py-2'}`}
          >
            {collapsed ? (
              <UserPlus size={18} className="mx-auto" />
            ) : (
              <span className="text-sm font-medium">Sign In</span>
            )}
          </Link>
        )}
        {menuOpen && (
          <div
            ref={menuRef}
            className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md border dark:border-gray-700 z-50"
          >
            <Link
              href="/profile"
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900 space-x-2"
              onClick={() => setMenuOpen(false)}
            >
              <User size={14} />
              <span>Profile</span>
            </Link>
            <Link
              href="/settings"
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900 space-x-2"
              onClick={() => setMenuOpen(false)}
            >
              <Settings size={14} />
              <span>Settings</span>
            </Link>
            <button
              onClick={() => {
                setMenuOpen(false);
                signOut({ callbackUrl: '/' });
              }}
              className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900 space-x-2"
            >
              <LogOut size={14} />
              <span>Log out</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
