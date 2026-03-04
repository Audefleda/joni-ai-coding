'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getApiKey } from '@/lib/storage';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (getApiKey()) {
      router.replace('/today');
    } else {
      router.replace('/setup');
    }
  }, [router]);

  return null;
}
