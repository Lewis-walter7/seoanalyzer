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
exports.SiteAuditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let SiteAuditService = class SiteAuditService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, createDto) {
        // This would trigger an actual site audit - for now return mock data
        return {
            id: 'audit-' + Date.now(),
            projectId: createDto.projectId,
            seoScore: Math.floor(Math.random() * 100),
            auditedAt: new Date(),
            status: 'COMPLETED'
        };
    }
    async findAll(userId, filter) {
        // Mock implementation - in real app would query SeoAudit model
        return [
            {
                id: 'audit-1',
                projectId: filter.projectId || 'project-1',
                seoScore: 85,
                auditedAt: new Date(),
                status: 'COMPLETED'
            }
        ];
    }
    async findOne(userId, id) {
        return {
            id,
            projectId: 'project-1',
            seoScore: 85,
            auditedAt: new Date(),
            status: 'COMPLETED'
        };
    }
    async remove(userId, id) {
        // Mock implementation - in real app would delete from SeoAudit model
    }
};
exports.SiteAuditService = SiteAuditService;
exports.SiteAuditService = SiteAuditService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SiteAuditService);
