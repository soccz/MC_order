'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useConfig } from '@/hooks/use-config'
import { getCurrentTimeSlot, getTimeSlotLabel } from '@/lib/price'

export default function HomePage() {
  const router = useRouter()
  const { config, isLoading } = useConfig()
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)

  const timeSlot = getCurrentTimeSlot()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('이름을 입력해주세요')
      return
    }

    setChecking(true)
    setError('')

    try {
      const res = await fetch('/api/members')
      const members = await res.json()
      const found = members.find((m: { name: string }) =>
        m.name === name.trim()
      )

      if (!found) {
        setError('등록되지 않은 이름입니다')
        setChecking(false)
        return
      }

      sessionStorage.setItem('member_id', found.id)
      sessionStorage.setItem('member_name', found.name)
      router.push('/order')
    } catch {
      setError('서버 오류가 발생했습니다')
      setChecking(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
      {/* 로고 */}
      <div className="mb-10 text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-mc-red to-mc-red-dark rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-mc-red/25">
          <span className="text-mc-yellow text-4xl font-bold tracking-tight">M</span>
        </div>
        <h1 className="text-2xl font-bold text-mc-brown tracking-tight">MC 단체주문</h1>
        <p className="mt-1.5 text-mc-gray text-sm">메뉴를 골라 주문하세요</p>
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-mc-yellow/20 text-mc-yellow-light rounded-full text-xs font-semibold border border-mc-yellow/30">
          <span className="w-1.5 h-1.5 rounded-full bg-mc-yellow animate-pulse" />
          {getTimeSlotLabel(timeSlot)} 타임
        </div>
      </div>

      {/* 마감 상태 */}
      {!isLoading && !config.order_open && (
        <div className="w-full max-w-sm mb-5 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl text-center text-mc-red text-sm font-medium">
          주문이 마감되었습니다
        </div>
      )}

      {/* 이름 입력 */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <div className="relative">
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError('') }}
            placeholder="이름을 입력하세요"
            className="w-full px-5 py-4 text-base bg-white border border-stone-200 rounded-2xl focus:border-mc-red focus:ring-2 focus:ring-mc-red/10 focus:outline-none text-center placeholder:text-stone-300 transition-all"
            disabled={!config.order_open}
          />
        </div>

        {error && (
          <p className="mt-2.5 text-mc-red text-sm text-center font-medium">{error}</p>
        )}

        <button
          type="submit"
          disabled={checking || !config.order_open}
          className="w-full mt-4 py-4 bg-gradient-to-r from-mc-red to-mc-red-dark text-white text-base font-bold rounded-2xl disabled:opacity-40 active:scale-[0.98] transition-all shadow-lg shadow-mc-red/20"
        >
          {checking ? '확인 중...' : '주문하기'}
        </button>
      </form>

      {/* 하단 링크 */}
      <div className="mt-10 flex gap-3">
        <button
          onClick={() => router.push('/status')}
          className="px-5 py-2.5 text-sm text-mc-gray bg-white border border-stone-200 rounded-xl hover:bg-stone-50 active:scale-[0.97] transition-all"
        >
          주문 현황
        </button>
        <button
          onClick={() => router.push('/admin')}
          className="px-5 py-2.5 text-sm text-mc-gray bg-white border border-stone-200 rounded-xl hover:bg-stone-50 active:scale-[0.97] transition-all"
        >
          관리자
        </button>
      </div>
    </div>
  )
}
