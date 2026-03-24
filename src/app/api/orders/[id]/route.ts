import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyAdmin, unauthorizedResponse } from '@/lib/admin-auth'
import { isMockMode, mockOrders } from '@/lib/mock-data'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdmin(request)) return unauthorizedResponse()

  const { id } = await params

  if (isMockMode()) {
    mockOrders.delete(id)
    return Response.json({ success: true })
  }

  // order_items는 CASCADE로 자동 삭제
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true })
}
