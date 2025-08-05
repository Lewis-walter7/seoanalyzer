import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PageSpeedTestService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createDto: { projectId: string }) {
    return {
      id: 'speed-' + Date.now(),
      projectId: createDto.projectId,
      loadTime: Math.floor(Math.random() * 5000),
      coreWebVitals: {
        lcp: Math.random() * 2.5,
        fid: Math.random() * 100,
        cls: Math.random() * 0.1
      },
      createdAt: new Date(),
      status: 'COMPLETED'
    };
  }

  async findAll(userId: string, filter: { projectId?: string }) {
    return [
      {
        id: 'speed-1',
        projectId: filter.projectId || 'project-1',
        loadTime: 2500,
        coreWebVitals: { lcp: 1.8, fid: 50, cls: 0.05 },
        createdAt: new Date(),
        status: 'COMPLETED'
      }
    ];
  }

  async findOne(userId: string, id: string) {
    return {
      id,
      projectId: 'project-1',
      loadTime: 2500,
      coreWebVitals: { lcp: 1.8, fid: 50, cls: 0.05 },
      createdAt: new Date(),
      status: 'COMPLETED'
    };
  }

  async remove(userId: string, id: string) {
    // Mock implementation
  }
}
