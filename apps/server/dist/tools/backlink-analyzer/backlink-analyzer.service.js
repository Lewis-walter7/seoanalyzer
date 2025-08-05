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
exports.BacklinkAnalyzerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let BacklinkAnalyzerService = class BacklinkAnalyzerService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, createDto) {
        return {
            id: 'backlink-' + Date.now(),
            projectId: createDto.projectId,
            backlinks: [
                'https://example.com/link1',
                'https://example.com/link2'
            ],
            createdAt: new Date(),
            status: 'COMPLETED'
        };
    }
    async findAll(userId, filter) {
        return [
            {
                id: 'backlink-1',
                projectId: filter.projectId || 'project-1',
                backlinks: ['https://example.com/link1'],
                createdAt: new Date(),
                status: 'COMPLETED'
            }
        ];
    }
    async findOne(userId, id) {
        return {
            id,
            projectId: 'project-1',
            backlinks: ['https://example.com/link1'],
            createdAt: new Date(),
            status: 'COMPLETED'
        };
    }
    async remove(userId, id) {
        // Mock implementation
    }
};
exports.BacklinkAnalyzerService = BacklinkAnalyzerService;
exports.BacklinkAnalyzerService = BacklinkAnalyzerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BacklinkAnalyzerService);
