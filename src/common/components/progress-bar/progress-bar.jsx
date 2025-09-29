'use client';

import { ProgressProvider } from '@bprogress/next/app';

const Providers = ({ children }) => {
  return (
    <ProgressProvider
      height="4px"
      color="#8ac6a1"
      shallowRouting
      options={{ showSpinner: false }}
    >
      {children}
    </ProgressProvider>
  );
};

export default Providers;
