import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyAdmin, unauthorizedResponse } from '@/lib/admin-auth'
import { isMockMode, MOCK_MEMBERS } from '@/lib/mock-data'

const mockMembers = [...MOCK_MEMBERS]

export async function GET() {
  if (isMockMode()) {
    return Response.json(mockMembers.filter(m => m.is_active))
  }

  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) return unauthorizedResponse()

  const { name } = await request.json()
  if (!name?.trim()) {
    return Response.json({ error: '이름을 입력해주세요' }, { status: 400 })
  }

  if (isMockMode()) {
    const existing = mockMembers.find(m => m.name === name.trim())
    if (existing) {
      existing.is_active = true
      return Response.json(existing)
    }
    const newMember = { id: 'mem-' + Date.now(), name: name.trim(), is_active: true }
    mockMembers.push(newMember)
    return Response.json(newMember)
  }

  const { data, error } = await supabase
    .from('members')
    .upsert({ name: name.trim(), is_active: true }, { onConflict: 'name' })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function DELETE(request: NextRequest) {
  if (!verifyAdmin(request)) return unauthorizedResponse()

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) return Response.json({ error: 'id가 필요합니다' }, { status: 400 })

  if (isMockMode()) {
    const member = mockMembers.find(m => m.id === id)
    if (member) member.is_active = false
    return Response.json({ success: true })
  }

  const { error } = await supabase
    .from('members')
    .update({ is_active: false })
    .eq('id', id)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true })
}
