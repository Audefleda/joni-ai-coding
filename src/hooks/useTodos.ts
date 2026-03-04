'use client';

import { useState, useEffect } from 'react';
import { TodoistTask, TodoistProject, UnauthorizedError, NetworkError, ServiceUnavailableError } from '@/lib/todoist/types';
import { getTodayTasks, getProjects } from '@/lib/todoist/client';

export type FetchStatus = 'loading' | 'success' | 'error';
export type ErrorKind = 'unauthorized' | 'network' | 'unavailable' | 'unknown' | null;

export interface UseTodosResult {
  tasks: TodoistTask[];
  projects: Record<string, TodoistProject>;
  status: FetchStatus;
  errorKind: ErrorKind;
  refresh: () => void;
}

export function useTodos(apiKey: string): UseTodosResult {
  const [tasks, setTasks] = useState<TodoistTask[]>([]);
  const [projects, setProjects] = useState<Record<string, TodoistProject>>({});
  const [status, setStatus] = useState<FetchStatus>('loading');
  const [errorKind, setErrorKind] = useState<ErrorKind>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus('loading');
      setErrorKind(null);
      try {
        const [rawTasks, rawProjects] = await Promise.all([
          getTodayTasks(apiKey),
          getProjects(apiKey),
        ]);

        if (cancelled) return;

        const projectMap = Object.fromEntries(rawProjects.map((p) => [p.id, p]));

        const sorted = rawTasks
          .filter((t) => !t.is_completed && t.due !== null)
          .sort((a, b) => b.priority - a.priority || a.content.localeCompare(b.content));

        setTasks(sorted);
        setProjects(projectMap);
        setStatus('success');
      } catch (err) {
        if (cancelled) return;
        setStatus('error');
        if (err instanceof UnauthorizedError) setErrorKind('unauthorized');
        else if (err instanceof NetworkError) setErrorKind('network');
        else if (err instanceof ServiceUnavailableError) setErrorKind('unavailable');
        else setErrorKind('unknown');
      }
    }

    load();
    return () => { cancelled = true; };
  }, [apiKey, refreshCount]);

  return { tasks, projects, status, errorKind, refresh: () => setRefreshCount((c) => c + 1) };
}
