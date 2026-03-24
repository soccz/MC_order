import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyAdmin, unauthorizedResponse } from '@/lib/admin-auth'
import { isMockMode } from '@/lib/mock-data'

let mockConfig = { subsidy_per_person: 7000, order_open: true }

export async function GET() {
  if (isMockMode()) {
    return Response.json(mockConfig)
  }

  const { data, error } = await supabase
    .from('app_config')
    .select('key, value')

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const config: Record<string, string> = {}
  for (const row of data ?? []) {
    config[row.key] = row.value
  }

  return Response.json({
    subsidy_per_person: Number(config.subsidy_per_person ?? 0),
    order_open: config.order_open === 'true',
  })
}

export async function PUT(request: NextRequest) {
  if (!verifyAdmin(request)) return unauthorizedResponse()

  const body = await request.json()

  if (isMockMode()) {
    if (body.subsidy_per_person !== undefined) mockConfig.subsidy_per_person = body.subsidy_per_person
    if (body.order_open !== undefined) mockConfig.order_open = body.order_open
    return Response.json({ success: true })
  }

  const updates: { key: string; value: string }[] = []

  if (body.subsidy_per_person !== undefined) {
    updates.push({ key: 'subsidy_per_person', value: String(body.subsidy_per_person) })
  }
  if (body.order_open !== undefined) {
    updates.push({ key: 'order_open', value: String(body.order_open) })
  }

  for (const u of updates) {
    const { error } = await supabase
      .from('app_config')
      .update({ value: u.value, updated_at: new Date().toISOString() })
      .eq('key', u.key)

    if (error) return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ success: true })
}
