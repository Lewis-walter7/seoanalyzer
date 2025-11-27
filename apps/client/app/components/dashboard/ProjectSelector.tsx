'use client';

import { useState } from 'react';
import { ChevronDown, Plus, Globe, Calendar, BarChart3, Settings, Trash2 } from 'lucide-react';
import { Project } from '@/hooks';

// interface Project {
//   id: string;
//   name: string;
//   url: string;
//   domain?: string;
//   onPageScore?: string;
//   problems?: string;
//   backlinks?: string;
//   crawlStatus: string;
//   lastCrawl?: string;
//   pages?: string;
//   createdAt?: Date;
// }

interface ProjectSelectorProps {
  projects: Project[];
  selectedProject: Project | null;
  onProjectSelect: (project: Project) => void;
  onCreateNew: () => void;
  onDeleteProject?: (projectId: string) => void;
}

export default function ProjectSelector({
  projects,
  selectedProject,
  onProjectSelect,
  onCreateNew,
  onDeleteProject
}: ProjectSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleProjectSelect = (project: Project) => {
    onProjectSelect(project);
    setIsOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'total failure':
      case 'partial failure':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'not started':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center bg-linear-to-r from-blue-500 to-purple-600 cursor-pointer text-white p-3 sm:p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-full lg:w-auto min-w-[280px]"
      >
        <div className="flex-1 lg:mr-3 text-left">
          {selectedProject ? (
            <>
              <p className="text-sm font-semibold truncate">{selectedProject.name}</p>
              <p className="text-xs opacity-90 truncate">{selectedProject.url}</p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold">No Project Selected</p>
              <p className="text-xs opacity-90">Click to select or create</p>
            </>
          )}
        </div>
        <ChevronDown
          className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 shadow-2xl rounded-xl z-50 w-full min-w-[320px] border border-gray-100 dark:border-gray-700 max-h-96 overflow-y-auto">
          {/* Create New Project Button */}
          <button
            onClick={() => {
              onCreateNew();
              setIsOpen(false);
            }}
            className="w-full bg-linear-to-r from-green-500 to-blue-500 text-white text-sm p-4 hover:from-green-600 hover:to-blue-600 transition-all duration-300 font-medium flex items-center rounded-t-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            ✨ Create New Project
          </button>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700"></div>

          {/* Projects List */}
          <div className="p-2">
            {projects.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No projects yet</p>
                <p className="text-sm">Create your first project to get started</p>
              </div>
            ) : (
              <div className="space-y-1">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 group ${selectedProject?.id === project.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    onClick={() => handleProjectSelect(project)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <Globe className="w-4 h-4 text-gray-400 shrink-0" />
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            {project.name}
                          </h3>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-2">
                          {project.url}
                        </p>

                        {/* Project Stats */}
                        <div className="flex items-center space-x-3 text-xs">
                          <span className={`px-2 py-1 rounded-full font-medium ${getStatusColor(project.crawlStatus)}`}>
                            {project.crawlStatus}
                          </span>
                          <div className="flex items-center text-gray-500 dark:text-gray-400">
                            <BarChart3 className="w-3 h-3 mr-1" />
                            {project.onPageScore}
                          </div>
                          <div className="flex items-center text-gray-500 dark:text-gray-400">
                            <Calendar className="w-3 h-3 mr-1" />
                            {project.lastCrawl}
                          </div>
                        </div>
                      </div>

                      {/* Project Actions */}
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Handle project settings
                            // Navigate to project settings page
                          }}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                          title="Project Settings"
                        >
                          <Settings className="w-3 h-3 text-gray-500" />
                        </button>
                        {onDeleteProject && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
                                onDeleteProject(project.id);
                              }
                            }}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Delete Project"
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {projects.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {projects.length} project{projects.length !== 1 ? 's' : ''} total
              </p>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
