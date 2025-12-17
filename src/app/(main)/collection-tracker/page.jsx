import CollectionTracker from '@/components/collection-tracker';
import RoleGuard from '@/common/components/role-guard/role-guard';

export default function CollectionTrackerPage() {
  return (
    <RoleGuard requiredAccess="collection-tracker">
      <CollectionTracker />
    </RoleGuard>
  );
}
