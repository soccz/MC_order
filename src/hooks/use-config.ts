'use client'

import useSWR from 'swr'
import type { AppConfig } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useConfig() {
  const { data, error, isLoading, mutate } = useSWR<AppConfig>('/api/config', fetcher, {
    refreshInterval: 10000, // 10초마다 마감 상태 폴링
  })

  return {
    config: data ?? { subsidy_per_person: 0, order_open: true },
    isLoading,
    error,
    mutate,
  }
}
