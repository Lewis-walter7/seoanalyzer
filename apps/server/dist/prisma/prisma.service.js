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
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let PrismaService = class PrismaService extends client_1.PrismaClient {
    constructor() {
        super({
            // Enable query logging in development
            log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
        });
    }
    async onModuleInit() {
        // Connect to the database when the module is initialized
        await this.$connect();
        console.log('📊 Connected to MongoDB via Prisma');
    }
    async onModuleDestroy() {
        // Disconnect from the database when the module is destroyed
        await this.$disconnect();
        console.log('📊 Disconnected from MongoDB');
    }
    // Helper method to check database connection
    async isHealthy() {
        try {
            // Simple MongoDB health check - try to connect and perform a basic operation
            await this.$connect();
            return true;
        }
        catch (error) {
            console.error('Database health check failed:', error);
            return false;
        }
    }
    // Helper method to get database stats
    async getDatabaseStats() {
        const [projectCount, crawlJobCount, pageCount, seoAuditCount] = await Promise.all([
            this.project.count(),
            this.crawlJob.count(),
            this.page.count(),
            this.seoAudit.count(),
        ]);
        return {
            totalProjects: projectCount,
            totalCrawlJobs: crawlJobCount,
            totalPages: pageCount,
            totalSeoAudits: seoAuditCount,
        };
    }
    // Helper method to clean up old data
    async cleanupOldCrawls(daysOld = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        const result = await this.crawlJob.deleteMany({
            where: {
                createdAt: {
                    lt: cutoffDate,
                },
            },
        });
        console.log(`🧹 Cleaned up ${result.count} old crawl jobs`);
        return result.count;
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
