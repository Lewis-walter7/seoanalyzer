"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const prisma_module_1 = require("./prisma/prisma.module");
const crawler_module_1 = require("./crawler/crawler.module");
const auth_module_1 = require("./auth/auth.module");
const subscription_module_1 = require("./subscription/subscription.module");
const config_1 = require("@nestjs/config");
const projects_module_1 = require("./projects/projects.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            event_emitter_1.EventEmitterModule.forRoot(),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            crawler_module_1.CrawlerModule,
            subscription_module_1.SubscriptionModule,
            projects_module_1.ProjectsModule,
            config_1.ConfigModule.forRoot({ isGlobal: true })
        ],
        controllers: [],
        providers: [],
    })
], AppModule);
