'use client';

import { useState, useEffect } from 'react';
import type { CalendarEvent } from '@/lib/calendar/types';
import CalendarEventBlock from './CalendarEventBlock';

const START_HOUR = 6;
const END_HOUR = 22;
const ROW_HEIGHT = 32; // h-8 = 2rem = 32px
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

function formatHour(hour: number): string {
  return `${hour.toString().padStart(2, '0')}:00`;
}

function getCurrentHourFraction(): number {
  const now = new Date();
  return now.getHours() + now.getMinutes() / 60;
}

interface TimeGridProps {
  events?: CalendarEvent[];
}

export default function TimeGrid({ events = [] }: TimeGridProps) {
  const [currentTime, setCurrentTime] = useState<number>(getCurrentHourFraction);

  useEffect(() => {
    // Update every minute
    const interval = setInterval(() => {
      setCurrentTime(getCurrentHourFraction());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const isWithinRange = currentTime >= START_HOUR && currentTime <= END_HOUR;
  // Position as pixel offset for precise alignment with rows
  const nowPositionPx = isWithinRange
    ? (currentTime - START_HOUR) * ROW_HEIGHT
    : null;

  // Filter timed events (all-day events are handled separately)
  const timedEvents = events.filter((e) => !e.isAllDay);

  return (
    <section
      className="relative flex flex-col"
      aria-label="Tages-Kalender"
    >
      <div className="relative flex flex-col" role="list" aria-label="Stunden-Raster">
        {HOURS.map((hour) => (
          <div
            key={hour}
            className="flex h-8 items-center border-b border-zinc-100 dark:border-zinc-800"
            role="listitem"
          >
            <span className="w-12 shrink-0 text-xs tabular-nums text-zinc-400 dark:text-zinc-500">
              {formatHour(hour)}
            </span>
            <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
          </div>
        ))}

        {/* Calendar event overlays */}
        {timedEvents.map((event) => (
          <CalendarEventBlock
            key={event.id}
            event={event}
            startHour={START_HOUR}
            endHour={END_HOUR}
            rowHeight={ROW_HEIGHT}
          />
        ))}

        {/* Current time indicator */}
        {nowPositionPx !== null && (
          <div
            className="absolute right-0 left-12 z-20 h-0.5 bg-red-500"
            style={{ top: `${nowPositionPx}px` }}
            role="presentation"
            aria-label={`Aktuelle Uhrzeit: ${new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`}
          >
            <div className="absolute -top-1 -left-1.5 h-2.5 w-2.5 rounded-full bg-red-500" />
          </div>
        )}
      </div>
    </section>
  );
}
