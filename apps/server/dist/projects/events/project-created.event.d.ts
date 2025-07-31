export declare class ProjectCreatedEvent {
    readonly projectId: string;
    readonly rootUrl: string;
    readonly userId: string;
    readonly projectName: string;
    constructor(projectId: string, rootUrl: string, userId: string, projectName: string);
}
