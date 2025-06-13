import React from 'react';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center flex-col min-h-screen">
      <h1 className="text-black text-4xl text-center font-semibold mb-2.5">
        404 - Page Not Found
      </h1>
      <p className="text-lg text-gray-600 text-center">
        The page you are looking for does not exist.
      </p>
    </div>
  );
}
