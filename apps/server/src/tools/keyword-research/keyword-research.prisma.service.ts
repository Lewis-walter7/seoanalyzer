import { Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class KeywordResearchPrismaService {
  async createKeywordResearch(
    prisma: Prisma.TransactionClient,
    data: Prisma.KeywordResearchCreateInput,
  ) {
    return prisma.keywordResearch.create({
      data,
    });
  }

  async getKeywordResearch(prisma: Prisma.TransactionClient, id: string) {
    return prisma.keywordResearch.findUnique({
      where: { id },
    });
  }

  async updateKeywordResearch(
    prisma: Prisma.TransactionClient,
    id: string,
    data: Prisma.KeywordResearchUpdateInput,
  ) {
    return prisma.keywordResearch.update({
      where: { id },
      data,
    });
  }

  async deleteKeywordResearch(prisma: Prisma.TransactionClient, id: string) {
    return prisma.keywordResearch.delete({
      where: { id },
    });
  }

  async getAllKeywordResearch(prisma: Prisma.TransactionClient, params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.KeywordResearchWhereUniqueInput;
    where?: Prisma.KeywordResearchWhereInput;
    orderBy?: Prisma.KeywordResearchOrderByWithRelationInput;
  }) {
    return prisma.keywordResearch.findMany({
      ...params,
    });
  }
}

