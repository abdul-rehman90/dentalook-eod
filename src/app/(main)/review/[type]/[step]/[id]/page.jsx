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
} from '@/components/review/eod';
import {
  SuppliesEOM,
  EquipmentEOM,
  IssuesIdeasEOM,
  BasicDetailsEOM,
  GoogleReviewsEOM,
  HiringTrainingEOM,
  ClinicalUpgradeEOM,
  AccountReceivableEOM,
  MonthlyFileUploadsEOM
} from '@/components/review/eom';

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
      2: <MonthlyFileUploadsEOM onNext={handle} />,
      3: <AccountReceivableEOM onNext={handle} />,
      4: <EquipmentEOM onNext={handle} />,
      5: <ClinicalUpgradeEOM onNext={handle} />,
      6: <HiringTrainingEOM onNext={handle} />,
      7: <SuppliesEOM onNext={handle} />,
      8: <GoogleReviewsEOM onNext={handle} />,
      9: <IssuesIdeasEOM />
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
