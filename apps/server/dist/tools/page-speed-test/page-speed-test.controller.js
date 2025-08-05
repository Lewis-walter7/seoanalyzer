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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageSpeedTestController = void 0;
const common_1 = require("@nestjs/common");
const page_speed_test_service_1 = require("./page-speed-test.service");
const auth_guard_1 = require("../../auth/auth.guard");
const user_decorator_1 = require("../../auth/user.decorator");
let PageSpeedTestController = class PageSpeedTestController {
    pageSpeedTestService;
    constructor(pageSpeedTestService) {
        this.pageSpeedTestService = pageSpeedTestService;
    }
    async createPageSpeedTest(user, createDto) {
        return this.pageSpeedTestService.create(user.id, createDto);
    }
    async getAllPageSpeedTests(user, projectId) {
        return this.pageSpeedTestService.findAll(user.id, { projectId });
    }
    async getPageSpeedTest(user, id) {
        return this.pageSpeedTestService.findOne(user.id, id);
    }
    async deletePageSpeedTest(user, id) {
        await this.pageSpeedTestService.remove(user.id, id);
    }
};
exports.PageSpeedTestController = PageSpeedTestController;
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PageSpeedTestController.prototype, "createPageSpeedTest", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PageSpeedTestController.prototype, "getAllPageSpeedTests", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)(':id'),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PageSpeedTestController.prototype, "getPageSpeedTest", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PageSpeedTestController.prototype, "deletePageSpeedTest", null);
exports.PageSpeedTestController = PageSpeedTestController = __decorate([
    (0, common_1.Controller)('api/tools/page-speed-test'),
    __metadata("design:paramtypes", [page_speed_test_service_1.PageSpeedTestService])
], PageSpeedTestController);
