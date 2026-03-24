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
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-mc-red/20 border-t-mc-red rounded-full animate-spin" />
          <span className="text-mc-gray text-sm">불러오는 중...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-mc-red to-mc-red-dark text-white px-4 py-3.5 shadow-md">
        <div className="flex items-center justify-between">
          <button onClick={() => router.push('/')} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <h1 className="font-bold text-base">주문 현황</h1>
          <div className="bg-white/15 px-2.5 py-0.5 rounded-full text-xs font-bold">{data.totals.order_count}명</div>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex bg-white border-b border-stone-100">
        <button
          onClick={() => setTab('kiosk')}
          className={`flex-1 py-3 text-sm font-bold transition-all relative ${
            tab === 'kiosk' ? 'text-mc-red' : 'text-stone-400'
          }`}
        >
          키오스크 입력용
          {tab === 'kiosk' && <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-mc-red rounded-full" />}
        </button>
        <button
          onClick={() => setTab('settlement')}
          className={`flex-1 py-3 text-sm font-bold transition-all relative ${
            tab === 'settlement' ? 'text-mc-red' : 'text-stone-400'
          }`}
        >
          개인별 정산
          {tab === 'settlement' && <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-mc-red rounded-full" />}
        </button>
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {tab === 'kiosk' ? (
          <div className="space-y-2">
            {data.kiosk_summary.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-4xl mb-3 opacity-30">🍔</div>
                <p className="text-stone-400 text-sm">아직 주문이 없습니다</p>
              </div>
            ) : (
              <>
                {data.kiosk_summary.map((item, i) => (
                  <div key={i} className="flex justify-between items-center bg-white rounded-2xl px-4 py-3 shadow-sm border border-stone-100">
                    <div className="flex-1 mr-3">
                      <span className="font-semibold text-sm text-stone-800">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-xs text-stone-400">{formatPrice(item.unit_price)}</span>
                      <span className="bg-mc-red text-white text-xs font-bold min-w-[32px] text-center py-1 px-2 rounded-full">
                        x{item.quantity}
                      </span>
                    </div>
                  </div>
                ))}

                <div className="mt-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 space-y-2 border border-amber-100/50">
                  <div className="flex justify-between text-sm text-stone-600">
                    <span>총 주문</span>
                    <span className="font-semibold">{data.totals.order_count}건</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span className="text-stone-800">총 금액</span>
                    <span className="text-mc-red">{formatPrice(data.totals.total_amount)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {data.settlements.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-4xl mb-3 opacity-30">💰</div>
                <p className="text-stone-400 text-sm">아직 주문이 없습니다</p>
              </div>
            ) : (
              <>
                {data.settlements.map((s, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-stone-800">{s.member_name}</span>
                      <span className="text-mc-red font-bold text-lg">{formatPrice(s.self_pay)}</span>
                    </div>
                    <div className="text-xs text-stone-400 leading-relaxed">{s.items_label}</div>
                    <div className="flex gap-3 mt-2 pt-2 border-t border-stone-50 text-xs text-stone-400">
                      <span>주문 {formatPrice(s.total_price)}</span>
                      <span className="text-green-600">- 지원 {formatPrice(s.subsidy)}</span>
                    </div>
                  </div>
                ))}

                <div className="mt-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 space-y-2 border border-amber-100/50">
                  <div className="flex justify-between text-sm text-stone-600">
                    <span>총 지원금</span>
                    <span className="font-semibold text-green-600">{formatPrice(data.totals.total_subsidy)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span className="text-stone-800">총 본인부담금</span>
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
