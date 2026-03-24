// Supabase 미연결 시 사용하는 mock 데이터
// 가격 출처: 나무위키 맥도날드/메뉴 (2026.03 기준, 2026.02.20 인상 반영)

export const MOCK_CATEGORIES = [
  { id: 'cat-burger', name: '버거', sort_order: 1, time_range: 'all', is_active: true },
  { id: 'cat-side', name: '사이드', sort_order: 2, time_range: 'all', is_active: true },
  { id: 'cat-drink', name: '음료', sort_order: 3, time_range: 'all', is_active: true },
  { id: 'cat-dessert', name: '디저트', sort_order: 4, time_range: 'all', is_active: true },
]

export const MOCK_SIDE_OPTIONS = [
  { id: 'side-fry', name: '후렌치 후라이', extra_price: 0, large_name: '후렌치 후라이(L)', is_default: true, sort_order: 1, is_active: true },
  { id: 'side-coleslaw', name: '코울슬로', extra_price: 0, large_name: null, is_default: false, sort_order: 2, is_active: true },
  { id: 'side-nugget', name: '맥너겟(4pc)', extra_price: 500, large_name: '맥너겟(6pc)', is_default: false, sort_order: 3, is_active: true },
  { id: 'side-cheese', name: '골든 모짜렐라 치즈스틱(2pc)', extra_price: 200, large_name: '골든 모짜렐라 치즈스틱(3pc)', is_default: false, sort_order: 4, is_active: true },
]

export const MOCK_DRINK_OPTIONS = [
  { id: 'drink-coke', name: '코카콜라', extra_price: 0, large_name: '코카콜라(L)', is_default: true, sort_order: 1, is_active: true },
  { id: 'drink-zero', name: '코카콜라 제로', extra_price: 0, large_name: '코카콜라 제로(L)', is_default: false, sort_order: 2, is_active: true },
  { id: 'drink-sprite', name: '스프라이트', extra_price: 0, large_name: '스프라이트(L)', is_default: false, sort_order: 3, is_active: true },
  { id: 'drink-fanta', name: '환타 오렌지', extra_price: 0, large_name: '환타 오렌지(L)', is_default: false, sort_order: 4, is_active: true },
  { id: 'drink-vanilla', name: '바닐라 쉐이크', extra_price: 500, large_name: null, is_default: false, sort_order: 5, is_active: true },
  { id: 'drink-strawberry', name: '딸기 쉐이크', extra_price: 800, large_name: null, is_default: false, sort_order: 6, is_active: true },
  { id: 'drink-choco', name: '초코 쉐이크', extra_price: 800, large_name: null, is_default: false, sort_order: 7, is_active: true },
  { id: 'drink-coffee', name: '드립 커피', extra_price: 0, large_name: '드립 커피(L)', is_default: false, sort_order: 8, is_active: true },
]

