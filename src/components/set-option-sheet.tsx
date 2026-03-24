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
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full max-w-lg bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold">{menuItem.name}</h2>
          <button onClick={onClose} className="text-mc-gray text-2xl leading-none">&times;</button>
        </div>

        <div className="p-4 space-y-5">
          {/* 단품/세트 선택 */}
          {menuItem.is_set_available && menuItem.set_price && (
            <div>
              <h3 className="text-sm font-bold text-mc-gray mb-2">주문 유형</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setIsSet(false)}
                  className={`py-3 rounded-xl border-2 font-medium transition-colors ${
                    !isSet ? 'border-mc-red bg-red-50 text-mc-red' : 'border-gray-200'
                  }`}
                >
                  단품 {formatPrice(menuItem.price)}
                </button>
                <button
                  onClick={() => setIsSet(true)}
                  className={`py-3 rounded-xl border-2 font-medium transition-colors ${
                    isSet ? 'border-mc-red bg-red-50 text-mc-red' : 'border-gray-200'
                  }`}
                >
                  세트 {formatPrice(menuItem.set_price)}
                </button>
              </div>
            </div>
          )}

          {/* 세트 옵션들 */}
          {isSet && (
            <>
              {/* 사이드 선택 */}
              <div>
                <h3 className="text-sm font-bold text-mc-gray mb-2">사이드 선택</h3>
                <div className="space-y-2">
                  {sideOptions.map(side => (
                    <button
                      key={side.id}
                      onClick={() => setSelectedSide(side)}
                      className={`w-full flex justify-between items-center p-3 rounded-xl border-2 transition-colors ${
                        selectedSide?.id === side.id ? 'border-mc-red bg-red-50' : 'border-gray-200'
                      }`}
                    >
                      <span className="font-medium">
                        {isLarge && side.large_name ? side.large_name : side.name}
                      </span>
                      {side.extra_price > 0 && (
                        <span className="text-sm text-mc-red">+{formatPrice(side.extra_price)}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 음료 선택 */}
              <div>
                <h3 className="text-sm font-bold text-mc-gray mb-2">음료 선택</h3>
                <div className="space-y-2">
                  {drinkOptions.map(drink => (
                    <button
                      key={drink.id}
                      onClick={() => setSelectedDrink(drink)}
                      className={`w-full flex justify-between items-center p-3 rounded-xl border-2 transition-colors ${
                        selectedDrink?.id === drink.id ? 'border-mc-red bg-red-50' : 'border-gray-200'
                      }`}
                    >
                      <span className="font-medium">
                        {isLarge && drink.large_name ? drink.large_name : drink.name}
                      </span>
                      {drink.extra_price > 0 && (
                        <span className="text-sm text-mc-red">+{formatPrice(drink.extra_price)}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 라지업 */}
              <div>
                <button
                  onClick={() => setIsLarge(!isLarge)}
                  className={`w-full flex justify-between items-center p-3 rounded-xl border-2 transition-colors ${
                    isLarge ? 'border-mc-yellow bg-yellow-50' : 'border-gray-200'
                  }`}
                >
                  <span className="font-medium">라지세트로 업그레이드</span>
                  <span className="text-sm text-mc-red">+{formatPrice(menuItem.large_set_extra)}</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* 하단 확인 */}
        <div className="sticky bottom-0 bg-white border-t p-4">
          <button
            onClick={() => onConfirm(isSet, isLarge, isSet ? selectedSide : null, isSet ? selectedDrink : null)}
            className="w-full py-3 bg-mc-red text-white text-lg font-bold rounded-xl active:bg-mc-red-dark transition-colors"
          >
            {formatPrice(price)} 담기
          </button>
        </div>
      </div>
    </div>
  )
}
