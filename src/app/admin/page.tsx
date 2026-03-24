'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { useConfig } from '@/hooks/use-config'
import type { Member } from '@/lib/types'

import { adminHeaders } from '@/lib/admin-client'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function AdminPage() {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')

  useEffect(() => {
    if (sessionStorage.getItem('admin_pin')) {
      setAuthenticated(true)
    }
  }, [])

  async function handlePinSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'X-Admin-PIN': pin },
    })
    if (res.ok) {
      sessionStorage.setItem('admin_pin', pin)
      setAuthenticated(true)
    } else {
      setPinError('PIN이 올바르지 않습니다')
    }
  }

  if (!authenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <div className="w-16 h-16 bg-gradient-to-br from-stone-700 to-stone-900 rounded-2xl flex items-center justify-center mb-5 shadow-lg">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
        </div>
        <h1 className="text-xl font-bold mb-1 text-stone-800">관리자 인증</h1>
        <p className="text-sm text-stone-400 mb-6">PIN을 입력하세요</p>
        <form onSubmit={handlePinSubmit} className="w-full max-w-xs">
          <input
            type="password"
            value={pin}
            onChange={(e) => { setPin(e.target.value); setPinError('') }}
            placeholder="••••"
            maxLength={4}
            className="w-full px-5 py-4 text-xl bg-white border border-stone-200 rounded-2xl text-center tracking-[0.5em] focus:border-mc-red focus:ring-2 focus:ring-mc-red/10 focus:outline-none transition-all"
          />
          {pinError && <p className="mt-2.5 text-mc-red text-sm text-center font-medium">{pinError}</p>}
          <button
            type="submit"
            className="w-full mt-4 py-3.5 bg-gradient-to-r from-stone-800 to-stone-900 text-white font-bold rounded-2xl active:scale-[0.98] transition-all"
          >
            확인
          </button>
        </form>
        <button onClick={() => router.push('/')} className="mt-6 text-stone-400 text-sm">
          돌아가기
        </button>
      </div>
    )
  }

  return <AdminDashboard />
}

