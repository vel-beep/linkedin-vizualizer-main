export function getUserName(): string {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.match(/(?:^|;\s*)site_user=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : ''
}
