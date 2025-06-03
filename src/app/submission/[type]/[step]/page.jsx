'use client';

import React from 'react';
import { LeftOutlined } from '@ant-design/icons';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/common/components/button/button';
import { useGlobalContext } from '@/common/context/global-context';
import {
  Card,
  CardTitle,
  CardHeader,
  CardDescription
} from '@/common/components/card/card';
import {
  PaymentEOD,
  ReferralsEOD,
  BasicDetailsEOD,
  TeamAbsencesEOD,
  DailyProductionEOD,
  ScheduleOpeningEOD,
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
  const { type, step } = useParams();
  const currentStep = parseInt(step);
  const { stepConfig } = useGlobalContext();
  const totalSteps = stepConfig[type].length;

  const stepComponents = {
    eod: {
      1: <BasicDetailsEOD onNext={handle} />,
      2: <DailyProductionEOD onNext={handle} />,
      3: <PaymentEOD onNext={handle} />,
      4: <TeamAbsencesEOD onNext={handle} />,
      5: <ScheduleOpeningEOD onNext={handle} />,
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
    router.push(`/submission/${type}/${currentStep + 1}`);
  }

  return (
    <div className="flex-1 bg-gray-50 border border-secondary-50 rounded-r-lg">
      <Card className="!py-4 !border-0 bg-white !shadow-none !rounded-none">
        <div className="flex items-center justify-between px-5">
          <CardTitle className="flex items-center text-[18px] font-semibold text-black">
            <Button
              size="icon"
              className="mr-2"
              variant="destructive"
              onClick={() => router.push('/clinics-reporting')}
            >
              <LeftOutlined />
            </Button>
            Submit End Of {type === 'eod' ? 'Day' : 'Month'}
            <div className="w-11 h-6 bg-primary-50 text-sm font-semibold text-primary-400 rounded-full flex items-center justify-center ml-3">
              New
            </div>
          </CardTitle>
          <div className="flex items-center gap-4">
            <Button
              size="lg"
              variant="outline"
              className="h-9 !shadow-none text-black !rounded-lg"
            >
              Cancel
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="h-9 !shadow-none text-black !rounded-lg"
            >
              Submit
            </Button>
          </div>
        </div>
      </Card>
      <div className="p-4">
        <Card className="bg-white !shadow-none !py-5">
          <CardHeader className="!border-b-0 !px-4">
            <CardTitle className="text-sm text-secondary-400">
              Step {currentStep} of {totalSteps}
            </CardTitle>
            <CardDescription className="text-xl font-medium text-black">
              {stepConfig[type][currentStep - 1]}
            </CardDescription>
          </CardHeader>
          <div className="pt-6 border-t-1 border-t-secondary-50 ">
            {stepComponents[type][currentStep]}
          </div>
        </Card>
      </div>
    </div>
  );
}
