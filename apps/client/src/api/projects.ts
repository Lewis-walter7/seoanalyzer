import { externalApi } from '@/lib/api';

// Type definitions for the analyze project response
export interface AnalyzeProjectResponse {
  message: string;
  status: string;
  crawlJobId?: string;
  [key: string]: any; // Allow for additional properties
}

/**
 * Initiates project analysis for the specified project
 * @param projectId - The unique identifier of the project to analyze
 * @returns Promise<AnalyzeProjectResponse> - The analysis response
 * @throws Error if the request fails
 */
export async function analyzeProject(projectId: string): Promise<AnalyzeProjectResponse> {
  return externalApi.post(`/v1/projects/${projectId}/analyze`);
}
