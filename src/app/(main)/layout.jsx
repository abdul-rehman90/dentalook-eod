import React from 'react';
import Header from '@/common/components/header/header';

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen">
      <Header />
      {children}
    </div>
  );
}
