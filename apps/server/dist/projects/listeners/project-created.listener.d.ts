import { ProjectCreatedEvent } from '../events/project-created.event';
export declare class ProjectCreatedListener {
    private readonly logger;
    handleProjectCreated(event: ProjectCreatedEvent): void;
}