export const MOCK_MENU_ITEMS = [
  // 버거
  { id: 'm-bigmac', category_id: 'cat-burger', name: '빅맥', price: 5700, set_price: 7600, large_set_extra: 900, lunch_set_price: 6500, is_set_available: true, image_url: null, sort_order: 1, is_active: true },
  { id: 'm-shanghai', category_id: 'cat-burger', name: '맥스파이시 상하이 버거', price: 5900, set_price: 7700, large_set_extra: 900, lunch_set_price: 6600, is_set_available: true, image_url: null, sort_order: 2, is_active: true },
  { id: 'm-dbl-shanghai', category_id: 'cat-burger', name: '더블 맥스파이시 상하이 버거', price: 9300, set_price: 11200, large_set_extra: 900, lunch_set_price: null, is_set_available: true, image_url: null, sort_order: 3, is_active: true },
  { id: 'm-1955', category_id: 'cat-burger', name: '1955 버거', price: 6700, set_price: 8400, large_set_extra: 900, lunch_set_price: 7300, is_set_available: true, image_url: null, sort_order: 4, is_active: true },
  { id: 'm-btd', category_id: 'cat-burger', name: '베이컨 토마토 디럭스', price: 5800, set_price: 8000, large_set_extra: 900, lunch_set_price: 7300, is_set_available: true, image_url: null, sort_order: 5, is_active: true },
  { id: 'm-qpc', category_id: 'cat-burger', name: '쿼터파운더 치즈', price: 5900, set_price: 7900, large_set_extra: 900, lunch_set_price: null, is_set_available: true, image_url: null, sort_order: 6, is_active: true },
  { id: 'm-dqpc', category_id: 'cat-burger', name: '더블 쿼터파운더 치즈', price: 7700, set_price: 9600, large_set_extra: 900, lunch_set_price: null, is_set_available: true, image_url: null, sort_order: 7, is_active: true },
  { id: 'm-crispy-c', category_id: 'cat-burger', name: '맥크리스피 치킨 클래식', price: 5900, set_price: 7400, large_set_extra: 900, lunch_set_price: null, is_set_available: true, image_url: null, sort_order: 8, is_active: true },
  { id: 'm-crispy-d', category_id: 'cat-burger', name: '맥크리스피 치킨 디럭스', price: 6800, set_price: 8400, large_set_extra: 900, lunch_set_price: 7500, is_set_available: true, image_url: null, sort_order: 9, is_active: true },
  { id: 'm-shushu', category_id: 'cat-burger', name: '슈슈버거', price: 4700, set_price: 6000, large_set_extra: 900, lunch_set_price: null, is_set_available: true, image_url: null, sort_order: 10, is_active: true },
  { id: 'm-shubi', category_id: 'cat-burger', name: '슈비버거', price: 6200, set_price: 8500, large_set_extra: 900, lunch_set_price: null, is_set_available: true, image_url: null, sort_order: 11, is_active: true },
  { id: 'm-mcchicken', category_id: 'cat-burger', name: '맥치킨', price: 3500, set_price: 5600, large_set_extra: 900, lunch_set_price: null, is_set_available: true, image_url: null, sort_order: 12, is_active: true },
  { id: 'm-mcchicken-m', category_id: 'cat-burger', name: '맥치킨 모짜렐라', price: 5000, set_price: 7300, large_set_extra: 900, lunch_set_price: null, is_set_available: true, image_url: null, sort_order: 13, is_active: true },
  { id: 'm-bulgogi', category_id: 'cat-burger', name: '불고기 버거', price: 3800, set_price: 5500, large_set_extra: 900, lunch_set_price: null, is_set_available: true, image_url: null, sort_order: 14, is_active: true },
  { id: 'm-dbl-bulgogi', category_id: 'cat-burger', name: '더블 불고기 버거', price: 4700, set_price: 6800, large_set_extra: 900, lunch_set_price: 6300, is_set_available: true, image_url: null, sort_order: 15, is_active: true },
  { id: 'm-cheese', category_id: 'cat-burger', name: '치즈버거', price: 3200, set_price: 5000, large_set_extra: 900, lunch_set_price: null, is_set_available: true, image_url: null, sort_order: 16, is_active: true },
  { id: 'm-dbl-cheese', category_id: 'cat-burger', name: '더블 치즈버거', price: 5000, set_price: 6300, large_set_extra: 900, lunch_set_price: null, is_set_available: true, image_url: null, sort_order: 17, is_active: true },
  { id: 'm-triple-cheese', category_id: 'cat-burger', name: '트리플 치즈버거', price: 6100, set_price: 7500, large_set_extra: 900, lunch_set_price: null, is_set_available: true, image_url: null, sort_order: 18, is_active: true },
  { id: 'm-tomato-beef', category_id: 'cat-burger', name: '토마토 치즈 비프 버거', price: 4000, set_price: 5600, large_set_extra: 900, lunch_set_price: 5200, is_set_available: true, image_url: null, sort_order: 19, is_active: true },
  { id: 'm-hamburger', category_id: 'cat-burger', name: '햄버거', price: 2800, set_price: null, large_set_extra: 900, lunch_set_price: null, is_set_available: false, image_url: null, sort_order: 20, is_active: true },

  // 사이드
  { id: 'm-fry-s', category_id: 'cat-side', name: '후렌치 후라이(S)', price: 1500, set_price: null, large_set_extra: 900, lunch_set_price: null, is_set_available: false, image_url: null, sort_order: 1, is_active: true },
  { id: 'm-fry-m', category_id: 'cat-side', name: '후렌치 후라이(M)', price: 2500, set_price: null, large_set_extra: 900, lunch_set_price: null, is_set_available: false, image_url: null, sort_order: 2, is_active: true },
  { id: 'm-fry-l', category_id: 'cat-side', name: '후렌치 후라이(L)', price: 3200, set_price: null, large_set_extra: 900, lunch_set_price: null, is_set_available: false, image_url: null, sort_order: 3, is_active: true },
  { id: 'm-nug6', category_id: 'cat-side', name: '맥너겟(6pc)', price: 4100, set_price: null, large_set_extra: 900, lunch_set_price: null, is_set_available: false, image_url: null, sort_order: 4, is_active: true },
  { id: 'm-nug10', category_id: 'cat-side', name: '맥너겟(10pc)', price: 5500, set_price: null, large_set_extra: 900, lunch_set_price: null, is_set_available: false, image_url: null, sort_order: 5, is_active: true },
  { id: 'm-cs3', category_id: 'cat-side', name: '골든 모짜렐라 치즈스틱(3pc)', price: 2800, set_price: null, large_set_extra: 900, lunch_set_price: null, is_set_available: false, image_url: null, sort_order: 6, is_active: true },
  { id: 'm-cs4', category_id: 'cat-side', name: '골든 모짜렐라 치즈스틱(4pc)', price: 4500, set_price: null, large_set_extra: 900, lunch_set_price: null, is_set_available: false, image_url: null, sort_order: 7, is_active: true },
  { id: 'm-wing2', category_id: 'cat-side', name: '맥윙(2pc)', price: 3700, set_price: null, large_set_extra: 900, lunch_set_price: null, is_set_available: false, image_url: null, sort_order: 8, is_active: true },
  { id: 'm-wing4', category_id: 'cat-side', name: '맥윙(4pc)', price: 6900, set_price: null, large_set_extra: 900, lunch_set_price: null, is_set_available: false, image_url: null, sort_order: 9, is_active: true },
  { id: 'm-wing8', category_id: 'cat-side', name: '맥윙(8pc)', price: 13000, set_price: null, large_set_extra: 900, lunch_set_price: null, is_set_available: false, image_url: null, sort_order: 10, is_active: true },
  { id: 'm-coleslaw', category_id: 'cat-side', name: '코울슬로', price: 1900, set_price: null, large_set_extra: 900, lunch_set_price: null, is_set_available: false, image_url: null, sort_order: 11, is_active: true },
  { id: 'm-wrap', category_id: 'cat-side', name: '상하이 치킨 스낵랩', price: 3500, set_price: null, large_set_extra: 900, lunch_set_price: null, is_set_available: false, image_url: null, sort_order: 12, is_active: true },
  { id: 'm-tender', category_id: 'cat-side', name: '맥스파이시 치킨 텐더(2pc)', price: 2700, set_price: null, large_set_extra: 900, lunch_set_price: null, is_set_available: false, image_url: null, sort_order: 13, is_active: true },
  { id: 'm-hash', category_id: 'cat-side', name: '해시 브라운', price: 1800, set_price: null, large_set_extra: 900, lunch_set_price: null, is_set_available: false, image_url: null, sort_order: 14, is_active: true },

  // 음료
  { id: 'm-coke-m', category_id: 'cat-drink', name: '코카콜라(M)', price: 2000, set_price: null, large_set_extra: 900, lunch_set_price: null, is_set_available: false, image_url: null, sort_order: 1, is_active: true },
  { id: 'm-coke-l', category_id: 'cat-drink', name: '코카콜라(L)', price: 2400, set_price: null, large_set_extra: 900, lunch_set_price: null, is_set_available: false, image_url: null, sort_order: 2, is_active: true },
  { id: 'm-zero-m', category_id: 'cat-drink', name: '코카콜라 제로(M)', price: 2000, set_price: null, large_set_extra: 900, lunch_set_price: null, is_set_available: false, image_url: null, sort_order: 3, is_active: true },
  { id: 'm-zero-l', category_id: 'cat-drink', name: '코카콜라 제로(L)', price: 2400, set_price: null, large_set_extra: 900, lunch_set_price: null, is_set_available: false, image_url: null, sort_order: 4, is_active: true },
  { id: 'm-sprite-m', category_id: 'cat-drink', name: '스프라이트(M)', price: 2000, set_price: null, large_set_extra: 900, lunch_set_price: null, is_set_available: false, image_url: null, sort_order: 5, is_active: true },
  { id: 'm-sprite-l', category_id: 'cat-drink', name: '스프라이트(L)', price: 2400, set_price: null, large_set_extra: 900, lunch_set_price: null, is_set_available: false, image_url: null, sort_order: 6, is_active: true },
  { id: 'm-fanta-m', category_id: 'cat-drink', name: '환타 오렌지(M)', price: 2000, set_price: null, large_set_extra: 900, lunch_set_price: null, is_set_available: false, image_url: null, sort_order: 7, is_active: true },
  { id: 'm-vshake', category_id: 'cat-drink', name: '바닐라 쉐이크', price: 2500, set_price: null, large_set_extra: 900, lunch_set_price: null, is_set_available: false, image_url: null, sort_order: 8, is_active: true },
  { id: 'm-sshake', category_id: 'cat-drink', name: '딸기 쉐이크', price: 2800, set_price: null, large_set_extra: 900, lunch_set_price: null, is_set_available: false, image_url: null, sort_order: 9, is_active: true },
  { id: 'm-cshake', category_id: 'cat-drink', name: '초코 쉐이크', price: 2800, set_price: null, large_set_extra: 900, lunch_set_price: null, is_set_available: false, image_url: null, sort_order: 10, is_active: true },
  { id: 'm-water', category_id: 'cat-drink', name: '순수 생수', price: 1300, set_price: null, large_set_extra: 900, lunch_set_price: null, is_set_available: false, image_url: null, sort_order: 11, is_active: true },
  { id: 'm-peach-m', category_id: 'cat-drink', name: '피치 아이스티(M)', price: 3100, set_price: null, large_set_extra: 900, lunch_set_price: null, is_set_available: false, image_url: null, sort_order: 12, is_active: true },
  { id: 'm-peach-l', category_id: 'cat-drink', name: '피치 아이스티(L)', price: 3600, set_price: null, large_set_extra: 900, lunch_set_price: null, is_set_available: false, image_url: null, sort_order: 13, is_active: true },
  { id: 'm-mango-m', category_id: 'cat-drink', name: '망고 피치 아이스티(M)', price: 3400, set_price: null, large_set_extra: 900, lunch_set_price: null, is_set_available: false, image_url: null, sort_order: 14, is_active: true },
  { id: 'm-mango-l', category_id: 'cat-drink', name: '망고 피치 아이스티(L)', price: 3900, set_price: null, large_set_extra: 900, lunch_set_price: null, is_set_available: false, image_url: null, sort_order: 15, is_active: true },
  { id: 'm-mcfizz-m', category_id: 'cat-drink', name: '맥피즈 골드(M)', price: 2500, set_price: null, large_set_extra: 900, lunch_set_price: null, is_set_available: false, image_url: null, sort_order: 16, is_active: true },
  { id: 'm-mcfizz-l', category_id: 'cat-drink', name: '맥피즈 골드(L)', price: 3000, set_price: null, large_set_extra: 900, lunch_set_price: null, is_set_available: false, image_url: null, sort_order: 17, is_active: true },
  { id: 'm-drip-m', category_id: 'cat-drink', name: '아이스 드립 커피(M)', price: 2000, set_price: null, large_set_extra: 900, lunch_set_price: null, is_set_available: false, image_url: null, sort_order: 18, is_active: true },
  { id: 'm-drip-l', category_id: 'cat-drink', name: '아이스 드립 커피(L)', price: 2500, set_price: null, large_set_extra: 900, lunch_set_price: null, is_set_available: false, image_url: null, sort_order: 19, is_active: true },

  // 디저트
  { id: 'm-mcf-oreo', category_id: 'cat-dessert', name: '맥플러리 오레오', price: 3600, set_price: null, large_set_extra: 900, lunch_set_price: null, is_set_available: false, image_url: null, sort_order: 1, is_active: true },
  { id: 'm-mcf-soreo', category_id: 'cat-dessert', name: '맥플러리 딸기 오레오', price: 3600, set_price: null, large_set_extra: 900, lunch_set_price: null, is_set_available: false, image_url: null, sort_order: 2, is_active: true },
  { id: 'm-mcf-coreo', category_id: 'cat-dessert', name: '맥플러리 초코 오레오', price: 3600, set_price: null, large_set_extra: 900, lunch_set_price: null, is_set_available: false, image_url: null, sort_order: 3, is_active: true },
  { id: 'm-affogato', category_id: 'cat-dessert', name: '오레오 아포가토', price: 4100, set_price: null, large_set_extra: 900, lunch_set_price: null, is_set_available: false, image_url: null, sort_order: 4, is_active: true },
  { id: 'm-cone', category_id: 'cat-dessert', name: '아이스크림 콘', price: 1500, set_price: null, large_set_extra: 900, lunch_set_price: null, is_set_available: false, image_url: null, sort_order: 5, is_active: true },
  { id: 'm-scone', category_id: 'cat-dessert', name: '스트로베리 콘', price: 1900, set_price: null, large_set_extra: 900, lunch_set_price: null, is_set_available: false, image_url: null, sort_order: 6, is_active: true },
  { id: 'm-sundae-v', category_id: 'cat-dessert', name: '선데이 아이스크림 바닐라', price: 2200, set_price: null, large_set_extra: 900, lunch_set_price: null, is_set_available: false, image_url: null, sort_order: 7, is_active: true },
  { id: 'm-sundae-c', category_id: 'cat-dessert', name: '선데이 아이스크림 초코', price: 2400, set_price: null, large_set_extra: 900, lunch_set_price: null, is_set_available: false, image_url: null, sort_order: 8, is_active: true },
  { id: 'm-sundae-s', category_id: 'cat-dessert', name: '선데이 아이스크림 딸기', price: 2400, set_price: null, large_set_extra: 900, lunch_set_price: null, is_set_available: false, image_url: null, sort_order: 9, is_active: true },
  { id: 'm-churros', category_id: 'cat-dessert', name: '한입 초코 츄러스(3pc)', price: 2500, set_price: null, large_set_extra: 900, lunch_set_price: null, is_set_available: false, image_url: null, sort_order: 10, is_active: true },
]

export const MOCK_MEMBERS = [
  { id: 'mem-1', name: '홍길동', is_active: true },
  { id: 'mem-2', name: '김철수', is_active: true },
  { id: 'mem-3', name: '이영희', is_active: true },
  { id: 'mem-4', name: '박민수', is_active: true },
  { id: 'mem-5', name: '정수진', is_active: true },
]

// mock 주문 저장소 (메모리)
export const mockOrders: Map<string, { member_id: string; total_price: number; items: unknown[]; created_at: string }> = new Map()

export function isMockMode(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return !url || url === 'your_supabase_url'
}
