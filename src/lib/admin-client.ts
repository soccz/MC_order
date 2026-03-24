/** 클라이언트 사이드 관리자 헬퍼 */

export function getAdminPin(): string {
  if (typeof window === 'undefined') return ''
  return sessionStorage.getItem('admin_pin') || ''
}

export function adminHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-Admin-PIN': getAdminPin(),
  }
}
