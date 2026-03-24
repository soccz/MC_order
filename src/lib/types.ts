export interface Category {
  id: string
  name: string
  sort_order: number
  is_active: boolean
  time_range: 'all' | 'morning' | 'lunch' | 'regular' // 시간대 필터
}

export interface MenuItem {
  id: string
  category_id: string
  name: string
  price: number          // 단품 가격
  set_price: number | null // 세트 가격 (null이면 세트 불가)
  large_set_extra: number  // 라지세트 추가금
  lunch_set_price: number | null // 맥런치 세트 가격
  is_set_available: boolean
  image_url: string | null
  sort_order: number
  is_active: boolean
}

export interface SideOption {
  id: string
  name: string
  extra_price: number    // 기본 대비 추가금
  large_name: string | null
  is_default: boolean
  sort_order: number
  is_active: boolean
}

export interface DrinkOption {
  id: string
  name: string
  extra_price: number
  large_name: string | null
  is_default: boolean
  sort_order: number
  is_active: boolean
}

export interface Member {
  id: string
  name: string
  is_active: boolean
}

export interface AppConfig {
  subsidy_per_person: number
  order_open: boolean
}

export interface Order {
  id: string
  member_id: string
  member_name?: string
  total_price: number
  items: OrderItem[]
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  menu_item_id: string
  menu_item_name?: string
  is_set: boolean
  is_large: boolean
  side_option_id: string | null
  side_option_name?: string
  drink_option_id: string | null
  drink_option_name?: string
  quantity: number
  item_price: number
}

// 장바구니용 (클라이언트)
export interface CartItem {
  temp_id: string
  menu_item: MenuItem
  is_set: boolean
  is_large: boolean
  side_option: SideOption | null
  drink_option: DrinkOption | null
  quantity: number
  calculated_price: number
}

// 키오스크 합산용
export interface KioskSummaryItem {
  label: string           // "빅맥세트(라지/치즈스틱/제로콜라)"
  quantity: number
  unit_price: number
}

// 개인 정산용
export interface SettlementItem {
  member_name: string
  items_label: string     // "빅맥세트(라지), 콜라(M)"
  total_price: number
  subsidy: number
  self_pay: number        // max(0, total - subsidy)
}

// 시간대 타입
export type TimeSlot = 'lunch' | 'regular'
