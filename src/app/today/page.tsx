'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { getApiKey } from '@/lib/storage';
import DashboardShell from '@/components/dashboard/DashboardShell';

function subscribeToStorage(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

export default function TodayPage() {
  const router = useRouter();
  const apiKey = useSyncExternalStore(subscribeToStorage, getApiKey, () => null);

  useEffect(() => {
    if (!apiKey) {
      router.replace('/setup');
    }
  }, [apiKey, router]);

  if (!apiKey) return null;

  return (
    <main>
      <DashboardShell apiKey={apiKey} />
    </main>
  );
}
