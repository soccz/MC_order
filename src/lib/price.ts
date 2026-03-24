import type { MenuItem, SideOption, DrinkOption, CartItem, TimeSlot } from './types'

/** 현재 한국 시간 기준 시간대 반환 */
export function getCurrentTimeSlot(): TimeSlot {
  const now = new Date()
  const koreaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))
  const hours = koreaTime.getHours()
  const minutes = koreaTime.getMinutes()
  const totalMinutes = hours * 60 + minutes

  // 10:30 ~ 14:00 맥런치
  if (totalMinutes >= 630 && totalMinutes < 840) return 'lunch'
  // 나머지 일반
  return 'regular'
}

/** 시간대 라벨 */
export function getTimeSlotLabel(slot: TimeSlot): string {
  switch (slot) {
    case 'lunch': return '맥런치'
    case 'regular': return '일반'
  }
}

/** 단품/세트 가격 계산 */
export function calculateItemPrice(
  menuItem: MenuItem,
  isSet: boolean,
  isLarge: boolean,
  sideOption: SideOption | null,
  drinkOption: DrinkOption | null,
  timeSlot: TimeSlot,
): number {
  // 단품
  if (!isSet) return menuItem.price

  // 세트 기본가 (런치 시간대 + 런치가 있으면 런치가 적용)
  let baseSetPrice: number
  if (timeSlot === 'lunch' && menuItem.lunch_set_price) {
    baseSetPrice = menuItem.lunch_set_price
  } else {
    baseSetPrice = menuItem.set_price ?? menuItem.price
  }

  // 사이드/음료 추가금
  const sideExtra = sideOption?.extra_price ?? 0
  const drinkExtra = drinkOption?.extra_price ?? 0

  // 라지 추가금
  const largeExtra = isLarge ? menuItem.large_set_extra : 0

  return baseSetPrice + sideExtra + drinkExtra + largeExtra
}

/** 장바구니 아이템 가격 계산 */
export function calculateCartItemPrice(item: CartItem, timeSlot: TimeSlot): number {
  const unitPrice = calculateItemPrice(
    item.menu_item,
    item.is_set,
    item.is_large,
    item.side_option,
    item.drink_option,
    timeSlot,
  )
  return unitPrice * item.quantity
}

/** 장바구니 총액 */
export function calculateCartTotal(items: CartItem[], timeSlot: TimeSlot): number {
  return items.reduce((sum, item) => sum + calculateCartItemPrice(item, timeSlot), 0)
}

/** 본인 부담금 계산 */
export function calculateSelfPay(totalPrice: number, subsidy: number): number {
  return Math.max(0, totalPrice - subsidy)
}

/** 주문 아이템 라벨 생성 (키오스크용) */
export function formatOrderItemLabel(
  menuName: string,
  isSet: boolean,
  isLarge: boolean,
  sideName?: string,
  drinkName?: string,
): string {
  if (!isSet) return menuName

  const parts: string[] = []
  if (isLarge) parts.push('라지')
  if (sideName) parts.push(sideName)
  if (drinkName) parts.push(drinkName)

  const suffix = parts.length > 0 ? `(${parts.join('/')})` : ''
  return `${menuName} 세트${suffix}`
}

/** 금액 포맷 */
export function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR') + '원'
}
