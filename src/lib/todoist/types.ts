export interface TodoistTask {
  id: string;
  content: string;
  project_id: string;
  priority: 1 | 2 | 3 | 4;
  is_completed: boolean;
  due: { date: string; datetime?: string } | null;
}

export interface TodoistProject {
  id: string;
  name: string;
  parent_id: string | null;
}

export class UnauthorizedError extends Error {
  constructor() { super('Unauthorized'); this.name = 'UnauthorizedError'; }
}

export class NetworkError extends Error {
  constructor() { super('Network error'); this.name = 'NetworkError'; }
}

export class ServiceUnavailableError extends Error {
  constructor() { super('Service unavailable'); this.name = 'ServiceUnavailableError'; }
}
