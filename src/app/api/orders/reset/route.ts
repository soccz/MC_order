import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyAdmin, unauthorizedResponse } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) return unauthorizedResponse()

  // order_items는 orders에 ON DELETE CASCADE이므로 orders만 삭제하면 됨
  const { error } = await supabase
    .from('orders')
    .delete()
    .gte('created_at', '2000-01-01') // 전체 삭제 (Supabase는 조건 없는 delete 불가)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ success: true })
}
