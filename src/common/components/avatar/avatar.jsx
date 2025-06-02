import React from 'react';

function Avatar({ className = '', ...props }) {
  return (
    <div
      data-slot="avatar"
      className={`relative flex size-8 shrink-0 overflow-hidden rounded-md ${className}`}
      {...props}
    />
  );
}

function AvatarImage({ className = '', src, alt, ...props }) {
  return (
    <img
      data-slot="avatar-image"
      src={src}
      alt={alt}
      className={`aspect-square size-full ${className}`}
      {...props}
    />
  );
}

function AvatarFallback({ className = '', children, ...props }) {
  return (
    <div
      data-slot="avatar-fallback"
      className={`bg-gray-200 flex size-full items-center justify-center rounded-md ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export { Avatar, AvatarImage, AvatarFallback };
