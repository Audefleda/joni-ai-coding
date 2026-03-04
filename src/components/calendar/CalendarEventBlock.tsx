'use client';

import type { CalendarEvent } from '@/lib/calendar/types';

interface CalendarEventBlockProps {
  event: CalendarEvent;
  startHour: number;
  endHour: number;
  rowHeight: number;
}

export default function CalendarEventBlock({
  event,
  startHour,
  endHour,
  rowHeight,
}: CalendarEventBlockProps) {
  // Calculate position within the grid
  const eventStartFraction =
    event.startTime.getHours() + event.startTime.getMinutes() / 60;
  const eventEndFraction =
    event.endTime.getHours() + event.endTime.getMinutes() / 60;

  // Clamp to visible range
  const clampedStart = Math.max(eventStartFraction, startHour);
  const clampedEnd = Math.min(eventEndFraction, endHour);

  if (clampedEnd <= clampedStart) return null;

  const topPx = (clampedStart - startHour) * rowHeight;
  const heightPx = (clampedEnd - clampedStart) * rowHeight;

  // Determine if block is very small (less than ~20 minutes)
  const isCompact = heightPx < rowHeight * 0.4;

  return (
    <div
      className="absolute right-0 left-12 z-10 overflow-hidden rounded-md border border-blue-200 bg-blue-100/90 px-2 dark:border-blue-700 dark:bg-blue-900/70"
      style={{
        top: `${topPx}px`,
        height: `${Math.max(heightPx, 18)}px`,
      }}
      role="listitem"
      aria-label={event.title}
    >
      <div className="flex h-full items-center">
        <span
          className={`truncate font-medium text-blue-900 dark:text-blue-100 ${isCompact ? 'text-[10px]' : 'text-xs'}`}
        >
          {event.title}
        </span>
      </div>
    </div>
  );
}
