'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/app/components/providers/session-provider';
import { useRouter, useSearchParams } from 'next/navigation';

export interface Project {
  id: string;
  name: string;
  url: string;
  domain: string;
  description?: string;
  onPageScore?: string;
  problems?: string;
  backlinks?: string;
  crawlStatus: string;
  lastCrawl?: string;
  pages?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectsState {
  projects: Project[];
  selectedProject: Project | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

export interface CreateProjectData {
  name: string;
  url: string;
  description?: string;
  targetKeywords?: string[];
  competitors?: string[];
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const PROJECTS_CACHE_KEY = 'seo_analyzer_projects_cache';
const SELECTED_PROJECT_KEY = 'seo_analyzer_selected_project';

interface CachedProjectsData {
  projects: Project[];
  timestamp: number;
}

// Local storage helpers
const getCachedProjects = (): CachedProjectsData | null => {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(PROJECTS_CACHE_KEY);
    if (!cached) return null;
    const data = JSON.parse(cached) as CachedProjectsData;
    
    // Check if cache is still valid
    if (Date.now() - data.timestamp > CACHE_DURATION) {
      localStorage.removeItem(PROJECTS_CACHE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
};

const setCachedProjects = (projects: Project[]) => {
  if (typeof window === 'undefined') return;
  try {
    const data: CachedProjectsData = {
      projects,
      timestamp: Date.now()
    };
    localStorage.setItem(PROJECTS_CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to cache projects:', error);
  }
};

const getSelectedProjectId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SELECTED_PROJECT_KEY);
};

const setSelectedProjectId = (projectId: string | null) => {
  if (typeof window === 'undefined') return;
  if (projectId) {
    localStorage.setItem(SELECTED_PROJECT_KEY, projectId);
  } else {
    localStorage.removeItem(SELECTED_PROJECT_KEY);
  }
};

const clearProjectsCache = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PROJECTS_CACHE_KEY);
  localStorage.removeItem(SELECTED_PROJECT_KEY);
};

export const useProjects = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectIdFromUrl = searchParams.get('project');
  
  
  const [state, setState] = useState<ProjectsState>({
    projects: [],
    selectedProject: null,
    loading: false,
    error: null,
    lastFetched: null
  });

  const loadingRef = useRef(false);

  // Initialize from cache and URL params
  useEffect(() => {
    if (!isAuthenticated) {
      clearProjectsCache();
      return;
    }

    const cached = getCachedProjects();
    if (cached) {
      setState(prev => ({
        ...prev,
        projects: cached.projects,
        lastFetched: cached.timestamp
      }));

      // Set selected project from URL or localStorage
      const selectedId = projectIdFromUrl || getSelectedProjectId();
      if (selectedId) {
        const selectedProject = cached.projects.find(p => p.id === selectedId);
        if (selectedProject) {
          setState(prev => ({ ...prev, selectedProject }));
        }
      }
    }
  }, [isAuthenticated, projectIdFromUrl]);

  // Fetch projects from API
  const fetchProjects = useCallback(async (force = false) => {
    
    if (!isAuthenticated) {
      return;
    }
    
    if (loadingRef.current) {
      return;
    }

    // Check cache directly instead of using state
    if (!force) {
      const cached = getCachedProjects();
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return;
      }
    }

    loadingRef.current = true;
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await api.getProjects();
      
      // Handle different response formats
      let projects: Project[] = [];
      if (Array.isArray(response)) {
        projects = response;
      } else if (response && typeof response === 'object' && 'projects' in response) {
        projects = (response as any).projects || [];
      } else if (response && typeof response === 'object') {
        // Maybe the response is the projects array itself
        projects = Object.values(response).filter(item => 
          item && typeof item === 'object' && 'id' in item
        ) as Project[];
      }
      
      
      // Cache the projects
      setCachedProjects(projects);
      
      setState(prev => ({
        ...prev,
        projects,
        loading: false,
        lastFetched: Date.now()
      }));


      // Restore selected project if it still exists
      const selectedId = projectIdFromUrl || getSelectedProjectId();
      if (selectedId) {
        const selectedProject = projects.find(p => p.id === selectedId);
        if (selectedProject) {
          setState(prev => ({ ...prev, selectedProject }));
        } else {
          // Selected project no longer exists, clear it
          setSelectedProjectId(null);
          // Don't call updateUrlWithProject here to avoid circular dependency
        }
      }
    } catch (error) {
      console.error('❌ Failed to fetch projects:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch projects'
      }));
    } finally {
      loadingRef.current = false;
    }
  }, [isAuthenticated, projectIdFromUrl]); // Removed state.lastFetched dependency

  // Update URL with selected project
  const updateUrlWithProject = useCallback((project: Project | null) => {
    const params = new URLSearchParams(window.location.search);
    
    if (project) {
      params.set('project', project.id);
    } else {
      params.delete('project');
    }
    
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    
    // Use replace to avoid creating history entries for project selection
    router.replace(newUrl, { scroll: false });
  }, [router]);

  // Select a project
  const selectProject = useCallback((project: Project | null) => {
    setState(prev => ({ ...prev, selectedProject: project }));
    setSelectedProjectId(project?.id || null);
    updateUrlWithProject(project);
  }, [updateUrlWithProject]);

  // Create a new project
  const createProject = useCallback(async (projectData: CreateProjectData): Promise<{ success: boolean; project?: Project; error?: string }> => {
    if (!isAuthenticated) {
      return { success: false, error: 'You must be logged in to create a project' };
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await api.createBackendProject(projectData) as { project: Project };
      const newProject = response.project;

      // Update state with new project
      setState(prev => ({
        ...prev,
        projects: [newProject, ...prev.projects],
        selectedProject: newProject,
        loading: false
      }));

      // Update cache
      const updatedProjects = [newProject, ...state.projects];
      setCachedProjects(updatedProjects);
      
      // Select the new project and update URL
      setSelectedProjectId(newProject.id);
      updateUrlWithProject(newProject);

      return { success: true, project: newProject };
    } catch (error) {
      console.error('Failed to create project:', error);
      let errorMessage = 'Failed to create project';
      
      if (error instanceof Error) {
        // Handle specific error types
        if (error.message.includes('Project limit reached') || error.message.includes('maximum number of projects')) {
          errorMessage = error.message;
        } else if (error.message.includes('Invalid URL')) {
          errorMessage = 'Please enter a valid URL';
        } else if (error.message.includes('Validation failed')) {
          errorMessage = 'Please check your input and try again';
        } else {
          errorMessage = error.message;
        }
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));

      return { success: false, error: errorMessage };
    }
  }, [isAuthenticated, state.projects, updateUrlWithProject]);

  // Delete a project
  const deleteProject = useCallback(async (projectId: string): Promise<{ success: boolean; error?: string }> => {
    if (!isAuthenticated) {
      return { success: false, error: 'You must be logged in to delete a project' };
    }

    try {
      await api.deleteBackendProject(projectId);
      
      // Update state
      setState(prev => {
        const updatedProjects = prev.projects.filter(p => p.id !== projectId);
        const wasSelected = prev.selectedProject?.id === projectId;
        
        return {
          ...prev,
          projects: updatedProjects,
          selectedProject: wasSelected ? null : prev.selectedProject
        };
      });

      // Update cache
      const updatedProjects = state.projects.filter(p => p.id !== projectId);
      setCachedProjects(updatedProjects);
      
      // Clear selection if deleted project was selected
      if (state.selectedProject?.id === projectId) {
        setSelectedProjectId(null);
        updateUrlWithProject(null);
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to delete project:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete project';
      return { success: false, error: errorMessage };
    }
  }, [isAuthenticated, state.projects, state.selectedProject, updateUrlWithProject]);

  // Refresh projects (force fetch)
  const refreshProjects = useCallback(() => {
    return fetchProjects(true);
  }, [fetchProjects]);

  // Clear cache and reset state
  const clearCache = useCallback(() => {
    clearProjectsCache();
    setState({
      projects: [],
      selectedProject: null,
      loading: false,
      error: null,
      lastFetched: null
    });
  }, []);

  // Auto-fetch on mount and when authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
    } else {
      clearCache();
    }
  }, [isAuthenticated]); // Remove fetchProjects and clearCache from dependencies

  return {
    ...state,
    selectProject,
    createProject,
    deleteProject,
    refreshProjects,
    clearCache,
    fetchProjects
  };
};
