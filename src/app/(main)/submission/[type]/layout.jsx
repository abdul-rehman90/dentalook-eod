'use client';

import React, { useState } from 'react';
import dayjs from 'dayjs';
import { Modal } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { redirect, useRouter } from 'next/navigation';
import { Button } from '@/common/components/button/button';
import { Stepper } from '@/common/components/stepper/stepper';
import { useGlobalContext } from '@/common/context/global-context';
import StepNavigation from '@/common/components/step-navigation/step-navigation';
import {
  Card,
  CardTitle,
  CardHeader,
  CardDescription
} from '@/common/components/card/card';

export default function SubmissionLayout({ children }) {
  const router = useRouter();
  const [pendingStep, setPendingStep] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const {
    id,
    type,
    steps,
    isDirty,
    setDirty,
    reportData,
    totalSteps,
    currentStep,
    callSaveHandlerForStep
  } = useGlobalContext();
  const submission_date =
    reportData?.eod?.basic?.clinicDetails?.submission_date;
  const submission_month = reportData?.eom?.basic?.submission_month;
  const stepName = steps[currentStep - 1]?.name;
  const pathname =
    typeof window !== 'undefined' ? window.location.pathname : '';
  const isReviewPath = pathname.includes('/review');

  if (currentStep > 1 && !id) {
    redirect(`/submission/${type}/1`);
  }

  const navigateToStep = (stepNumber) => {
    if (!id) return;
    if (isReviewPath) {
      router.push(`/review/${type}/${stepNumber}/${id}`);
    } else {
      router.push(`/submission/${type}/${stepNumber}/${id}`);
    }
  };

  const onStepperClick = (stepNumber) => {
    if (stepNumber === currentStep) return;
    if (isDirty) {
      setPendingStep(stepNumber);
      setModalVisible(true);
      return;
    }
    navigateToStep(stepNumber);
  };

  const handleNext = async () => {
    try {
      window.dispatchEvent(new CustomEvent('stepNavigationNext'));
    } catch (error) {}
  };

  const handleSave = async () => {
    try {
      window.dispatchEvent(new CustomEvent('stepNavigationSave'));
    } catch (error) {}
  };

  const handleSaveAndContinue = async () => {
    setModalVisible(false);

    try {
      const success = await callSaveHandlerForStep(currentStep, false);
      if (success) {
        setDirty(false);
        setPendingStep(null);
        setModalVisible(false);
        if (pendingStep) navigateToStep(pendingStep);
      }
    } catch {
    } finally {
      setPendingStep(null);
    }
  };

  const handleDiscardAndContinue = () => {
    setDirty(false);
    setPendingStep(null);
    setModalVisible(false);
    if (pendingStep) navigateToStep(pendingStep);
  };

  return (
    <div className="px-13 py-6 bg-[#FAFAFB] min-h-screen">
      <h1 className="flex items-center text-[18px] font-semibold text-black mb-7">
        <Button
          size="icon"
          className="mr-2"
          variant="destructive"
          onClick={() => router.back()}
        >
          <LeftOutlined />
        </Button>
        {stepName}
        {id &&
          (type === 'eod'
            ? ` - ${dayjs(submission_date).format('ddd, MMMM D, YYYY')}`
            : ` - ${dayjs(submission_month).format('MMM YYYY')}`)}
      </h1>
      <div className="flex gap-2">
        <div className="w-full max-w-[250px]">
          <Stepper onStepClick={onStepperClick} />
        </div>
        <div className="flex-1">
          <Card className="border !border-[#F7F7F7] bg-white !shadow-none !gap-4">
            <CardHeader className="!border-b-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm text-secondary-400">
                    Step {currentStep} of {totalSteps}
                  </CardTitle>
                  <CardDescription className="text-xl font-medium text-black mt-2">
                    {steps[currentStep - 1].name}
                  </CardDescription>
                </div>
                <StepNavigation onNext={handleNext} onSave={handleSave} />
              </div>
            </CardHeader>
            {children}
          </Card>
        </div>
      </div>
      <Modal
        centered
        width={550}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        title={
          <div className="p-4">
            <h4 className="text-lg font-semibold text-gray-800">
              Unsaved Changes
            </h4>
          </div>
        }
        footer={[
          <div className="flex items-center gap-4 justify-end px-6 py-4">
            <Button
              variant="outline"
              onClick={handleDiscardAndContinue}
              className="h-10 !shadow-none text-black !rounded-lg"
            >
              Discard & Continue
            </Button>
            <Button
              onClick={handleSaveAndContinue}
              className="h-10 !shadow-none text-black !rounded-lg"
            >
              Save & Continue
            </Button>
          </div>
        ]}
      >
        <p className="text-gray-900 text-base">
          You have unsaved changes on this step. Would you like to save before
          moving?
        </p>
      </Modal>
    </div>
  );
}
