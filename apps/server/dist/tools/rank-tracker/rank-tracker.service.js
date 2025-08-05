"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RankTrackerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let RankTrackerService = class RankTrackerService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, createDto) {
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
    async findAll(userId, filter) {
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
    async findOne(userId, id) {
        return this.prisma.rankHistory.findFirst({
            where: { id, userId },
        });
    }
    async remove(userId, id) {
        await this.prisma.rankHistory.delete({
            where: { id },
        });
    }
};
exports.RankTrackerService = RankTrackerService;
exports.RankTrackerService = RankTrackerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RankTrackerService);