function AdminDashboard() {
  const router = useRouter()
  const { config, mutate: mutateConfig } = useConfig()
  const { data: members, mutate: mutateMembers } = useSWR<Member[]>('/api/members', fetcher)
  const { data: orders, mutate: mutateOrders } = useSWR<{ id: string; member_name: string; total_price: number; items: { menu_item_name: string; is_set: boolean; is_large: boolean; side_option_name?: string; drink_option_name?: string; quantity: number }[] }[]>('/api/orders', fetcher, { refreshInterval: 5000 })

  const [subsidy, setSubsidy] = useState('')
  const [newMember, setNewMember] = useState('')
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    if (config.subsidy_per_person) {
      setSubsidy(String(config.subsidy_per_person))
    }
  }, [config.subsidy_per_person])

  async function updateSubsidy() {
    await fetch('/api/config', {
      method: 'PUT',
      headers: adminHeaders(),
      body: JSON.stringify({ subsidy_per_person: Number(subsidy) }),
    })
    mutateConfig()
  }

  async function toggleOrderOpen() {
    await fetch('/api/config', {
      method: 'PUT',
      headers: adminHeaders(),
      body: JSON.stringify({ order_open: !config.order_open }),
    })
    mutateConfig()
  }

  async function addMember() {
    if (!newMember.trim()) return
    await fetch('/api/members', {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify({ name: newMember.trim() }),
    })
    setNewMember('')
    mutateMembers()
  }

  async function deleteMember(id: string) {
    if (!confirm('정말 삭제하시겠습니까?')) return
    await fetch(`/api/members?id=${id}`, {
      method: 'DELETE',
      headers: adminHeaders(),
    })
    mutateMembers()
  }

  async function deleteOrder(orderId: string, memberName: string) {
    if (!confirm(`${memberName}님의 주문을 삭제하시겠습니까?`)) return
    await fetch(`/api/orders/${orderId}`, {
      method: 'DELETE',
      headers: adminHeaders(),
    })
    mutateOrders()
  }

  async function resetOrders() {
    if (!confirm('모든 주문을 삭제합니다. 계속하시겠습니까?')) return
    setResetting(true)
    await fetch('/api/orders/reset', {
      method: 'POST',
      headers: adminHeaders(),
    })
    setResetting(false)
    mutateOrders()
    alert('주문이 초기화되었습니다')
  }

  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      <div className="bg-gradient-to-r from-stone-800 to-stone-900 text-white px-4 py-3.5 shadow-md">
        <div className="flex items-center justify-between">
          <button onClick={() => router.push('/')} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <h1 className="font-bold text-base">관리자</h1>
          <div className="w-8" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* 주문 열기/마감 */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">주문 상태</h2>
          <button
            onClick={toggleOrderOpen}
            className={`w-full py-3.5 font-bold rounded-2xl transition-all ${
              config.order_open
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200'
                : 'bg-stone-300 text-white'
            }`}
          >
            {config.order_open ? '주문 열림 (터치하여 마감)' : '주문 마감됨 (터치하여 열기)'}
          </button>
        </section>

        {/* 지원금 설정 */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">1인당 지원금</h2>
          <div className="flex gap-2">
            <input
              type="number"
              value={subsidy}
              onChange={(e) => setSubsidy(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-right focus:outline-none focus:border-mc-red transition-colors"
            />
            <span className="self-center text-stone-400 text-sm">원</span>
            <button
              onClick={updateSubsidy}
              className="px-5 py-2.5 bg-mc-red text-white rounded-xl font-medium text-sm"
            >
              저장
            </button>
          </div>
        </section>

        {/* 멤버 관리 */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">멤버 관리 ({members?.length ?? 0}명)</h2>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newMember}
              onChange={(e) => setNewMember(e.target.value)}
              placeholder="이름 입력"
              className="flex-1 px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-mc-red transition-colors"
              onKeyDown={(e) => e.key === 'Enter' && addMember()}
            />
            <button
              onClick={addMember}
              className="px-5 py-2.5 bg-mc-yellow text-mc-brown rounded-xl font-medium text-sm"
            >
              추가
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(members ?? []).map(m => (
              <div key={m.id} className="flex items-center gap-1.5 bg-stone-100 rounded-full px-3 py-1.5">
                <span className="text-sm text-stone-700">{m.name}</span>
                <button
                  onClick={() => deleteMember(m.id)}
                  className="w-4 h-4 flex items-center justify-center rounded-full text-stone-400 hover:bg-red-100 hover:text-mc-red transition-colors"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 주문 관리 */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">주문 관리 ({orders?.length ?? 0}건)</h2>
          {(orders ?? []).length === 0 ? (
            <p className="text-sm text-stone-400 text-center py-4">주문이 없습니다</p>
          ) : (
            <div className="space-y-2">
              {(orders ?? []).map(order => (
                <div key={order.id} className="flex items-center justify-between bg-stone-50 rounded-xl p-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-stone-800">{order.member_name}</div>
                    <div className="text-xs text-stone-400 truncate mt-0.5">
                      {order.items?.map(i => {
                        let label = i.menu_item_name ?? ''
                        if (i.is_set) label += ' 세트'
                        if (i.is_large) label += '(라지)'
                        if (i.quantity > 1) label += ` x${i.quantity}`
                        return label
                      }).join(', ')}
                    </div>
                    <div className="text-xs font-semibold text-mc-red mt-0.5">
                      {order.total_price?.toLocaleString()}원
                    </div>
                  </div>
                  <button
                    onClick={() => deleteOrder(order.id, order.member_name)}
                    className="ml-3 px-3 py-1.5 text-xs bg-red-50 text-red-500 rounded-lg shrink-0 font-medium hover:bg-red-100 transition-colors"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 메뉴 관리 */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">메뉴 관리</h2>
          <button
            onClick={() => router.push('/admin/menu')}
            className="w-full py-3 border border-mc-red text-mc-red font-semibold rounded-xl active:bg-red-50 transition-colors text-sm"
          >
            메뉴 관리 페이지
          </button>
        </section>

        {/* 주문 리셋 */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-red-100">
          <h2 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3">위험 구역</h2>
          <button
            onClick={resetOrders}
            disabled={resetting}
            className="w-full py-3 bg-red-500 text-white font-bold rounded-xl disabled:opacity-40 active:bg-red-600 transition-colors text-sm"
          >
            {resetting ? '초기화 중...' : '전체 주문 리셋'}
          </button>
        </section>
      </div>
    </div>
  )
}
