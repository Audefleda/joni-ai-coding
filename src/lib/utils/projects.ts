import { TodoistProject } from '@/lib/todoist/types';

export function getProjectPath(
  projectId: string,
  projects: Record<string, TodoistProject>
): string {
  const parts: string[] = [];
  let current = projects[projectId];
  let depth = 0;

  while (current && depth < 10) {
    parts.unshift(current.name);
    current = current.parent_id ? projects[current.parent_id] : undefined!;
    depth++;
  }

  return parts.length > 0 ? parts.join(' › ') : 'Inbox';
}
