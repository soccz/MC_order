'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { formatPrice } from '@/lib/price'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface KioskItem {
  label: string
  quantity: number
  unit_price: number
}

interface Settlement {
  member_name: string
  items_label: string
  total_price: number
  subsidy: number
  self_pay: number
}

interface SummaryData {
  kiosk_summary: KioskItem[]
  settlements: Settlement[]
  totals: {
    order_count: number
    total_amount: number
    total_subsidy: number
    total_self_pay: number
  }
}

export default function StatusPage() {
  const router = useRouter()
  const { data, isLoading } = useSWR<SummaryData>('/api/summary', fetcher, { refreshInterval: 5000 })
  const [tab, setTab] = useState<'kiosk' | 'settlement'>('kiosk')

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-mc-gray">불러오는 중...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* 헤더 */}
      <div className="bg-mc-red text-white p-4 flex items-center justify-between">
        <button onClick={() => router.push('/')} className="text-white text-lg">&larr;</button>
        <h1 className="font-bold text-lg">주문 현황</h1>
        <div className="text-sm">{data.totals.order_count}명</div>
      </div>

      {/* 탭 */}
      <div className="flex border-b bg-white">
        <button
          onClick={() => setTab('kiosk')}
          className={`flex-1 py-3 text-sm font-bold transition-colors ${
            tab === 'kiosk' ? 'text-mc-red border-b-2 border-mc-red' : 'text-mc-gray'
          }`}
        >
          키오스크 입력용
        </button>
        <button
          onClick={() => setTab('settlement')}
          className={`flex-1 py-3 text-sm font-bold transition-colors ${
            tab === 'settlement' ? 'text-mc-red border-b-2 border-mc-red' : 'text-mc-gray'
          }`}
        >
          개인별 정산
        </button>
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'kiosk' ? (
          <div className="space-y-2">
            {data.kiosk_summary.length === 0 ? (
              <p className="text-center text-mc-gray py-8">아직 주문이 없습니다</p>
            ) : (
              <>
                {data.kiosk_summary.map((item, i) => (
                  <div key={i} className="flex justify-between items-center bg-white rounded-xl p-3 shadow-sm">
                    <div>
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-mc-gray">{formatPrice(item.unit_price)}</span>
                      <span className="bg-mc-red text-white text-sm font-bold px-2.5 py-0.5 rounded-full">
                        x{item.quantity}
                      </span>
                    </div>
                  </div>
                ))}

                {/* 합계 */}
                <div className="mt-4 bg-mc-yellow/20 rounded-xl p-4 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>총 주문</span>
                    <span>{data.totals.order_count}건</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>총 금액</span>
                    <span className="text-mc-red">{formatPrice(data.totals.total_amount)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {data.settlements.length === 0 ? (
              <p className="text-center text-mc-gray py-8">아직 주문이 없습니다</p>
            ) : (
              <>
                {data.settlements.map((s, i) => (
                  <div key={i} className="bg-white rounded-xl p-3 shadow-sm">
                    <div className="flex justify-between items-start">
                      <span className="font-bold">{s.member_name}</span>
                      <span className="text-mc-red font-bold">{formatPrice(s.self_pay)}</span>
                    </div>
                    <div className="text-xs text-mc-gray mt-1">{s.items_label}</div>
                    <div className="flex justify-between text-xs text-mc-gray mt-1">
                      <span>주문 {formatPrice(s.total_price)} - 지원 {formatPrice(s.subsidy)}</span>
                    </div>
                  </div>
                ))}

                {/* 합계 */}
                <div className="mt-4 bg-mc-yellow/20 rounded-xl p-4 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>총 지원금</span>
                    <span>{formatPrice(data.totals.total_subsidy)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>총 본인부담금</span>
                    <span className="text-mc-red">{formatPrice(data.totals.total_self_pay)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
