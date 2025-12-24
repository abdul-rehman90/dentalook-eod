import MissingData from '@/components/missing-data';
import RoleGuard from '@/common/components/role-guard/role-guard';

export default function MissingDataPage() {
  return (
    <RoleGuard requiredAccess="missing-data">
      <MissingData />
    </RoleGuard>
  );
}
