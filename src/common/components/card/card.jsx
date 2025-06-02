import React from 'react';

function Card({ className = '', ...props }) {
  return (
    <div
      data-slot="card"
      className={`flex flex-col gap-6 rounded-xl border border-secondary-50 py-6 ${className}`}
      {...props}
    />
  );
}

function CardHeader({ className = '', ...props }) {
  return (
    <div
      data-slot="card-header"
      className={`@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 ${className}`}
      {...props}
    />
  );
}

function CardTitle({ className = '', ...props }) {
  return (
    <div
      data-slot="card-title"
      className={`leading-none ${className}`}
      {...props}
    />
  );
}

function CardDescription({ className = '', ...props }) {
  return (
    <div
      data-slot="card-description"
      className={`leading-none ${className}`}
      {...props}
    />
  );
}

function CardAction({ className = '', ...props }) {
  return (
    <div
      data-slot="card-action"
      className={`col-start-2 row-span-2 row-start-1 self-start justify-self-end ${className}`}
      {...props}
    />
  );
}

function CardContent({ className = '', ...props }) {
  return (
    <div data-slot="card-content" className={`px-6 ${className}`} {...props} />
  );
}

function CardFooter({ className = '', ...props }) {
  return (
    <div
      data-slot="card-footer"
      className={`flex items-center px-6 [.border-t]:pt-6 ${className}`}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent
};
