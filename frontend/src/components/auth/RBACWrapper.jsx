/**
 * Gates its children to a set of allowed roles. Pair with a server-side
 * check in the API — this only prevents the UI from rendering, it is not
 * the security boundary.
 *
 * <RBACWrapper role={user.role} allow={['dermatologist', 'admin']}>
 *   <ClinicalReportButton />
 * </RBACWrapper>
 */
export default function RBACWrapper({ role, allow = [], fallback = null, children }) {
  const permitted = allow.includes(role);
  if (!permitted) return fallback;
  return children;
}
