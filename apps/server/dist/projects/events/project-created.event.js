"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectCreatedEvent = void 0;
class ProjectCreatedEvent {
    projectId;
    rootUrl;
    userId;
    projectName;
    constructor(projectId, rootUrl, userId, projectName) {
        this.projectId = projectId;
        this.rootUrl = rootUrl;
        this.userId = userId;
        this.projectName = projectName;
    }
}
exports.ProjectCreatedEvent = ProjectCreatedEvent;
