import { supabase } from '@/lib/supabase'
import { formatOrderItemLabel } from '@/lib/price'
import { isMockMode, mockOrders, MOCK_MEMBERS, MOCK_MENU_ITEMS, MOCK_SIDE_OPTIONS, MOCK_DRINK_OPTIONS } from '@/lib/mock-data'

export async function GET() {
  if (isMockMode()) {
    const subsidy = 7000 // mock 기본값
    const kioskMap = new Map<string, { label: string; quantity: number; unit_price: number }>()
    const settlements: { member_name: string; items_label: string; total_price: number; subsidy: number; self_pay: number }[] = []

    for (const order of mockOrders.values()) {
      const memberName = MOCK_MEMBERS.find(m => m.id === order.member_id)?.name ?? '?'
      const itemLabels: string[] = []

      for (const item of order.items as { menu_item_id: string; side_option_id: string | null; drink_option_id: string | null; is_set: boolean; is_large: boolean; quantity: number; item_price: number }[]) {
        const menuName = MOCK_MENU_ITEMS.find(m => m.id === item.menu_item_id)?.name ?? '?'
        const sideName = item.side_option_id ? MOCK_SIDE_OPTIONS.find(s => s.id === item.side_option_id)?.name : undefined
        const drinkName = item.drink_option_id ? MOCK_DRINK_OPTIONS.find(d => d.id === item.drink_option_id)?.name : undefined

        const label = formatOrderItemLabel(menuName, item.is_set, item.is_large, sideName, drinkName)
        const key = `${label}|${item.item_price}`
        const existing = kioskMap.get(key)
        if (existing) existing.quantity += item.quantity
        else kioskMap.set(key, { label, quantity: item.quantity, unit_price: item.item_price })

        const qty = item.quantity > 1 ? ` x${item.quantity}` : ''
        itemLabels.push(`${label}${qty}`)
      }

      settlements.push({
        member_name: memberName,
        items_label: itemLabels.join(', '),
        total_price: order.total_price,
        subsidy,
        self_pay: Math.max(0, order.total_price - subsidy),
      })
    }

    const totalAmount = settlements.reduce((s, i) => s + i.total_price, 0)
    return Response.json({
      kiosk_summary: Array.from(kioskMap.values()),
      settlements,
      totals: { order_count: settlements.length, total_amount: totalAmount, total_subsidy: settlements.length * subsidy, total_self_pay: settlements.reduce((s, i) => s + i.self_pay, 0) },
    })
  }

  // --- Supabase ---
  const [ordersRes, configRes] = await Promise.all([
    supabase.from('orders').select(`*, members(name), order_items(*, menu_items(name, price, set_price, large_set_extra), side_options(name), drink_options(name))`).order('created_at'),
    supabase.from('app_config').select('key, value'),
  ])

  if (ordersRes.error) return Response.json({ error: ordersRes.error.message }, { status: 500 })

  const config: Record<string, string> = {}
  for (const row of configRes.data ?? []) config[row.key] = row.value
  const subsidy = Number(config.subsidy_per_person ?? 0)

  const kioskMap = new Map<string, { label: string; quantity: number; unit_price: number }>()
  const settlements: { member_name: string; items_label: string; total_price: number; subsidy: number; self_pay: number }[] = []

  for (const order of ordersRes.data ?? []) {
    const memberName = (order.members as { name: string } | null)?.name ?? '?'
    const itemLabels: string[] = []

    for (const item of order.order_items ?? []) {
      const menuName = (item.menu_items as { name: string } | null)?.name ?? '?'
      const sideName = (item.side_options as { name: string } | null)?.name
      const drinkName = (item.drink_options as { name: string } | null)?.name

      const label = formatOrderItemLabel(menuName, item.is_set, item.is_large, sideName, drinkName)
      const key = `${label}|${item.item_price}`
      const existing = kioskMap.get(key)
      if (existing) existing.quantity += item.quantity
      else kioskMap.set(key, { label, quantity: item.quantity, unit_price: item.item_price })

      const qty = item.quantity > 1 ? ` x${item.quantity}` : ''
      itemLabels.push(`${label}${qty}`)
    }

    settlements.push({
      member_name: memberName,
      items_label: itemLabels.join(', '),
      total_price: order.total_price,
      subsidy,
      self_pay: Math.max(0, order.total_price - subsidy),
    })
  }

  const totalAmount = settlements.reduce((s, i) => s + i.total_price, 0)
  return Response.json({
    kiosk_summary: Array.from(kioskMap.values()),
    settlements,
    totals: { order_count: settlements.length, total_amount: totalAmount, total_subsidy: settlements.length * subsidy, total_self_pay: settlements.reduce((s, i) => s + i.self_pay, 0) },
  })
}
