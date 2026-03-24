'use client'

import { create } from 'zustand'
import type { CartItem, MenuItem, SideOption, DrinkOption } from '@/lib/types'
import { calculateItemPrice, getCurrentTimeSlot } from '@/lib/price'

interface CartStore {
  items: CartItem[]
  addItem: (
    menuItem: MenuItem,
    isSet: boolean,
    isLarge: boolean,
    sideOption: SideOption | null,
    drinkOption: DrinkOption | null,
  ) => void
  removeItem: (tempId: string) => void
  updateQuantity: (tempId: string, quantity: number) => void
  clearCart: () => void
  loadFromOrder: (items: CartItem[]) => void
}

export const useCart = create<CartStore>((set) => ({
  items: [],

  addItem: (menuItem, isSet, isLarge, sideOption, drinkOption) => {
    const timeSlot = getCurrentTimeSlot()
    const calculated_price = calculateItemPrice(menuItem, isSet, isLarge, sideOption, drinkOption, timeSlot)

    const newItem: CartItem = {
      temp_id: crypto.randomUUID(),
      menu_item: menuItem,
      is_set: isSet,
      is_large: isLarge,
      side_option: sideOption,
      drink_option: drinkOption,
      quantity: 1,
      calculated_price,
    }

    set((state) => ({ items: [...state.items, newItem] }))
  },

  removeItem: (tempId) => {
    set((state) => ({ items: state.items.filter(i => i.temp_id !== tempId) }))
  },

  updateQuantity: (tempId, quantity) => {
    if (quantity < 1) return
    set((state) => ({
      items: state.items.map(i =>
        i.temp_id === tempId ? { ...i, quantity } : i
      ),
    }))
  },

  clearCart: () => set({ items: [] }),

  loadFromOrder: (items) => set({ items }),
}))
