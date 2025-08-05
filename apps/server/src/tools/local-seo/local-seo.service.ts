import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LocalSeoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createDto: { projectId: string; businessName: string; address: string; city: string; zipCode: string; country: string }) {
    const localListing = await this.prisma.localListing.create({
      data: {
        ...createDto,
        userId,
        napScore: Math.random() * 100,
        citationCount: Math.floor(Math.random() * 50),
        googleRating: Math.random() * 5,
        googleReviewCount: Math.floor(Math.random() * 100),
      },
    });
    return localListing;
  }

  async findAll(userId: string, filter: { projectId?: string }) {
    const localListings = await this.prisma.localListing.findMany({
      where: {
        userId,
        projectId: filter.projectId,
      },
    });
    return localListings;
  }

  async findOne(userId: string, id: string) {
    return this.prisma.localListing.findFirst({
      where: { id, userId },
    });
  }

  async remove(userId: string, id: string) {
    await this.prisma.localListing.delete({
      where: { id },
    });
  }
}
