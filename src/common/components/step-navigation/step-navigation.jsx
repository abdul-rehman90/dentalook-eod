import React from 'react';
import { Button } from '../button/button';
import { useParams, useRouter } from 'next/navigation';
import { useGlobalContext } from '@/common/context/global-context';

export default function StepNavigation({ onNext }) {
  const router = useRouter();
  const { type, step } = useParams();
  const currentStep = parseInt(step);
  const { stepConfig } = useGlobalContext();
  const totalSteps = stepConfig[type].length;
  console.log('stepper');

  const handlePrevious = () => {
    if (currentStep > 1) {
      router.push(`/submission/${type}/${currentStep - 1}`);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      onNext();
    }
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
      {currentStep < totalSteps && (
        <Button
          size="lg"
          onClick={handleNext}
          className="h-9 !shadow-none text-black !rounded-lg"
        >
          Next
        </Button>
      )}
    </div>
  );
}
