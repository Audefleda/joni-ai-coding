'use client';

import { useState, useEffect } from 'react';
import { getIcsUrl, setIcsUrl, removeIcsUrl } from '@/lib/storage';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import TimeGrid from './TimeGrid';
import IcsUrlForm from './IcsUrlForm';
import AllDaySection from './AllDaySection';
import CalendarErrorMessage from './CalendarErrorMessage';

export default function CalendarWidget() {
  const [icsUrl, setIcsUrlState] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Read ICS URL from localStorage on mount (client-side only).
  // localStorage is an external system unavailable during SSR — useEffect is the
  // correct place to read it. The `initialized` flag prevents hydration mismatches.
  useEffect(() => {
    setIcsUrlState(getIcsUrl()); // eslint-disable-line react-hooks/set-state-in-effect
    setInitialized(true);
  }, []);

  const { allDayEvents, timedEvents, isLoading, errorKind, refresh } =
    useCalendarEvents(initialized ? icsUrl : null);

  function handleSave(url: string) {
    setIcsUrl(url);
    setIcsUrlState(url);
  }

  function handleDisconnect() {
    removeIcsUrl();
    setIcsUrlState(null);
  }

  // Still reading from localStorage
  if (!initialized) {
    return (
      <section aria-label="Kalender-Zone" className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Kalender</h2>
        <div className="flex items-center justify-center py-8">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" aria-label="Lade..." />
        </div>
      </section>
    );
  }

  // No ICS URL configured
  if (!icsUrl) {
    return (
      <section aria-label="Kalender-Zone" className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Kalender</h2>
        <IcsUrlForm onSave={handleSave} />
        <TimeGrid />
      </section>
    );
  }

  return (
    <section aria-label="Kalender-Zone" className="flex flex-col gap-3">
      {/* Header with disconnect */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Kalender</h2>
        <button
          onClick={handleDisconnect}
          className="shrink-0 rounded px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          aria-label="Kalender-URL entfernen"
        >
          Trennen
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" aria-label="Lade Termine..." />
        </div>
      )}

      {/* Error */}
      {errorKind && !isLoading && (
        <CalendarErrorMessage errorKind={errorKind} onRetry={refresh} onDisconnect={handleDisconnect} />
      )}

      {/* Events */}
      {!isLoading && !errorKind && (
        <>
          <AllDaySection events={allDayEvents} />
          {allDayEvents.length === 0 && timedEvents.length === 0 && (
            <p className="py-2 text-center text-xs text-zinc-400 dark:text-zinc-500">
              Heute keine Termine
            </p>
          )}
        </>
      )}

      <TimeGrid events={!isLoading && !errorKind ? timedEvents : []} />
    </section>
  );
}
