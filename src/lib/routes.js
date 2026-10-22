export const PRIVACY_PATH = '/privacy-policy/'
export const TERMS_PATH = '/terms-of-service/'

// Normalise to a trailing slash so /terms-of-service and /terms-of-service/ match.
export function currentPath() {
  const p = window.location.pathname
  return p.endsWith('/') ? p : `${p}/`
}
