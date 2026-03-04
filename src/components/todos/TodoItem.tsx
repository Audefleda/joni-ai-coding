import { ReactNode } from 'react';
import { TodoistTask, TodoistProject } from '@/lib/todoist/types';
import { getProjectPath } from '@/lib/utils/projects';

interface TodoItemProps {
  task: TodoistTask;
  projects: Record<string, TodoistProject>;
  children?: ReactNode;
}

const PRIORITY = {
  4: { strip: 'bg-red-500',    label: 'P1', text: 'text-red-600 dark:text-red-400' },
  3: { strip: 'bg-orange-400', label: 'P2', text: 'text-orange-600 dark:text-orange-400' },
  2: { strip: 'bg-blue-500',   label: 'P3', text: 'text-blue-600 dark:text-blue-400' },
  1: { strip: 'bg-zinc-200 dark:bg-zinc-700', label: '',  text: 'text-zinc-400' },
} as const;

function formatTime(datetime: string): string {
  return new Date(datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function TodoItem({ task, projects, children }: TodoItemProps) {
  const priority = PRIORITY[task.priority];
  const projectPath = getProjectPath(task.project_id, projects);
  const time = task.due?.datetime ? formatTime(task.due.datetime) : null;

  return (
    <div className="flex items-start gap-4 overflow-hidden rounded-xl border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className={`mt-0.5 h-4 w-1 shrink-0 rounded-full ${priority.strip}`} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="break-words font-medium text-zinc-900 dark:text-zinc-50">{task.content}</p>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          <span>{projectPath}</span>
          {time && (
            <>
              <span className="text-zinc-300 dark:text-zinc-600">·</span>
              <span>{time}</span>
            </>
          )}
          {priority.label && (
            <>
              <span className="text-zinc-300 dark:text-zinc-600">·</span>
              <span className={priority.text}>{priority.label}</span>
            </>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
