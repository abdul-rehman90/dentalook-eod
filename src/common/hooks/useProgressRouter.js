'use client';

import { useEffect, useCallback } from 'react';
import { useProgress } from '@bprogress/next/app';
import { useRouter, usePathname } from 'next/navigation';

export function useProgressRouter() {
  const router = useRouter();
  const pathname = usePathname();
  const progress = useProgress();

  // Finish progress when route actually changes
  useEffect(() => {
    progress.finish();
  }, [pathname, progress]);

  // Wrapper for router.push
  const push = useCallback(
    (url, options) => {
      progress.start();
      router.push(url, options);
    },
    [router, progress]
  );

  // Wrapper for router.replace
  const replace = useCallback(
    (url, options) => {
      progress.start();
      router.replace(url, options);
    },
    [router, progress]
  );

  return {
    push,
    replace,
    ...router
  };
}
