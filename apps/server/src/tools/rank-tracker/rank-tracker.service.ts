import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RankTrackerService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createDto: { projectId: string; keyword: string }) {
    // Create rank history entry
    const rankEntry = await this.prisma.rankHistory.create({
      data: {
        keyword: createDto.keyword,
        position: Math.floor(Math.random() * 100) + 1,
        projectId: createDto.projectId,
        userId,
      },
    });
    return rankEntry;
  }

  async findAll(userId: string, filter: { projectId?: string }) {
    const rankHistory = await this.prisma.rankHistory.findMany({
      where: {
        userId,
        projectId: filter.projectId,
      },
      orderBy: {
        recordedAt: 'desc',
      },
    });
    return rankHistory;
  }

  async findOne(userId: string, id: string) {
    return this.prisma.rankHistory.findFirst({
      where: { id, userId },
    });
  }

  async remove(userId: string, id: string) {
    await this.prisma.rankHistory.delete({
      where: { id },
    });
  }
}
