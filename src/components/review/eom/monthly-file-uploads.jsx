import React from 'react';
import { useGlobalContext } from '@/common/context/global-context';
import FileUploadSection from '../../submission/eom/file-upload-section';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

export default function MonthlyFileUploads({ onNext }) {
  const { id } = useGlobalContext();

  return (
    <React.Fragment>
      <div className="px-6">
        <FileUploadSection eomSubmissionId={id} />
      </div>
      <StepNavigation
        onNext={onNext}
        className="border-t-1 border-t-[#F3F3F5] mt-6 pt-6 px-6"
      />
    </React.Fragment>
  );
}
