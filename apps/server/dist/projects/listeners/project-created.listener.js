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
var ProjectCreatedListener_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectCreatedListener = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const project_created_event_1 = require("../events/project-created.event");
let ProjectCreatedListener = ProjectCreatedListener_1 = class ProjectCreatedListener {
    logger = new common_1.Logger(ProjectCreatedListener_1.name);
    handleProjectCreated(event) {
        this.logger.log(`Project created event received: ${event.projectName} (${event.projectId}) for user ${event.userId} with URL ${event.rootUrl}`);
        // Here you can add any side effects that should happen when a project is created
        // For example:
        // - Send welcome email
        // - Initialize analytics tracking
        // - Create default settings
        // - Log to analytics service
        // - Trigger initial crawl job
    }
};
exports.ProjectCreatedListener = ProjectCreatedListener;
__decorate([
    (0, event_emitter_1.OnEvent)('project.created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [project_created_event_1.ProjectCreatedEvent]),
    __metadata("design:returntype", void 0)
], ProjectCreatedListener.prototype, "handleProjectCreated", null);
exports.ProjectCreatedListener = ProjectCreatedListener = ProjectCreatedListener_1 = __decorate([
    (0, common_1.Injectable)()
], ProjectCreatedListener);
