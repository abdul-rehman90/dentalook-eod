'use client';

import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Modal } from 'antd';
import toast from 'react-hot-toast';
import { LeftOutlined } from '@ant-design/icons';
import { Button } from '@/common/components/button/button';
import { Stepper } from '@/common/components/stepper/stepper';
import { EODReportService } from '@/common/services/eod-report';
import { useGlobalContext } from '@/common/context/global-context';
import { redirect, usePathname, useRouter } from 'next/navigation';
import StepNavigation from '@/common/components/step-navigation/step-navigation';
import {
  Card,
  CardTitle,
  CardHeader,
  CardDescription
} from '@/common/components/card/card';

export default function SubmissionLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [saving, setSaving] = useState(false);
  const [formStatus, setFormStatus] = useState(null);
  const [pendingStep, setPendingStep] = useState(null);
  const [pendingPath, setPendingPath] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const {
    id,
    type,
    steps,
    isDirty,
    setDirty,
    setLoading,
    reportData,
    totalSteps,
    currentStep,
    callSaveHandlerForStep
  } = useGlobalContext();
  const submission_date =
    reportData?.eod?.basic?.clinicDetails?.submission_date;
  const submission_month = reportData?.eom?.basic?.submission_month;
  const isClosed = reportData?.eod?.basic?.clinicDetails?.status === 'close';
  const reportStatus = reportData?.eod?.basic?.clinicDetails?.status;
  const status = formStatus || reportStatus;
  const stepName = steps[currentStep - 1]?.name;
  const isReviewPath = pathname.includes('/review');

  if (currentStep > 1 && !id) {
    redirect(`/submission/${type}/1`);
  }

  const navigateToStep = (stepNumber) => {
    if (!id || isClosed) return;
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

  const handleSubmitEODReport = async (submission_id) => {
    try {
      setLoading(true);
      const response = await EODReportService.submissionEODReport({
        eodsubmission_id: submission_id
      });
      if (response.status === 200) {
        toast.success('EOD submission is successfully submitted');
        router.push('/review/list/eod');
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    try {
      if (status === 'close' && (id || formStatus === 'close')) {
        if (id) {
          await handleSubmitEODReport(id);
        } else {
          window.dispatchEvent(new CustomEvent('stepNavigationNext'));
        }
      } else {
        window.dispatchEvent(new CustomEvent('stepNavigationNext'));
      }
    } catch (error) {}
  };

  const handleSave = async () => {
    try {
      window.dispatchEvent(new CustomEvent('stepNavigationSave'));
    } catch (error) {}
  };

  const handleSaveAndContinue = async () => {
    setSaving(true);
    try {
      const success = await callSaveHandlerForStep(currentStep, false);
      if (success) {
        setDirty(false);
        if (pendingStep) navigateToStep(pendingStep);
        else if (pendingPath) router.push(pendingPath);
      }
    } finally {
      setSaving(false);
      setPendingStep(null);
      setPendingPath(null);
      setModalVisible(false);
    }
  };

  const handleDiscardAndContinue = () => {
    setDirty(false);
    setModalVisible(false);

    if (pendingStep) navigateToStep(pendingStep);
    else if (pendingPath) router.push(pendingPath);

    setPendingStep(null);
    setPendingPath(null);
  };

  useEffect(() => {
    const onGuardNavigate = (e) => {
      const url = e?.detail?.url;
      if (!url) return;
      setPendingPath(url);
      setModalVisible(true);
    };
    window.addEventListener('guard:navigate', onGuardNavigate);
    return () => {
      window.removeEventListener('guard:navigate', onGuardNavigate);
    };
  }, []);

  useEffect(() => {
    const handleFormStatusChange = (e) => {
      setFormStatus(e.detail.status);
    };

    window.addEventListener('formStatusChange', handleFormStatusChange);
    return () => {
      window.removeEventListener('formStatusChange', handleFormStatusChange);
    };
  }, []);

  useEffect(() => {
    const onDocumentClick = (e) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return;

      let el = e.target;
      while (el && el.tagName !== 'A') el = el.parentElement;
      if (!el) return;

      const href = el.getAttribute('href');
      if (!href) return;

      // Skip external links (starts with http or mailto or tel) or hash anchors
      if (href.startsWith('http') && !href.startsWith(window.location.origin)) {
        return;
      }
      if (href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if (href.startsWith('#')) return;

      // If it's the same pathname, ignore
      if (href === window.location.pathname) return;

      if (isDirty) {
        e.preventDefault();
        setPendingPath(href);
        setModalVisible(true);
      }
    };

    document.addEventListener('click', onDocumentClick, true); // capture phase
    return () => document.removeEventListener('click', onDocumentClick, true);
  }, [isDirty, pathname]);

  return (
    <div className="px-8 py-6 bg-[#FAFAFB] min-h-screen">
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
        <div className="w-full max-w-[220px]">
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
                <StepNavigation
                  onNext={handleNext}
                  onSave={handleSave}
                  isClinicClosed={status === 'close'}
                />
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
          <div
            className="flex items-center gap-4 justify-end px-6 py-4"
            key="footer"
          >
            <Button
              disabled={saving}
              variant="outline"
              onClick={handleDiscardAndContinue}
              className="h-10 !bg-red-500 !shadow-none !text-white !rounded-lg"
            >
              Discard & Continue
            </Button>
            <Button
              disabled={saving}
              isLoading={saving}
              onClick={handleSaveAndContinue}
              className="h-10 !shadow-none !rounded-lg min-w-42"
            >
              Save & Continue
            </Button>
          </div>
        ]}
      >
        <p className="text-gray-900 text-base">
          You have unsaved changes. Would you like to save before moving?
        </p>
      </Modal>
    </div>
  );
}
