'use client';

import type { CalendarErrorKind } from '@/lib/calendar/types';

interface CalendarErrorMessageProps {
  errorKind: CalendarErrorKind;
  onRetry?: () => void;
  onDisconnect?: () => void;
}

const ERROR_MESSAGES: Record<CalendarErrorKind, string> = {
  invalid_url: 'Die ICS-URL ist ungültig. Bitte Kalender neu verbinden.',
  fetch_error: 'Kalender konnte nicht abgerufen werden. Bitte URL prüfen.',
  network: 'Keine Verbindung. Bitte Internetverbindung prüfen.',
  unknown: 'Ein unbekannter Fehler ist aufgetreten.',
};

export default function CalendarErrorMessage({
  errorKind,
  onRetry,
  onDisconnect,
}: CalendarErrorMessageProps) {
  const message = ERROR_MESSAGES[errorKind];
  const showDisconnect = errorKind === 'invalid_url' || errorKind === 'fetch_error';
  const showRetry = errorKind === 'network' || errorKind === 'unknown';

  return (
    <div className="flex flex-col items-center gap-3 py-4 text-center" role="alert">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/40">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-amber-500"
          aria-hidden="true"
        >
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
      </div>

      <p className="max-w-[200px] text-xs text-zinc-600 dark:text-zinc-400">{message}</p>

      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Erneut versuchen
        </button>
      )}

      {showDisconnect && onDisconnect && (
        <button
          onClick={onDisconnect}
          className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Neu verbinden
        </button>
      )}
    </div>
  );
}
