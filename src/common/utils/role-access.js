export const ROLES = {
  LT: 'LT',
  AC: 'AC'
};

export const COLLECTION_TRACKER_ALLOWED_ROLES = [ROLES.LT, ROLES.AC];
export const CLINIC_ADJUSTMENT_ALLOWED_ROLES = [ROLES.LT];

export function getUserRole() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('role');
  }
  return null;
}

export function hasCollectionTrackerAccess() {
  const userRole = getUserRole();
  return COLLECTION_TRACKER_ALLOWED_ROLES.includes(userRole);
}

export function hasClinicAdjustmentAccess() {
  const userRole = getUserRole();
  return CLINIC_ADJUSTMENT_ALLOWED_ROLES.includes(userRole);
}

export function isACRoleRestricted(route) {
  const userRole = getUserRole();
  if (userRole !== ROLES.AC) return false;

  return !route.startsWith('/collection-tracker');
}
