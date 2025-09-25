import React from 'react';

export default function ClinicsLayout({ children }) {
  return (
    <div className="px-13 py-6 bg-gray-50 min-h-[calc(100vh-86px)]">
      <div className="p-5 rounded-lg bg-white border border-secondary-50">
        {children}
      </div>
    </div>
  );
}
