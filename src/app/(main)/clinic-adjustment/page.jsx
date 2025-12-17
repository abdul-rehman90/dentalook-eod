import React from 'react';
import ClinicAdjustmentPage from '@/components/clinic-adjustment';
import RoleGuard from '@/common/components/role-guard/role-guard';

export default async function ClinicAdjustment() {
  return (
    <RoleGuard requiredAccess="clinic-adjustment">
      <ClinicAdjustmentPage />
    </RoleGuard>
  );
}
