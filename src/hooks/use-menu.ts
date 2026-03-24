'use client'

import useSWR from 'swr'
import type { Category, MenuItem, SideOption, DrinkOption } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface MenuData {
  categories: Category[]
  items: MenuItem[]
  side_options: SideOption[]
  drink_options: DrinkOption[]
}

export function useMenu() {
  const { data, error, isLoading, mutate } = useSWR<MenuData>('/api/menu', fetcher)

  return {
    categories: data?.categories ?? [],
    menuItems: data?.items ?? [],
    sideOptions: data?.side_options ?? [],
    drinkOptions: data?.drink_options ?? [],
    isLoading,
    error,
    mutate,
  }
}
