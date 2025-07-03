'use client';

import React from 'react';
import { ListEOM } from '@/components/review/eom';
import { ListEOD } from '@/components/review/eod';
import { useGlobalContext } from '@/common/context/global-context';

export default function ListEODPage() {
  const { type } = useGlobalContext();

  return (
    <div className="px-13 py-6 bg-gray-50 min-h-[calc(100vh-86px)]">
      <div className="px-8 py-4 bg-white border border-secondary-50 rounded-tl-[5px] rounded-tr-[5px]">
        <div className="flex items-center text-[18px] font-semibold text-black">
          List {type.toUpperCase()} Clinic Submission
          <div className="w-11 h-6 bg-primary-50 text-sm font-semibold text-primary-400 rounded-full flex items-center justify-center ml-3">
            New
          </div>
        </div>
      </div>
      <div className="p-4 border-[1px] border-t-0 border-solid border-secondary-50">
        <div className="border border-solid border-secondary-50 rounded-md">
          {type === 'eod' ? <ListEOD /> : <ListEOM />}
        </div>
      </div>
    </div>
  );
}
