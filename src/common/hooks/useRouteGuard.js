'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useGlobalContext } from '@/common/context/global-context';

export function useRouteGuard(onBlockedNavigate) {
  const pathname = usePathname();
  const router = useRouter();
  const { isDirty } = useGlobalContext();

  useEffect(() => {
    const handler = (e) => {
      const target = e.target;
      if (target?.tagName === 'A') {
        const href = target.getAttribute('href');
        if (href && href !== pathname) {
          if (isDirty) {
            e.preventDefault();
            onBlockedNavigate(href);
          }
        }
      }
    };

    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, [isDirty, pathname, onBlockedNavigate, router]);
}
