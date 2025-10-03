import React from 'react';
import Image from 'next/image';
import { Icons } from '@/common/assets';
import { usePathname, useRouter } from 'next/navigation';
import { useGlobalContext } from '@/common/context/global-context';

function Stepper({ className = '', onStepClick }) {
  const router = useRouter();
  const pathname = usePathname();
  const isReviewPath = pathname.includes('/review');
  const isSubmissionPath = pathname.includes('/submission/');
  const { id, type, steps, currentStep } = useGlobalContext();

  const normalizedCurrentStep = Math.max(
    1,
    Math.min(currentStep, steps.length)
  );

  const handleStepClick = (stepNumber) => {
    if (onStepClick) {
      if (id) onStepClick(stepNumber);
      return;
    }

    // fallback behavior: original route push
    if (id && isReviewPath) {
      router.push(`/review/${type}/${stepNumber}/${id}`);
    } else if (id && isSubmissionPath) {
      router.push(`/submission/${type}/${stepNumber}/${id}`);
    }
  };

  return (
    <div
      className={`py-3 sticky flex flex-col gap-12 overflow-auto max-h-[calc(100vh-77px)] ${className}`}
    >
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < normalizedCurrentStep;
        const isCurrent = stepNumber === normalizedCurrentStep;
        const isUpcoming = stepNumber > normalizedCurrentStep;

        return (
          <div
            key={index}
            onClick={() => handleStepClick(stepNumber)}
            className={`flex items-center gap-2 transition-colors ${
              id ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
            }`}
          >
            <div
              className={`relative ${index !== steps.length - 1 ? 'step' : ''}`}
            >
              {isCompleted || isCurrent ? (
                <Image
                  alt="step-icon"
                  src={
                    isCompleted
                      ? Icons.completed
                      : isCurrent
                      ? Icons.pending
                      : ''
                  }
                />
              ) : (
                <div className="w-6 h-6 text-sm text-gray-800 font-medium flex items-center justify-center rounded-full border border-secondary-50">
                  {index + 1}
                </div>
              )}
            </div>
            <span
              className={`text-base font-medium ${
                isUpcoming ? 'opacity-60' : 'text-black'
              }`}
            >
              {step.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export { Stepper };
