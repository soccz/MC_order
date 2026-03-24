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

      // 이름과 member_id를 세션스토리지에 저장
      sessionStorage.setItem('member_id', found.id)
      sessionStorage.setItem('member_name', found.name)
      router.push('/order')
    } catch {
      setError('서버 오류가 발생했습니다')
      setChecking(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      {/* 로고 영역 */}
      <div className="mb-8 text-center">
        <div className="w-20 h-20 bg-mc-red rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-mc-yellow text-3xl font-bold">M</span>
        </div>
        <h1 className="text-2xl font-bold text-mc-brown">MC 단체주문</h1>
        <div className="mt-2 inline-block px-3 py-1 bg-mc-yellow rounded-full text-sm font-medium">
          {getTimeSlotLabel(timeSlot)} 타임
        </div>
      </div>

      {/* 마감 상태 */}
      {!isLoading && !config.order_open && (
        <div className="w-full max-w-sm mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-center text-mc-red font-medium">
          주문이 마감되었습니다
        </div>
      )}

      {/* 이름 입력 폼 */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <input
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setError('') }}
          placeholder="이름을 입력하세요"
          className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-mc-red focus:outline-none text-center"
          disabled={!config.order_open}
        />

        {error && (
          <p className="mt-2 text-mc-red text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={checking || !config.order_open}
          className="w-full mt-4 py-3 bg-mc-red text-white text-lg font-bold rounded-xl disabled:opacity-50 active:bg-mc-red-dark transition-colors"
        >
          {checking ? '확인 중...' : '주문하기'}
        </button>
      </form>

      {/* 하단 링크 */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={() => router.push('/status')}
          className="px-4 py-2 text-sm text-mc-gray border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          주문 현황
        </button>
        <button
          onClick={() => router.push('/admin')}
          className="px-4 py-2 text-sm text-mc-gray border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          관리자
        </button>
      </div>
    </div>
  )
}
