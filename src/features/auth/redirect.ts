export const LOGIN_PATH = '/login'
export const DASHBOARD_PATH = '/dashboard'

/**
 * Evita open redirect: só aceita caminhos internos da dashboard vindos do `?from=`.
 */
export function getSafeRedirect(from: unknown): string {
  if (typeof from !== 'string') return DASHBOARD_PATH
  const isInternalDashboardPath =
    from === DASHBOARD_PATH ||
    from.startsWith(`${DASHBOARD_PATH}?`) ||
    from.startsWith(`${DASHBOARD_PATH}/`)
  return isInternalDashboardPath && !from.includes('//') ? from : DASHBOARD_PATH
}
