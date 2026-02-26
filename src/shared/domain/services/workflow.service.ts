export class WorkflowService<TStatus extends string> {
  constructor(private readonly transitions: Map<TStatus, TStatus[]>) {}

  canTransition(from: TStatus, to: TStatus): boolean {
    const allowed = this.transitions.get(from);
    return allowed !== undefined && allowed.includes(to);
  }

  getAllowedTransitions(from: TStatus): TStatus[] {
    return this.transitions.get(from) ?? [];
  }
}
