import { Suspense } from 'react';
import ApiKeyForm from '@/components/setup/ApiKeyForm';
import SetupPageClient from './SetupPageClient';

export default function SetupPage() {
  return (
    <main className="flex min-h-screen items-start justify-center bg-zinc-50 px-4 py-16 dark:bg-zinc-950">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">MyDayPlaner</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Verbinde dein Todoist-Konto, um loszulegen.
          </p>
        </div>
        <Suspense fallback={<ApiKeyForm />}>
          <SetupPageClient />
        </Suspense>
      </div>
    </main>
  );
}
