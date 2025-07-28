'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CreateProjectModal from './CreateProjectModal';
import ProjectSelector from './ProjectSelector';
import { api, Project } from '@/lib/api';
import { useAuth } from '@/app/components/providers/session-provider';


interface DashboardProps {
  selectedProject: any;
  setSelectedProject: (project: any) => void;
}

export default function Dashboard({ selectedProject, setSelectedProject }: DashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'projects' | 'tools'>('projects');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const { user } = useAuth();

  console.log('User:', user);

  const handleTabClick = (tab: 'projects' | 'tools') => {
    if (tab === 'tools') {
      router.push('/tools');
    } else {
      setActiveTab(tab);
    }
  };

  const handleProjectCreated = (newProject: any) => {
    setUserProjects(prev => [...prev, newProject]);
    setSelectedProject(newProject);
  };

  const handleProjectSelect = (project: any) => {
    setSelectedProject(project);
  };

  const handleDeleteProject = (projectId: number) => {
    setUserProjects(prev => prev.filter(p => p.id !== projectId));
    if (selectedProject?.id === projectId) {
      setSelectedProject(null);
    }
  };

  // Fetch projects from API on component mount
  useEffect(() => {
    async function fetchProjects() {
      try {
        const data = await api.getProjects() as { projects: Project[] };
        setUserProjects(data.projects || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    }

    fetchProjects();
  }, []);

  return (
    <div className="min-h-full bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-4 sm:p-6 min-h-full">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 lg:mb-8 space-y-4 lg:space-y-0">
          <div className="text-center lg:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm sm:text-base">Welcome back! Here&apos;s what&apos;s happening with your SEO projects.</p>
          </div>

          {/* Project Selector */}
          <ProjectSelector
            projects={userProjects}
            selectedProject={selectedProject}
            onProjectSelect={handleProjectSelect}
            onCreateNew={() => setShowCreateModal(true)}
            onDeleteProject={handleDeleteProject}
          />
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 sm:space-x-2 mb-6 lg:mb-8 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-lg">
          <button
            className={`flex-1 sm:flex-none px-3 sm:px-6 py-3 rounded-lg font-semibold transition-all duration-300 text-sm sm:text-base ${
              activeTab === 'projects' 
                ? 'bg-linear-to-r from-blue-500 to-purple-500 text-white shadow-md' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onClick={() => handleTabClick('projects')}
          >
            <span className="hidden sm:inline">📊 </span>Projects
          </button>
          <button
            className={`flex-1 sm:flex-none px-3 sm:px-6 py-3 rounded-lg font-semibold transition-all duration-300 text-sm sm:text-base ${
              activeTab === 'tools' 
                ? 'bg-linear-to-r from-blue-500 to-purple-500 text-white shadow-md' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onClick={() => handleTabClick('tools')}
          >
            <span className="hidden sm:inline">🛠️ </span>Tools
          </button>
        </div>

        {/* Project Cards */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            {selectedProject ? (
              // Show selected project
              <div key={selectedProject.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 card-hover border-l-4 border-l-blue-500">
                {/* Selected project content - same as below but highlighted */}
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-6 space-y-4 lg:space-y-0">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center mb-3 space-y-2 sm:space-y-0">
                      <div className="bg-linear-to-r from-green-500 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold mr-0 sm:mr-3 w-fit">
                        SELECTED
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">{selectedProject.name}</h2>
                    </div>
                    <a href={selectedProject.url} className="text-blue-500 hover:text-blue-400 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 text-sm font-medium break-all" target="_blank">
                      🌐 {selectedProject.url}
                    </a>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                    <div className="bg-linear-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                      ⭐ Premium
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Rankings</div>
                    <button className="bg-linear-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300">
                      ➕ Add keywords
                    </button>
                  </div>
                </div>
                {/* Metrics and other content for selected project */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-linear-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 p-6 rounded-xl border border-red-100 dark:border-red-800/30">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">🎯 Performance</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400 text-sm">On-page score</span>
                        <span className="bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 px-3 py-1 rounded-full text-sm font-bold">{selectedProject.onPageScore}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400 text-sm">Problems</span>
                        <span className="bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 px-3 py-1 rounded-full text-sm font-bold">{selectedProject.problems}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800/30">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">🔗 Links & Authority</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400 text-sm">Backlinks</span>
                        <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-bold">{selectedProject.backlinks}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400 text-sm">Pages</span>
                        <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-bold">{selectedProject.pages}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-linear-to-br from-gray-50 to-slate-50 dark:from-gray-700/20 dark:to-slate-700/20 p-6 rounded-xl border border-gray-100 dark:border-gray-600/30">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">🕷️ Crawl Status</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400 text-sm">Status</span>
                        <span className="bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 px-3 py-1 rounded-full text-sm font-bold">{selectedProject.crawlStatus}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400 text-sm">Last crawl</span>
                        <span className="text-gray-800 dark:text-gray-300 text-sm font-medium">{selectedProject.lastCrawl}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <button className="bg-linear-to-r from-green-500 to-emerald-500 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 text-sm sm:text-base">
                      🚀 Analyze
                    </button>
                    <button className="bg-linear-to-r from-purple-500 to-pink-500 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 text-sm sm:text-base">
                      📊 View Reports
                    </button>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center sm:text-right">
                    Last updated: {selectedProject.lastCrawl}
                  </div>
                </div>
              </div>
            ) : (
              // Show all projects when none selected
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 mx-auto mb-4 bg-linear-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center">
                    <span className="text-4xl">📊</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Project Selected</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Select a project from the dropdown above to view its details and analytics.</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-linear-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-300"
                  >
                    ✨ Create Your First Project
                  </button>
                </div>
              </div>
            )}            
          </div>
        )}

        {/* Create Project Modal */}
        <CreateProjectModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onProjectCreated={handleProjectCreated}
        />
      </div>
    </div>
  );
}