import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentTimeSlot } from '@/lib/price'
import { isMockMode, mockOrders, MOCK_MEMBERS, MOCK_MENU_ITEMS, MOCK_SIDE_OPTIONS, MOCK_DRINK_OPTIONS } from '@/lib/mock-data'

export async function GET() {
  if (isMockMode()) {
    const orders = Array.from(mockOrders.values()).map(o => ({
      ...o,
      member_name: MOCK_MEMBERS.find(m => m.id === o.member_id)?.name,
      items: (o.items as { menu_item_id: string; side_option_id: string | null; drink_option_id: string | null; is_set: boolean; is_large: boolean; quantity: number; item_price: number }[]).map(item => ({
        ...item,
        menu_item_name: MOCK_MENU_ITEMS.find(m => m.id === item.menu_item_id)?.name,
        side_option_name: item.side_option_id ? MOCK_SIDE_OPTIONS.find(s => s.id === item.side_option_id)?.name : null,
        drink_option_name: item.drink_option_id ? MOCK_DRINK_OPTIONS.find(d => d.id === item.drink_option_id)?.name : null,
      })),
    }))
    return Response.json(orders)
  }

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      members(name),
      order_items(
        *,
        menu_items(name, price, set_price, large_set_extra, lunch_set_price),
        side_options(name),
        drink_options(name)
      )
    `)
    .order('created_at')

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const orders = (data ?? []).map(order => ({
    ...order,
    member_name: (order.members as { name: string } | null)?.name,
    items: (order.order_items ?? []).map((item: Record<string, unknown>) => ({
      ...item,
      menu_item_name: (item.menu_items as { name: string } | null)?.name,
      side_option_name: (item.side_options as { name: string } | null)?.name,
      drink_option_name: (item.drink_options as { name: string } | null)?.name,
    })),
  }))

  return Response.json(orders)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { member_id, items } = body

  if (isMockMode()) {
    // mock 마감 체크는 config API의 mockConfig 참조 불가 → 별도 import 필요 없이 config API 호출
    const configRes = await fetch(new URL('/api/config', request.url))
    const configData = await configRes.json()
    if (!configData.order_open) {
      return Response.json({ error: '주문이 마감되었습니다' }, { status: 403 })
    }

    const member = MOCK_MEMBERS.find(m => m.id === member_id && m.is_active)
    if (!member) return Response.json({ error: '등록되지 않은 멤버입니다' }, { status: 400 })

    const timeSlot = getCurrentTimeSlot()
    let totalPrice = 0
    const orderItems = []

    for (const item of items) {
      const menuItem = MOCK_MENU_ITEMS.find(m => m.id === item.menu_item_id)
      if (!menuItem) continue

      let itemPrice: number
      if (!item.is_set) {
        itemPrice = menuItem.price
      } else {
        if (timeSlot === 'lunch' && menuItem.lunch_set_price) {
          itemPrice = menuItem.lunch_set_price
        } else {
          itemPrice = menuItem.set_price ?? menuItem.price
        }
        const side = item.side_option_id ? MOCK_SIDE_OPTIONS.find(s => s.id === item.side_option_id) : null
        const drink = item.drink_option_id ? MOCK_DRINK_OPTIONS.find(d => d.id === item.drink_option_id) : null
        itemPrice += (side?.extra_price ?? 0) + (drink?.extra_price ?? 0)
        if (item.is_large) itemPrice += menuItem.large_set_extra
      }

      totalPrice += itemPrice * (item.quantity ?? 1)
      orderItems.push({ ...item, item_price: itemPrice })
    }

    mockOrders.set(member_id, {
      member_id,
      total_price: totalPrice,
      items: orderItems,
      created_at: new Date().toISOString(),
    })

    return Response.json({ order_id: 'mock-' + Date.now(), total_price: totalPrice })
  }

  // --- Supabase 모드 ---
  const { data: configData } = await supabase
    .from('app_config')
    .select('value')
    .eq('key', 'order_open')
    .single()

  if (configData?.value !== 'true') {
    return Response.json({ error: '주문이 마감되었습니다' }, { status: 403 })
  }

  const { data: member } = await supabase
    .from('members')
    .select('id')
    .eq('id', member_id)
    .eq('is_active', true)
    .single()

  if (!member) {
    return Response.json({ error: '등록되지 않은 멤버입니다' }, { status: 400 })
  }

  const timeSlot = getCurrentTimeSlot()
  let totalPrice = 0
  const orderItems = []

  for (const item of items) {
    const { data: menuItem } = await supabase
      .from('menu_items')
      .select('*')
      .eq('id', item.menu_item_id)
      .single()

    if (!menuItem) continue

    let itemPrice: number
    if (!item.is_set) {
      itemPrice = menuItem.price
    } else {
      if (timeSlot === 'lunch' && menuItem.lunch_set_price) {
        itemPrice = menuItem.lunch_set_price
      } else {
        itemPrice = menuItem.set_price ?? menuItem.price
      }
      if (item.side_option_id) {
        const { data: side } = await supabase
          .from('side_options')
          .select('extra_price')
          .eq('id', item.side_option_id)
          .single()
        itemPrice += side?.extra_price ?? 0
      }
      if (item.drink_option_id) {
        const { data: drink } = await supabase
          .from('drink_options')
          .select('extra_price')
          .eq('id', item.drink_option_id)
          .single()
        itemPrice += drink?.extra_price ?? 0
      }
      if (item.is_large) {
        itemPrice += menuItem.large_set_extra ?? 900
      }
    }

    const lineTotal = itemPrice * (item.quantity ?? 1)
    totalPrice += lineTotal

    orderItems.push({
      menu_item_id: item.menu_item_id,
      is_set: item.is_set,
      is_large: item.is_large,
      side_option_id: item.side_option_id,
      drink_option_id: item.drink_option_id,
      quantity: item.quantity ?? 1,
      item_price: itemPrice,
    })
  }

  const { data: existingOrder } = await supabase
    .from('orders')
    .select('id')
    .eq('member_id', member_id)
    .single()

  if (existingOrder) {
    await supabase.from('order_items').delete().eq('order_id', existingOrder.id)
    await supabase.from('orders').delete().eq('id', existingOrder.id)
  }

  const { data: newOrder, error: orderError } = await supabase
    .from('orders')
    .insert({ member_id, total_price: totalPrice })
    .select()
    .single()

  if (orderError) return Response.json({ error: orderError.message }, { status: 500 })

  const itemsWithOrderId = orderItems.map(item => ({
    ...item,
    order_id: newOrder.id,
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(itemsWithOrderId)

  if (itemsError) return Response.json({ error: itemsError.message }, { status: 500 })

  return Response.json({ order_id: newOrder.id, total_price: totalPrice })
}
