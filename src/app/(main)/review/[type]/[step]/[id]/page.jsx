'use client';

import React from 'react';
import { Spin } from 'antd';
import { useRouter } from 'next/navigation';
import { useGlobalContext } from '@/common/context/global-context';
import {
  PaymentEOD,
  ReferralsEOD,
  BasicDetailsEOD,
  ActiveProviders,
  TeamAbsencesEOD,
  DailyProductionEOD,
  ScheduleOpeningEOD,
  PatientTrackingEOD,
  AttritionTrackingEOD
} from '@/components/review/eod';
import {
  SuppliesEOM,
  EquipmentEOM,
  IssuesIdeasEOM,
  BasicDetailsEOM,
  GoogleReviewsEOM,
  HiringTrainingEOM,
  ClinicalUpgradeEOM,
  AccountReceivableEOM
} from '@/components/review/eom';

export default function SubmissionPage() {
  const router = useRouter();
  const { id, type, loading, currentStep } = useGlobalContext();

  const stepComponents = {
    eod: {
      1: <BasicDetailsEOD onNext={handle} />,
      // 2: <ActiveProviders onNext={handle} />,
      2: <DailyProductionEOD onNext={handle} />,
      3: <PaymentEOD onNext={handle} />,
      4: <TeamAbsencesEOD onNext={handle} />,
      5: <PatientTrackingEOD onNext={handle} />,
      6: <AttritionTrackingEOD onNext={handle} />,
      7: <ReferralsEOD />
    },
    eom: {
      1: <BasicDetailsEOM onNext={handle} />,
      2: <AccountReceivableEOM onNext={handle} />,
      3: <EquipmentEOM onNext={handle} />,
      4: <ClinicalUpgradeEOM onNext={handle} />,
      5: <HiringTrainingEOM onNext={handle} />,
      6: <SuppliesEOM onNext={handle} />,
      7: <GoogleReviewsEOM onNext={handle} />,
      8: <IssuesIdeasEOM />
    }
  };

  function handle() {
    router.push(`/review/${type}/${currentStep + 1}/${id}`);
  }

  return (
    <div className="pt-6 border-t-1 border-t-secondary-50 ">
      <Spin spinning={loading}>{stepComponents[type][currentStep]}</Spin>
    </div>
  );
}
