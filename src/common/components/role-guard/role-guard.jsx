'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  hasMissingDataAccess,
  hasClinicAdjustmentAccess,
  hasCollectionTrackerAccess
} from '@/common/utils/role-access';

export default function RoleGuard({
  children,
  requiredAccess = 'collection-tracker'
}) {
  const router = useRouter();

  useEffect(() => {
    if (
      requiredAccess === 'collection-tracker' &&
      !hasCollectionTrackerAccess()
    ) {
      router.push('/clinics-reporting');
    }
    if (
      requiredAccess === 'clinic-adjustment' &&
      !hasClinicAdjustmentAccess()
    ) {
      router.push('/clinics-reporting');
    }
    if (requiredAccess === 'missing-data' && !hasMissingDataAccess()) {
      router.push('/clinics-reporting');
    }
  }, [router, requiredAccess]);

  if (
    requiredAccess === 'collection-tracker' &&
    !hasCollectionTrackerAccess()
  ) {
    return null;
  }
  if (requiredAccess === 'clinic-adjustment' && !hasClinicAdjustmentAccess()) {
    return null;
  }
  if (requiredAccess === 'missing-data' && !hasMissingDataAccess()) {
    return null;
  }

  return children;
}
