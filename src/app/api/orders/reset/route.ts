import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyAdmin, unauthorizedResponse } from '@/lib/admin-auth'
import { isMockMode, mockOrders } from '@/lib/mock-data'

export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) return unauthorizedResponse()

  if (isMockMode()) {
    mockOrders.clear()
    return Response.json({ success: true })
  }

  const { error } = await supabase
    .from('orders')
    .delete()
    .gte('created_at', '2000-01-01') // 전체 삭제 (Supabase는 조건 없는 delete 불가)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ success: true })
}
