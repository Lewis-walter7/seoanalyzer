'use client';

import { useState, useEffect, Suspense } from 'react';
import Sidebar from './components/sidebar/sidebar';
import Navbar from './components/navbar/navbar';
import Dashboard from './components/dashboard/dashboard';
import { useProjects } from '@/hooks/useProjects';

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { selectedProject } = useProjects();

  useEffect(() => {
    const handleCloseSidebar = () => {
      setSidebarOpen(false);
    };

    window.addEventListener('closeSidebar', handleCloseSidebar);
    return () => window.removeEventListener('closeSidebar', handleCloseSidebar);
  }, []);

  // Unified toggle handler for mobile navigation
  const handleSidebarToggle = (open: boolean) => {
    setSidebarOpen(open);
  };

  return (
    <Suspense>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-white">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar open={sidebarOpen} selectedProject={selectedProject} />
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300 motion-reduce:transition-none"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative transform transition-transform duration-300 motion-reduce:transition-none">
              <Sidebar open={sidebarOpen} selectedProject={selectedProject} />
            </div>
          </div>
        )}

        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-all duration-300">
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
              <Dashboard />
            </div>
          </div>
        </main>
      </div>
    </Suspense>
  );
}
