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
exports.LocalSeoService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let LocalSeoService = class LocalSeoService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, createDto) {
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
    async findAll(userId, filter) {
        const localListings = await this.prisma.localListing.findMany({
            where: {
                userId,
                projectId: filter.projectId,
            },
        });
        return localListings;
    }
    async findOne(userId, id) {
        return this.prisma.localListing.findFirst({
            where: { id, userId },
        });
    }
    async remove(userId, id) {
        await this.prisma.localListing.delete({
            where: { id },
        });
    }
};
exports.LocalSeoService = LocalSeoService;
exports.LocalSeoService = LocalSeoService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LocalSeoService);
