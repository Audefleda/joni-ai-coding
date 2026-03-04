'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getApiKey, setApiKey, removeApiKey, isLocalStorageAvailable } from '@/lib/storage';
import { validateApiKey } from '@/lib/todoist/client';
import { UnauthorizedError, NetworkError, ServiceUnavailableError } from '@/lib/todoist/types';

type FormState = 'idle' | 'validating' | 'success' | 'error_empty' | 'error_invalid' | 'error_network' | 'error_unavailable';

export default function ApiKeyForm({ initialError }: { initialError?: string }) {
  const [input, setInput] = useState('');
  const [formState, setFormState] = useState<FormState>(
    initialError === 'invalid_key' ? 'error_invalid' : 'idle'
  );
  const [hasKey, setHasKey] = useState(() => !!getApiKey());
  const [storageAvailable] = useState(() => {
    if (typeof window === 'undefined') return true;
    return isLocalStorageAvailable();
  });
  const router = useRouter();

  async function handleSave() {
    const trimmed = input.trim();
    if (!trimmed) {
      setFormState('error_empty');
      return;
    }
    setFormState('validating');
    try {
      await validateApiKey(trimmed);
      setApiKey(trimmed);
      setHasKey(true);
      setFormState('success');
      setTimeout(() => router.push('/today'), 800);
    } catch (err) {
      if (err instanceof UnauthorizedError) setFormState('error_invalid');
      else if (err instanceof NetworkError) setFormState('error_network');
      else if (err instanceof ServiceUnavailableError) setFormState('error_unavailable');
      else setFormState('error_invalid');
    }
  }

  function handleRemove() {
    removeApiKey();
    setHasKey(false);
    setInput('');
    setFormState('idle');
  }

  if (!storageAvailable) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
        Dein Browser erlaubt keine lokale Speicherung. Bitte deaktiviere den Privacy-Modus.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {hasKey && formState === 'idle' && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
          API-Key ist gespeichert.
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="api-key" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Todoist API-Key
        </label>
        <input
          id="api-key"
          type="password"
          value={input}
          onChange={(e) => { setInput(e.target.value); setFormState('idle'); }}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder="Deinen API-Key eingeben…"
          disabled={formState === 'validating' || formState === 'success'}
          autoComplete="off"
          className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
        />
      </div>

      {formState === 'error_empty' && (
        <p className="text-sm text-red-600 dark:text-red-400">Bitte gib einen API-Key ein.</p>
      )}
      {formState === 'error_invalid' && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {initialError === 'invalid_key'
            ? 'Dein gespeicherter API-Key ist ungültig. Bitte gib einen neuen ein.'
            : 'API-Key ungültig. Bitte prüfe deinen Key.'}
        </p>
      )}
      {formState === 'error_network' && (
        <p className="text-sm text-red-600 dark:text-red-400">
          Keine Verbindung. Bitte prüfe deine Internetverbindung.
        </p>
      )}
      {formState === 'error_unavailable' && (
        <p className="text-sm text-red-600 dark:text-red-400">
          Todoist ist gerade nicht erreichbar. Bitte versuche es später erneut.
        </p>
      )}
      {formState === 'success' && (
        <p className="text-sm text-green-600 dark:text-green-400">Verbindung erfolgreich ✓</p>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={formState === 'validating' || formState === 'success'}
          className="flex-1 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {formState === 'validating' ? 'Wird geprüft…' : 'Speichern'}
        </button>
        {hasKey && (
          <button
            onClick={handleRemove}
            disabled={formState === 'validating'}
            className="rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Entfernen
          </button>
        )}
      </div>

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        API-Key findest du unter{' '}
        <a
          href="https://app.todoist.com/app/settings/integrations/developer"
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-700 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
        >
          Todoist → Einstellungen → Integrationen
        </a>
      </p>
    </div>
  );
}
