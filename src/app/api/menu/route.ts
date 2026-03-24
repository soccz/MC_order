import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyAdmin, unauthorizedResponse } from '@/lib/admin-auth'
import { isMockMode, MOCK_CATEGORIES, MOCK_MENU_ITEMS, MOCK_SIDE_OPTIONS, MOCK_DRINK_OPTIONS } from '@/lib/mock-data'

export async function GET() {
  if (isMockMode()) {
    return Response.json({
      categories: MOCK_CATEGORIES,
      items: MOCK_MENU_ITEMS,
      side_options: MOCK_SIDE_OPTIONS,
      drink_options: MOCK_DRINK_OPTIONS,
    })
  }

  const [categoriesRes, itemsRes, sidesRes, drinksRes] = await Promise.all([
    supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('menu_items').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('side_options').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('drink_options').select('*').eq('is_active', true).order('sort_order'),
  ])

  if (categoriesRes.error || itemsRes.error || sidesRes.error || drinksRes.error) {
    return Response.json({ error: '메뉴를 불러올 수 없습니다' }, { status: 500 })
  }

  return Response.json({
    categories: categoriesRes.data,
    items: itemsRes.data,
    side_options: sidesRes.data,
    drink_options: drinksRes.data,
  })
}

export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) return unauthorizedResponse()

  const body = await request.json()
  const { data, error } = await supabase
    .from('menu_items')
    .insert(body)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function PUT(request: NextRequest) {
  if (!verifyAdmin(request)) return unauthorizedResponse()

  const body = await request.json()
  const { id, ...updates } = body

  const { data, error } = await supabase
    .from('menu_items')
    .update(updates)
    .eq('id', id)
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

  const { error } = await supabase
    .from('menu_items')
    .update({ is_active: false })
    .eq('id', id)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true })
}
