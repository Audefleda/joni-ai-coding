'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getApiKey } from '@/lib/storage';
import ApiKeyForm from '@/components/setup/ApiKeyForm';

export default function SetupPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error') ?? undefined;

  useEffect(() => {
    if (!error && getApiKey()) {
      router.replace('/today');
    }
  }, [error, router]);

  return <ApiKeyForm initialError={error} />;
}
