'use client';

import { useState } from 'react';
import Sidebar from '../../components/sidebar/sidebar';
import Navbar from '../../about/navbar';

interface SubFeatureLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export default function SubFeatureLayout({ title, description, children }: SubFeatureLayoutProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-white">
      <Sidebar open={open} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <section className="dark:bg-gray-900 h-full overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {title}
              </h1>
              {description && (
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-4xl">
                  {description}
                </p>
              )}
            </div>
            
            {/* Content Area */}
            {children}
          </div>
        </section>
      </main>
    </div>
  );
}
