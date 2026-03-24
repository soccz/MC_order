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
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="w-16 h-16 bg-mc-red rounded-full flex items-center justify-center mb-4">
          <span className="text-white text-2xl">🔒</span>
        </div>
        <h1 className="text-xl font-bold mb-6">관리자 인증</h1>
        <form onSubmit={handlePinSubmit} className="w-full max-w-xs">
          <input
            type="password"
            value={pin}
            onChange={(e) => { setPin(e.target.value); setPinError('') }}
            placeholder="PIN 입력"
            maxLength={4}
            className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl text-center tracking-widest focus:border-mc-red focus:outline-none"
          />
          {pinError && <p className="mt-2 text-mc-red text-sm text-center">{pinError}</p>}
          <button
            type="submit"
            className="w-full mt-4 py-3 bg-mc-red text-white font-bold rounded-xl active:bg-mc-red-dark"
          >
            확인
          </button>
        </form>
        <button onClick={() => router.push('/')} className="mt-4 text-mc-gray text-sm">
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
    <div className="flex flex-col min-h-screen">
      <div className="bg-mc-red text-white p-4 flex items-center justify-between">
        <button onClick={() => router.push('/')} className="text-white text-lg">&larr;</button>
        <h1 className="font-bold text-lg">관리자</h1>
        <div />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* 주문 열기/마감 */}
        <section className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-bold mb-3">주문 상태</h2>
          <button
            onClick={toggleOrderOpen}
            className={`w-full py-3 font-bold rounded-xl transition-colors ${
              config.order_open
                ? 'bg-green-500 text-white'
                : 'bg-gray-400 text-white'
            }`}
          >
            {config.order_open ? '주문 열림 (터치하여 마감)' : '주문 마감됨 (터치하여 열기)'}
          </button>
        </section>

        {/* 지원금 설정 */}
        <section className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-bold mb-3">1인당 지원금</h2>
          <div className="flex gap-2">
            <input
              type="number"
              value={subsidy}
              onChange={(e) => setSubsidy(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg text-right"
            />
            <span className="self-center">원</span>
            <button
              onClick={updateSubsidy}
              className="px-4 py-2 bg-mc-red text-white rounded-lg font-medium"
            >
              저장
            </button>
          </div>
        </section>

        {/* 멤버 관리 */}
        <section className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-bold mb-3">멤버 관리 ({members?.length ?? 0}명)</h2>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newMember}
              onChange={(e) => setNewMember(e.target.value)}
              placeholder="이름 입력"
              className="flex-1 px-3 py-2 border rounded-lg"
              onKeyDown={(e) => e.key === 'Enter' && addMember()}
            />
            <button
              onClick={addMember}
              className="px-4 py-2 bg-mc-yellow text-mc-brown rounded-lg font-medium"
            >
              추가
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(members ?? []).map(m => (
              <div key={m.id} className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1">
                <span className="text-sm">{m.name}</span>
                <button
                  onClick={() => deleteMember(m.id)}
                  className="text-mc-gray text-xs ml-1 hover:text-mc-red"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 주문 관리 */}
        <section className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-bold mb-3">주문 관리 ({orders?.length ?? 0}건)</h2>
          {(orders ?? []).length === 0 ? (
            <p className="text-sm text-mc-gray text-center py-3">주문이 없습니다</p>
          ) : (
            <div className="space-y-2">
              {(orders ?? []).map(order => (
                <div key={order.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{order.member_name}</div>
                    <div className="text-xs text-mc-gray truncate">
                      {order.items?.map(i => {
                        let label = i.menu_item_name ?? ''
                        if (i.is_set) label += ' 세트'
                        if (i.is_large) label += '(라지)'
                        if (i.quantity > 1) label += ` x${i.quantity}`
                        return label
                      }).join(', ')}
                    </div>
                    <div className="text-xs font-medium text-mc-red mt-0.5">
                      {order.total_price?.toLocaleString()}원
                    </div>
                  </div>
                  <button
                    onClick={() => deleteOrder(order.id, order.member_name)}
                    className="ml-2 px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg shrink-0"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 메뉴 관리 */}
        <section className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-bold mb-3">메뉴 관리</h2>
          <button
            onClick={() => router.push('/admin/menu')}
            className="w-full py-3 border-2 border-mc-red text-mc-red font-bold rounded-xl"
          >
            메뉴 관리 페이지
          </button>
        </section>

        {/* 주문 리셋 */}
        <section className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-bold mb-3 text-red-600">위험 구역</h2>
          <button
            onClick={resetOrders}
            disabled={resetting}
            className="w-full py-3 bg-red-600 text-white font-bold rounded-xl disabled:opacity-50"
          >
            {resetting ? '초기화 중...' : '전체 주문 리셋'}
          </button>
        </section>
      </div>
    </div>
  )
}
