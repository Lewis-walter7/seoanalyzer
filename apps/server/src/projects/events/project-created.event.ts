export class ProjectCreatedEvent {
  constructor(
    public readonly projectId: string,
    public readonly rootUrl: string,
    public readonly userId: string,
    public readonly projectName: string,
  ) {}
}
