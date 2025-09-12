// components/GlobalLoader.js
'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function GlobalLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [previousPath, setPreviousPath] = useState(pathname);

  useEffect(() => {
    if (pathname !== previousPath) {
      setLoading(true); // start loader on path change
      setPreviousPath(pathname);

      // Wait a minimum time for user to see loader or until next render
      const timer = setTimeout(() => setLoading(false), 300);

      return () => clearTimeout(timer);
    }
  }, [pathname, previousPath]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
    </div>
  );
}
