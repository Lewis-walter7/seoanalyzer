'use client';

import { useState, useEffect } from 'react';
import Sidebar from './components/sidebar/sidebar';
import Navbar from './components/navbar/navbar';
import Dashboard from './components/dashboard/dashboard';

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

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
        <section className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <Dashboard selectedProject={selectedProject} setSelectedProject={setSelectedProject} />
        </section>
      </main>
    </div>
  );
}
