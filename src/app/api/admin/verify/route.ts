import { NextRequest } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  if (verifyAdmin(request)) {
    return Response.json({ success: true })
  }
  return Response.json({ error: 'PIN이 올바르지 않습니다' }, { status: 401 })
}
