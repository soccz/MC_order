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

  const filteredCategories = useMemo(() => {
    return categories.filter(c => c.is_active)
  }, [categories])

  useEffect(() => {
    if (!config.order_open && memberId) {
      alert('주문이 마감되었습니다')
      router.push('/')
    }
  }, [config.order_open, memberId, router])

  const filteredItems = useMemo(() => {
    if (!selectedCategory) return []
    return menuItems.filter(i => i.category_id === selectedCategory)
  }, [menuItems, selectedCategory])

  useEffect(() => {
    if (filteredCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(filteredCategories[0].id)
    }
  }, [filteredCategories, selectedCategory])

  const cartTotal = calculateCartTotal(cart.items, timeSlot)
  const cartCount = cart.items.reduce((s, i) => s + i.quantity, 0)

  function handleAddItem(item: MenuItem) {
    if (!item.is_set_available) {
      cart.addItem(item, false, false, null, null)
    } else {
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
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-mc-red/20 border-t-mc-red rounded-full animate-spin" />
          <span className="text-mc-gray text-sm">메뉴 불러오는 중...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      {/* 헤더 */}
      <div className="sticky top-0 z-30 bg-gradient-to-r from-mc-red to-mc-red-dark text-white px-4 py-3.5 shadow-md">
        <div className="flex items-center justify-between">
          <button onClick={() => router.push('/')} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <h1 className="font-bold text-base">{memberName}님의 주문</h1>
          <div className="px-2.5 py-1 bg-mc-yellow text-mc-brown text-[10px] font-bold rounded-full">
            {getTimeSlotLabel(timeSlot)}
          </div>
        </div>
      </div>

      {/* 기존 주문 알림 */}
      {hasExistingOrder && (
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-2.5 text-xs text-amber-700 text-center font-medium">
          기존 주문을 불러왔습니다. 수정 후 다시 제출하세요.
        </div>
      )}

      {/* 카테고리 탭 */}
      <div className="sticky top-[52px] z-20 bg-white border-b border-stone-100 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 px-4 py-3 min-w-max">
          {filteredCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-mc-red text-white shadow-sm shadow-mc-red/20'
                  : 'bg-stone-100 text-stone-500 active:bg-stone-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 메뉴 그리드 */}
      <div className="flex-1 px-4 py-4">
        {filteredItems.length === 0 && (
          <p className="text-center text-mc-gray text-sm py-12">이 카테고리에 메뉴가 없습니다</p>
        )}
        <div className="grid grid-cols-2 gap-3">
          {filteredItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleAddItem(item)}
              className="bg-white rounded-2xl p-4 text-left shadow-sm border border-stone-100 active:scale-[0.97] transition-all hover:shadow-md group"
            >
              <div className="font-semibold text-sm leading-snug text-stone-800 mb-3 line-clamp-2">{item.name}</div>
              <div className="space-y-0.5">
                {item.is_set_available ? (
                  <>
                    <div className="text-xs text-stone-400">단품 {formatPrice(item.price)}</div>
                    <div className="text-sm font-bold text-mc-red">
                      {timeSlot === 'lunch' && item.lunch_set_price ? (
                        <>
                          <span className="line-through text-stone-300 font-normal text-xs mr-1">{formatPrice(item.set_price ?? 0)}</span>
                          {formatPrice(item.lunch_set_price)}
                        </>
                      ) : (
                        <>세트 {formatPrice(item.set_price ?? 0)}</>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-sm font-bold text-stone-700">{formatPrice(item.price)}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 장바구니 플로팅 바 */}
      {cartCount > 0 && !showCart && (
        <div className="sticky bottom-0 z-20 p-4 bg-gradient-to-t from-stone-50 via-stone-50 to-stone-50/0 pt-8">
          <button
            onClick={() => setShowCart(true)}
            className="w-full py-3.5 bg-gradient-to-r from-mc-red to-mc-red-dark text-white font-bold rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-mc-red/25 active:scale-[0.98] transition-all"
          >
            <span className="bg-white/20 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold">
              {cartCount}
            </span>
            <span>장바구니 보기</span>
            <span className="ml-auto mr-1 text-white/80">{formatPrice(cartTotal)}</span>
          </button>
        </div>
      )}

      {/* 장바구니 풀스크린 */}
      {showCart && (
        <div className="fixed inset-0 z-40 bg-stone-50 flex flex-col animate-fade-in">
          <div className="bg-gradient-to-r from-mc-red to-mc-red-dark text-white px-4 py-3.5 shadow-md">
            <div className="flex items-center justify-between">
              <button onClick={() => setShowCart(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <h2 className="font-bold text-base">장바구니</h2>
              <div className="w-8" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {cart.items.map(item => (
              <div key={item.temp_id} className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
                <div className="flex justify-between items-start">
                  <div className="flex-1 mr-3">
                    <div className="font-semibold text-sm text-stone-800">
                      {item.menu_item.name}
                      {item.is_set && <span className="ml-1 text-mc-red"> 세트</span>}
                      {item.is_large && <span className="text-mc-yellow-light text-xs ml-1">(라지)</span>}
                    </div>
                    {item.side_option && (
                      <div className="text-xs text-stone-400 mt-1">사이드: {item.side_option.name}</div>
                    )}
                    {item.drink_option && (
                      <div className="text-xs text-stone-400">음료: {item.drink_option.name}</div>
                    )}
                  </div>
                  <button
                    onClick={() => cart.removeItem(item.temp_id)}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-stone-100 text-stone-400 hover:bg-red-50 hover:text-mc-red transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-stone-100">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => cart.updateQuantity(item.temp_id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-500 active:bg-stone-100 transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/></svg>
                    </button>
                    <span className="font-bold text-sm w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => cart.updateQuantity(item.temp_id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-500 active:bg-stone-100 transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                    </button>
                  </div>
                  <span className="font-bold text-stone-800">{formatPrice(
                    calculateItemPrice(item.menu_item, item.is_set, item.is_large, item.side_option, item.drink_option, timeSlot) * item.quantity
                  )}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 정산 */}
          <div className="bg-white border-t border-stone-200 px-5 py-4 space-y-2.5">
            <div className="flex justify-between text-sm text-stone-500">
              <span>총 금액</span>
              <span className="font-medium text-stone-800">{formatPrice(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-stone-400">
              <span>지원금</span>
              <span className="text-green-600">-{formatPrice(config.subsidy_per_person)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-stone-100 pt-3">
              <span className="text-stone-800">본인 부담금</span>
              <span className="text-mc-red">
                {formatPrice(Math.max(0, cartTotal - config.subsidy_per_person))}
              </span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowCart(false)}
                className="flex-1 py-3.5 border border-stone-200 text-stone-600 font-semibold rounded-2xl active:bg-stone-50 transition-colors"
              >
                더 담기
              </button>
              <button
                onClick={handleSubmitOrder}
                disabled={submitting}
                className="flex-1 py-3.5 bg-gradient-to-r from-mc-red to-mc-red-dark text-white font-bold rounded-2xl disabled:opacity-40 active:scale-[0.98] transition-all shadow-md shadow-mc-red/20"
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
