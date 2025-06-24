import React from 'react';
import { Button } from '../button/button';
import { usePathname, useRouter } from 'next/navigation';
import { useGlobalContext } from '@/common/context/global-context';

export default function StepNavigation({ onNext }) {
  const router = useRouter();
  const pathname = usePathname();
  const { id, type, loading, currentStep, totalSteps } = useGlobalContext();
  const isLastStep = currentStep === totalSteps;
  const isReviewPath = pathname.includes('/review');

  const handlePrevious = () => {
    if (isReviewPath) {
      router.push(`/review/${type}/${currentStep - 1}/${id}`);
    } else {
      router.push(`/submission/${type}/${currentStep - 1}/${id}`);
    }
  };

  const getNextButtonText = () => {
    if (isReviewPath && isLastStep) {
      return 'Close';
    }
    return isLastStep ? 'Submit' : 'Next';
  };

  return (
    <div className="flex items-center gap-4 border-t-1 border-t-secondary-50 mt-6 pt-6 px-6">
      {currentStep > 1 && (
        <Button
          size="lg"
          variant="outline"
          onClick={handlePrevious}
          className="h-9 !shadow-none text-black !rounded-lg"
        >
          Previous
        </Button>
      )}
      <Button
        size="lg"
        // isLoading={loading}
        onClick={() => onNext()}
        className="h-9 !shadow-none text-black !rounded-lg"
      >
        {getNextButtonText()}
      </Button>
    </div>
  );
}
