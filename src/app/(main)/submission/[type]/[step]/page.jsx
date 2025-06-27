'use client';

import React from 'react';
import { Spin } from 'antd';
import { BasicDetailsEOM } from '@/components/submission/eom';
import { BasicDetailsEOD } from '@/components/submission/eod';
import { useGlobalContext } from '@/common/context/global-context';

export default function SubmissionPage() {
  const { type, loading } = useGlobalContext();

  return (
    <div className="pt-6 border-t-1 border-t-[#F3F3F5]">
      <Spin spinning={loading}>
        {type === 'eod' ? (
          <BasicDetailsEOD />
        ) : type === 'eom' ? (
          <BasicDetailsEOM />
        ) : null}
      </Spin>
    </div>
  );
}
