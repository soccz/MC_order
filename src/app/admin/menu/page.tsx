'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMenu } from '@/hooks/use-menu'
import { formatPrice } from '@/lib/price'
import type { MenuItem, Category } from '@/lib/types'

import { adminHeaders } from '@/lib/admin-client'

export default function MenuManagePage() {
  const router = useRouter()
  const { categories, menuItems, mutate } = useMenu()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => {
    if (!sessionStorage.getItem('admin_pin')) {
      router.push('/admin')
    }
  }, [router])

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id)
    }
  }, [categories, selectedCategory])

  const filtered = menuItems.filter(i => i.category_id === selectedCategory)

  async function handleSave(item: Partial<MenuItem> & { id?: string }) {
    if (item.id) {
      await fetch('/api/menu', {
        method: 'PUT',
        headers: adminHeaders(),
        body: JSON.stringify(item),
      })
    } else {
      await fetch('/api/menu', {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({ ...item, category_id: selectedCategory }),
      })
    }
    setEditingItem(null)
    setShowAdd(false)
    mutate()
  }

  async function handleDelete(id: string) {
    if (!confirm('메뉴를 삭제하시겠습니까?')) return
    await fetch(`/api/menu?id=${id}`, {
      method: 'DELETE',
      headers: adminHeaders(),
    })
    mutate()
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-mc-red text-white p-4 flex items-center justify-between">
        <button onClick={() => router.push('/admin')} className="text-white text-lg">&larr;</button>
        <h1 className="font-bold text-lg">메뉴 관리</h1>
        <button onClick={() => setShowAdd(true)} className="text-mc-yellow font-bold text-2xl">+</button>
      </div>

      {/* 카테고리 탭 */}
      <div className="overflow-x-auto bg-white border-b">
        <div className="flex gap-1 p-2 min-w-max">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                selectedCategory === cat.id ? 'bg-mc-red text-white' : 'bg-gray-100 text-mc-gray'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 메뉴 리스트 */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered.map(item => (
          <div key={item.id} className="bg-white rounded-xl p-3 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-xs text-mc-gray mt-1">
                  단품 {formatPrice(item.price)}
                  {item.set_price && ` / 세트 ${formatPrice(item.set_price)}`}
                  {item.lunch_set_price && ` / 런치 ${formatPrice(item.lunch_set_price)}`}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingItem(item)}
                  className="text-xs px-2 py-1 bg-gray-100 rounded-lg"
                >
                  수정
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-lg"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 수정/추가 모달 */}
      {(editingItem || showAdd) && (
        <MenuEditModal
          item={editingItem}
          onSave={handleSave}
          onClose={() => { setEditingItem(null); setShowAdd(false) }}
        />
      )}
    </div>
  )
}

function MenuEditModal({
  item,
  onSave,
  onClose,
}: {
  item: MenuItem | null
  onSave: (item: Partial<MenuItem> & { id?: string }) => void
  onClose: () => void
}) {
  const [name, setName] = useState(item?.name ?? '')
  const [price, setPrice] = useState(String(item?.price ?? ''))
  const [setPrice2, setSetPrice] = useState(String(item?.set_price ?? ''))
  const [lunchPrice, setLunchPrice] = useState(String(item?.lunch_set_price ?? ''))
  const [largeExtra, setLargeExtra] = useState(String(item?.large_set_extra ?? 900))
  const [isSetAvailable, setIsSetAvailable] = useState(item?.is_set_available ?? false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      ...(item?.id ? { id: item.id } : {}),
      name,
      price: Number(price),
      set_price: setPrice2 ? Number(setPrice2) : null,
      lunch_set_price: lunchPrice ? Number(lunchPrice) : null,
      large_set_extra: Number(largeExtra) || 900,
      is_set_available: isSetAvailable,
      sort_order: item?.sort_order ?? 99,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative w-full max-w-lg bg-white rounded-t-2xl p-5" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-4">{item ? '메뉴 수정' : '메뉴 추가'}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="메뉴명" required
            className="w-full px-3 py-2 border rounded-lg" />
          <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="단품 가격" required
            className="w-full px-3 py-2 border rounded-lg" />

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isSetAvailable} onChange={e => setIsSetAvailable(e.target.checked)} />
            <span className="text-sm">세트 가능</span>
          </label>

          {isSetAvailable && (
            <>
              <input type="number" value={setPrice2} onChange={e => setSetPrice(e.target.value)} placeholder="세트 가격"
                className="w-full px-3 py-2 border rounded-lg" />
              <input type="number" value={lunchPrice} onChange={e => setLunchPrice(e.target.value)} placeholder="런치 세트 가격 (선택)"
                className="w-full px-3 py-2 border rounded-lg" />
              <input type="number" value={largeExtra} onChange={e => setLargeExtra(e.target.value)} placeholder="라지 추가금 (기본 900)"
                className="w-full px-3 py-2 border rounded-lg" />
            </>
          )}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 border rounded-lg">취소</button>
            <button type="submit" className="flex-1 py-2 bg-mc-red text-white rounded-lg font-medium">저장</button>
          </div>
        </form>
      </div>
    </div>
  )
}
