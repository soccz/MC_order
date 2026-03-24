const ADMIN_PIN = process.env.ADMIN_PIN || '1004'

export function verifyAdmin(request: Request): boolean {
  const pin = request.headers.get('X-Admin-PIN')
  return pin === ADMIN_PIN
}

export function unauthorizedResponse() {
  return Response.json({ error: '관리자 인증이 필요합니다' }, { status: 401 })
}
