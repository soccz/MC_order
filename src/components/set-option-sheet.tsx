'use client'

import { useState } from 'react'
import type { MenuItem, SideOption, DrinkOption } from '@/lib/types'
import { calculateItemPrice, getCurrentTimeSlot, formatPrice } from '@/lib/price'

interface Props {
  menuItem: MenuItem
  sideOptions: SideOption[]
  drinkOptions: DrinkOption[]
  onConfirm: (isSet: boolean, isLarge: boolean, side: SideOption | null, drink: DrinkOption | null) => void
  onClose: () => void
}

export default function SetOptionSheet({ menuItem, sideOptions, drinkOptions, onConfirm, onClose }: Props) {
  const [isSet, setIsSet] = useState(menuItem.is_set_available)
  const [isLarge, setIsLarge] = useState(false)
  const [selectedSide, setSelectedSide] = useState<SideOption | null>(
    sideOptions.find(s => s.is_default) ?? null
  )
  const [selectedDrink, setSelectedDrink] = useState<DrinkOption | null>(
    drinkOptions.find(d => d.is_default) ?? null
  )

  const timeSlot = getCurrentTimeSlot()
  const price = calculateItemPrice(menuItem, isSet, isLarge, selectedSide, selectedDrink, timeSlot)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 animate-fade-in" />
      <div
        className="relative w-full max-w-lg bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 핸들 */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-stone-200" />
        </div>

        {/* 헤더 */}
        <div className="sticky top-0 bg-white px-5 py-3 flex justify-between items-center">
          <h2 className="text-lg font-bold text-stone-800">{menuItem.name}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="px-5 pb-4 space-y-5">
          {/* 단품/세트 선택 */}
          {menuItem.is_set_available && menuItem.set_price && (
            <div>
              <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2.5">주문 유형</h3>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setIsSet(false)}
                  className={`py-3.5 rounded-2xl border-2 font-semibold text-sm transition-all ${
                    !isSet ? 'border-mc-red bg-red-50 text-mc-red shadow-sm shadow-mc-red/10' : 'border-stone-200 text-stone-500'
                  }`}
                >
                  <div>단품</div>
                  <div className="text-xs mt-0.5 opacity-70">{formatPrice(menuItem.price)}</div>
                </button>
                <button
                  onClick={() => setIsSet(true)}
                  className={`py-3.5 rounded-2xl border-2 font-semibold text-sm transition-all ${
                    isSet ? 'border-mc-red bg-red-50 text-mc-red shadow-sm shadow-mc-red/10' : 'border-stone-200 text-stone-500'
                  }`}
                >
                  <div>세트</div>
                  <div className="text-xs mt-0.5 opacity-70">{formatPrice(menuItem.set_price)}</div>
                </button>
              </div>
            </div>
          )}

          {/* 세트 옵션들 */}
          {isSet && (
            <>
              {/* 사이드 선택 */}
              <div>
                <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2.5">사이드 선택</h3>
                <div className="space-y-2">
                  {sideOptions.map(side => (
                    <button
                      key={side.id}
                      onClick={() => setSelectedSide(side)}
                      className={`w-full flex justify-between items-center px-4 py-3 rounded-2xl border-2 transition-all ${
                        selectedSide?.id === side.id ? 'border-mc-red bg-red-50/50' : 'border-stone-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          selectedSide?.id === side.id ? 'border-mc-red bg-mc-red' : 'border-stone-300'
                        }`}>
                          {selectedSide?.id === side.id && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          )}
                        </div>
                        <span className="font-medium text-sm text-stone-700">
                          {isLarge && side.large_name ? side.large_name : side.name}
                        </span>
                      </div>
                      {side.extra_price > 0 && (
                        <span className="text-xs font-semibold text-mc-red">+{formatPrice(side.extra_price)}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 음료 선택 */}
              <div>
                <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2.5">음료 선택</h3>
                <div className="space-y-2">
                  {drinkOptions.map(drink => (
                    <button
                      key={drink.id}
                      onClick={() => setSelectedDrink(drink)}
                      className={`w-full flex justify-between items-center px-4 py-3 rounded-2xl border-2 transition-all ${
                        selectedDrink?.id === drink.id ? 'border-mc-red bg-red-50/50' : 'border-stone-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          selectedDrink?.id === drink.id ? 'border-mc-red bg-mc-red' : 'border-stone-300'
                        }`}>
                          {selectedDrink?.id === drink.id && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          )}
                        </div>
                        <span className="font-medium text-sm text-stone-700">
                          {isLarge && drink.large_name ? drink.large_name : drink.name}
                        </span>
                      </div>
                      {drink.extra_price > 0 && (
                        <span className="text-xs font-semibold text-mc-red">+{formatPrice(drink.extra_price)}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 라지업 */}
              <div>
                <button
                  onClick={() => setIsLarge(!isLarge)}
                  className={`w-full flex justify-between items-center px-4 py-3.5 rounded-2xl border-2 transition-all ${
                    isLarge ? 'border-mc-yellow bg-amber-50 shadow-sm shadow-amber-100' : 'border-stone-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                      isLarge ? 'bg-mc-yellow' : 'border-2 border-stone-300'
                    }`}>
                      {isLarge && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      )}
                    </div>
                    <span className="font-semibold text-sm text-stone-700">라지세트로 업그레이드</span>
                  </div>
                  <span className="text-xs font-semibold text-mc-red">+{formatPrice(menuItem.large_set_extra)}</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* 하단 확인 */}
        <div className="sticky bottom-0 bg-white border-t border-stone-100 p-4">
          <button
            onClick={() => onConfirm(isSet, isLarge, isSet ? selectedSide : null, isSet ? selectedDrink : null)}
            className="w-full py-4 bg-gradient-to-r from-mc-red to-mc-red-dark text-white text-base font-bold rounded-2xl active:scale-[0.98] transition-all shadow-lg shadow-mc-red/20"
          >
            {formatPrice(price)} 담기
          </button>
        </div>
      </div>
    </div>
  )
}
