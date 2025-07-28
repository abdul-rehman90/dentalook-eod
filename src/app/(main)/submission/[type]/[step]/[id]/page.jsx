'use client';

import React from 'react';
import { Spin } from 'antd';
import { useRouter } from 'next/navigation';
import { useGlobalContext } from '@/common/context/global-context';
import {
  PaymentEOD,
  SuppliesEOD,
  ReferralsEOD,
  BasicDetailsEOD,
  TeamAbsencesEOD,
  DailyProductionEOD,
  PatientTrackingEOD,
  AttritionTrackingEOD
} from '@/components/submission/eod';
import {
  SuppliesEOM,
  EquipmentEOM,
  IssuesIdeasEOM,
  BasicDetailsEOM,
  GoogleReviewsEOM,
  HiringTrainingEOM,
  ClinicalUpgradeEOM,
  AccountReceivableEOM
} from '@/components/submission/eom';

export default function SubmissionPage() {
  const router = useRouter();
  const { id, type, loading, currentStep } = useGlobalContext();

  const stepComponents = {
    eod: {
      1: <BasicDetailsEOD onNext={handle} />,
      2: <DailyProductionEOD onNext={handle} />,
      3: <PaymentEOD onNext={handle} />,
      4: <SuppliesEOD onNext={handle} />,
      5: <TeamAbsencesEOD onNext={handle} />,
      6: <PatientTrackingEOD onNext={handle} />,
      7: <AttritionTrackingEOD onNext={handle} />,
      8: <ReferralsEOD />
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
    router.push(`/submission/${type}/${currentStep + 1}/${id}`);
  }

  return (
    <div className="pt-6 border-t-1 border-t-secondary-50 ">
      <Spin spinning={loading}>{stepComponents[type][currentStep]}</Spin>
    </div>
  );
}
