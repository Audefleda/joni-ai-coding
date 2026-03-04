'use client';

import { useTodos } from '@/hooks/useTodos';
import { useTimeEstimates } from '@/hooks/useTimeEstimates';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TodoItem from './TodoItem';
import TodoSkeleton from './TodoSkeleton';
import TimeEstimateBubbles from './TimeEstimateBubbles';
import EstimateSummary from './EstimateSummary';

interface TodosZoneProps {
  apiKey: string;
}

export default function TodosZone({ apiKey }: TodosZoneProps) {
  const { tasks, projects, status, errorKind, refresh } = useTodos(apiKey);
  const router = useRouter();
  const taskIds = tasks.map((t) => t.id);
  const { estimates, setEstimate, totalMinutes } = useTimeEstimates(taskIds);

  useEffect(() => {
    if (errorKind === 'unauthorized') {
      router.replace('/setup?error=invalid_key');
    }
  }, [errorKind, router]);

  if (status === 'loading') {
    return (
      <section className="flex flex-col gap-4" aria-label="Heutige Aufgaben">
        <div className="mb-2 h-8 w-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-700" />
        <TodoSkeleton />
      </section>
    );
  }

  if (status === 'error' && errorKind !== 'unauthorized') {
    return (
      <section className="flex flex-col items-start gap-4" aria-label="Heutige Aufgaben">
        <p className="text-zinc-600 dark:text-zinc-400">
          {errorKind === 'network'
            ? 'Keine Verbindung. Bitte prüfe deine Internetverbindung.'
            : 'Todoist ist gerade nicht erreichbar. Bitte später versuchen.'}
        </p>
        <button
          onClick={refresh}
          className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Erneut versuchen
        </button>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4 overflow-y-auto" aria-label="Heutige Aufgaben">
      {/* Header row: title + refresh */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Todos
          {tasks.length > 0 && (
            <span className="ml-2 text-zinc-400 dark:text-zinc-500">({tasks.length})</span>
          )}
        </h2>
        <button
          onClick={refresh}
          className="rounded-lg px-3 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          aria-label="Aktualisieren"
        >
          Aktualisieren
        </button>
      </div>

      {/* Estimate summary */}
      <EstimateSummary totalMinutes={totalMinutes} />

      {/* Todo list */}
      {tasks.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">Keine Aufgaben für heute.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {tasks.map((task) => (
            <TodoItem key={task.id} task={task} projects={projects}>
              <TimeEstimateBubbles
                taskId={task.id}
                filled={estimates[task.id] ?? 0}
                onEstimate={setEstimate}
              />
            </TodoItem>
          ))}
        </div>
      )}
    </section>
  );
}
