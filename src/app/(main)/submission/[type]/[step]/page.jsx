'use client';

import React from 'react';
import { BasicDetailsEOM } from '@/components/submission/eom';
import { BasicDetailsEOD } from '@/components/submission/eod';
import { useGlobalContext } from '@/common/context/global-context';

export default function SubmissionPage() {
  const { type } = useGlobalContext();

  return (
    <div className="pt-6 border-t-1 border-t-secondary-50 ">
      {type === 'eod' ? (
        <BasicDetailsEOD />
      ) : type === 'eom' ? (
        <BasicDetailsEOM />
      ) : null}
    </div>
  );
}
