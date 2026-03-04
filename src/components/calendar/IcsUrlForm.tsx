'use client';

import { useState } from 'react';

interface IcsUrlFormProps {
  onSave: (url: string) => void;
}

export default function IcsUrlForm({ onSave }: IcsUrlFormProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    const trimmed = url.trim();
    if (!trimmed) {
      setError('Bitte füge eine ICS-URL ein.');
      return;
    }
    try {
      const parsed = new URL(trimmed);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error();
      }
    } catch {
      setError('Ungültige URL. Sie muss mit https:// beginnen.');
      return;
    }
    setError(null);
    onSave(trimmed);
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-blue-600 dark:text-blue-400"
          aria-hidden="true"
        >
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
          <line x1="16" x2="16" y1="2" y2="6" />
          <line x1="8" x2="8" y1="2" y2="6" />
          <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
      </div>

      <div>
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Kalender verbinden
        </p>
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
          Füge deine Outlook ICS-URL ein, um Termine zu sehen.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <input
          type="password"
          value={url}
          onChange={(e) => { setUrl(e.target.value); setError(null); }}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder="https://outlook.office365.com/owa/calendar/..."
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-800 placeholder-zinc-400 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-blue-500"
          aria-label="Outlook ICS-URL"
          autoComplete="off"
        />
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </div>

      <button
        onClick={handleSave}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        Speichern
      </button>

      <details className="text-xs text-zinc-400 dark:text-zinc-500">
        <summary className="cursor-pointer select-none hover:text-zinc-600 dark:hover:text-zinc-300">
          Wo finde ich die ICS-URL?
        </summary>
        <ol className="mt-2 space-y-1 pl-3">
          <li>1. Öffne <a href="https://outlook.office365.com/calendar" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Outlook Web</a></li>
          <li>2. Einstellungen → Kalender → Freigegebene Kalender</li>
          <li>3. &quot;Kalender veröffentlichen&quot; → deinen Kalender wählen</li>
          <li>4. &quot;ICS&quot; Link kopieren</li>
        </ol>
      </details>
    </div>
  );
}
