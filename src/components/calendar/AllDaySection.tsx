'use client';

import type { CalendarEvent } from '@/lib/calendar/types';

interface AllDaySectionProps {
  events: CalendarEvent[];
}

export default function AllDaySection({ events }: AllDaySectionProps) {
  if (events.length === 0) return null;

  return (
    <div className="mb-3 space-y-1.5" role="list" aria-label="Ganztaegige Termine">
      <span className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        Ganztaegig
      </span>
      {events.map((event) => (
        <div
          key={event.id}
          role="listitem"
          className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
        >
          {event.title}
        </div>
      ))}
    </div>
  );
}
