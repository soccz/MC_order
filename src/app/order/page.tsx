'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useMenu } from '@/hooks/use-menu'
import { useConfig } from '@/hooks/use-config'
import { useCart } from '@/hooks/use-cart'
import { getCurrentTimeSlot, getTimeSlotLabel, formatPrice, calculateCartTotal, calculateItemPrice } from '@/lib/price'
import type { MenuItem, SideOption, DrinkOption, TimeSlot } from '@/lib/types'
import SetOptionSheet from '@/components/set-option-sheet'

export default function OrderPage() {
  const router = useRouter()
  const { categories, menuItems, sideOptions, drinkOptions, isLoading } = useMenu()
  const { config } = useConfig()
  const cart = useCart()

  const [memberName, setMemberName] = useState('')
  const [memberId, setMemberId] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null)
  const [showCart, setShowCart] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [hasExistingOrder, setHasExistingOrder] = useState(false)

  const timeSlot: TimeSlot = getCurrentTimeSlot()

  useEffect(() => {
    const name = sessionStorage.getItem('member_name')
    const id = sessionStorage.getItem('member_id')
    if (!name || !id) {
      router.push('/')
      return
    }
    setMemberName(name)
    setMemberId(id)

    // 기존 주문 존재 여부만 체크
    fetch(`/api/orders`)
      .then(r => r.json())
      .then(orders => {
        const myOrder = orders.find?.((o: { member_id: string }) => o.member_id === id)
        if (myOrder && myOrder.items?.length > 0) {
          setHasExistingOrder(true)
          sessionStorage.setItem('existing_order', JSON.stringify(myOrder))
        }
      })
      .catch(() => {})
  }, [router])

  // 메뉴 로드 후 기존 주문 장바구니 복원
  useEffect(() => {
    if (menuItems.length === 0 || cart.items.length > 0 || !hasExistingOrder) return
    const raw = sessionStorage.getItem('existing_order')
    if (!raw) return
    try {
      const myOrder = JSON.parse(raw)
      const restored = myOrder.items.map((item: {
        menu_item_id: string; is_set: boolean; is_large: boolean;
        side_option_id: string | null; drink_option_id: string | null;
        quantity: number; item_price: number;
      }) => ({
        temp_id: crypto.randomUUID(),
        menu_item: menuItems.find(m => m.id === item.menu_item_id) || null,
        is_set: item.is_set,
        is_large: item.is_large,
        side_option: item.side_option_id ? sideOptions.find(s => s.id === item.side_option_id) || null : null,
        drink_option: item.drink_option_id ? drinkOptions.find(d => d.id === item.drink_option_id) || null : null,
        quantity: item.quantity,
        calculated_price: item.item_price,
      })).filter((i: { menu_item: MenuItem | null }) => i.menu_item !== null)
      if (restored.length > 0) {
        cart.loadFromOrder(restored)
      }
      sessionStorage.removeItem('existing_order')
    } catch { /* ignore */ }
  }, [menuItems, sideOptions, drinkOptions, hasExistingOrder, cart])

  // 활성 카테고리
  const filteredCategories = useMemo(() => {
    return categories.filter(c => c.is_active)
  }, [categories])

  // 마감 시 리다이렉트
  useEffect(() => {
    if (!config.order_open && memberId) {
      alert('주문이 마감되었습니다')
      router.push('/')
    }
  }, [config.order_open, memberId, router])

  // 선택된 카테고리의 메뉴
  const filteredItems = useMemo(() => {
    if (!selectedCategory) return []
    return menuItems.filter(i => i.category_id === selectedCategory)
  }, [menuItems, selectedCategory])

  // 첫 카테고리 자동 선택
  useEffect(() => {
    if (filteredCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(filteredCategories[0].id)
    }
  }, [filteredCategories, selectedCategory])

  const cartTotal = calculateCartTotal(cart.items, timeSlot)

  function handleAddItem(item: MenuItem) {
    if (!item.is_set_available) {
      // 단품만 가능 → 바로 장바구니에 추가
      cart.addItem(item, false, false, null, null)
    } else {
      // 옵션 시트 열기
      setSelectedMenuItem(item)
    }
  }

  function handleConfirmOption(isSet: boolean, isLarge: boolean, side: SideOption | null, drink: DrinkOption | null) {
    if (selectedMenuItem) {
      cart.addItem(selectedMenuItem, isSet, isLarge, side, drink)
      setSelectedMenuItem(null)
    }
  }

  async function handleSubmitOrder() {
    if (cart.items.length === 0) {
      alert('장바구니가 비어있습니다')
      return
    }
    setSubmitting(true)

    const items = cart.items.map(ci => ({
      menu_item_id: ci.menu_item.id,
      is_set: ci.is_set,
      is_large: ci.is_large,
      side_option_id: ci.side_option?.id ?? null,
      drink_option_id: ci.drink_option?.id ?? null,
      quantity: ci.quantity,
    }))

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_id: memberId, items }),
      })

      if (!res.ok) {
        const err = await res.json()
        alert(err.error || '주문 실패')
        setSubmitting(false)
        return
      }

      cart.clearCart()
      alert('주문이 완료되었습니다!\n수정하려면 같은 이름으로 다시 들어오세요.')
      router.push('/status')
    } catch {
      alert('서버 오류가 발생했습니다')
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-mc-gray">메뉴 불러오는 중...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* 헤더 */}
      <div className="sticky top-0 z-30 bg-mc-red text-white p-4">
        <div className="flex items-center justify-between">
          <button onClick={() => router.push('/')} className="text-white text-lg">&larr;</button>
          <h1 className="font-bold text-lg">{memberName}님의 주문</h1>
          <div className="px-2 py-0.5 bg-mc-yellow text-mc-brown text-xs font-bold rounded-full">
            {getTimeSlotLabel(timeSlot)}
          </div>
        </div>
      </div>

      {/* 기존 주문 알림 */}
      {hasExistingOrder && (
        <div className="bg-mc-yellow/30 px-4 py-2 text-sm text-mc-brown text-center">
          기존 주문을 불러왔습니다. 수정 후 다시 제출하세요.
        </div>
      )}

      {/* 카테고리 탭 */}
      <div className="sticky top-[60px] z-20 bg-white border-b overflow-x-auto">
        <div className="flex gap-1 p-2 min-w-max">
          {filteredCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-mc-red text-white'
                  : 'bg-gray-100 text-mc-gray'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 메뉴 그리드 */}
      <div className="flex-1 p-3">
        {filteredItems.length === 0 && (
          <p className="text-center text-mc-gray py-8">이 카테고리에 메뉴가 없습니다</p>
        )}
        <div className="grid grid-cols-2 gap-3">
          {filteredItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleAddItem(item)}
              className="bg-white rounded-xl p-3 text-left shadow-sm border border-gray-100 active:scale-95 transition-transform"
            >
              <div className="font-medium text-sm leading-tight mb-2">{item.name}</div>
              <div className="text-xs text-mc-gray">
                {item.is_set_available ? (
                  <>
                    <span>단품 {formatPrice(item.price)}</span>
                    <br />
                    <span className="font-bold text-mc-red">
                      세트 {timeSlot === 'lunch' && item.lunch_set_price ? (
                        <>
                          <span className="line-through text-mc-gray font-normal">{formatPrice(item.set_price ?? 0)}</span>
                          {' '}{formatPrice(item.lunch_set_price)}
                        </>
                      ) : formatPrice(item.set_price ?? 0)}
                    </span>
                  </>
                ) : (
                  <span className="font-bold text-mc-brown">{formatPrice(item.price)}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 장바구니 플로팅 바 */}
      {cart.items.length > 0 && !showCart && (
        <div className="sticky bottom-0 z-20 p-3 bg-white border-t">
          <button
            onClick={() => setShowCart(true)}
            className="w-full py-3 bg-mc-red text-white font-bold rounded-xl flex items-center justify-center gap-2"
          >
            <span className="bg-white text-mc-red w-6 h-6 rounded-full text-sm flex items-center justify-center font-bold">
              {cart.items.reduce((s, i) => s + i.quantity, 0)}
            </span>
            장바구니 보기
            <span className="ml-auto">{formatPrice(cartTotal)}</span>
          </button>
        </div>
      )}

      {/* 장바구니 풀스크린 */}
      {showCart && (
        <div className="fixed inset-0 z-40 bg-white flex flex-col">
          <div className="bg-mc-red text-white p-4 flex items-center justify-between">
            <button onClick={() => setShowCart(false)} className="text-white text-lg">&larr;</button>
            <h2 className="font-bold text-lg">장바구니</h2>
            <div />
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.items.map(item => (
              <div key={item.temp_id} className="bg-gray-50 rounded-xl p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">
                      {item.menu_item.name}
                      {item.is_set && ' 세트'}
                      {item.is_large && ' (라지)'}
                    </div>
                    {item.side_option && (
                      <div className="text-xs text-mc-gray">사이드: {item.side_option.name}</div>
                    )}
                    {item.drink_option && (
                      <div className="text-xs text-mc-gray">음료: {item.drink_option.name}</div>
                    )}
                  </div>
                  <button
                    onClick={() => cart.removeItem(item.temp_id)}
                    className="text-mc-gray text-lg leading-none"
                  >
                    &times;
                  </button>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => cart.updateQuantity(item.temp_id, item.quantity - 1)}
                      className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-sm"
                    >
                      -
                    </button>
                    <span className="font-medium">{item.quantity}</span>
                    <button
                      onClick={() => cart.updateQuantity(item.temp_id, item.quantity + 1)}
                      className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-sm"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-bold">{formatPrice(
                    calculateItemPrice(item.menu_item, item.is_set, item.is_large, item.side_option, item.drink_option, timeSlot) * item.quantity
                  )}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 정산 */}
          <div className="border-t p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>총 금액</span>
              <span className="font-bold">{formatPrice(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-mc-gray">
              <span>지원금</span>
              <span>-{formatPrice(config.subsidy_per_person)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>본인 부담금</span>
              <span className="text-mc-red">
                {formatPrice(Math.max(0, cartTotal - config.subsidy_per_person))}
              </span>
            </div>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setShowCart(false)}
                className="flex-1 py-3 border-2 border-mc-red text-mc-red font-bold rounded-xl"
              >
                메뉴 더 담기
              </button>
              <button
                onClick={handleSubmitOrder}
                disabled={submitting}
                className="flex-1 py-3 bg-mc-red text-white font-bold rounded-xl disabled:opacity-50 active:bg-mc-red-dark"
              >
                {submitting ? '주문 중...' : '주문 제출'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 세트 옵션 바텀시트 */}
      {selectedMenuItem && (
        <SetOptionSheet
          menuItem={selectedMenuItem}
          sideOptions={sideOptions}
          drinkOptions={drinkOptions}
          onConfirm={handleConfirmOption}
          onClose={() => setSelectedMenuItem(null)}
        />
      )}
    </div>
  )
}
