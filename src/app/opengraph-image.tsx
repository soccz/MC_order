import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'MC 단체주문'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #DA291C 0%, #B71C1C 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* 로고 */}
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: 70,
            background: '#FFC72C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 30,
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
          }}
        >
          <span style={{ fontSize: 80, fontWeight: 'bold', color: '#DA291C' }}>M</span>
        </div>

        {/* 타이틀 */}
        <div style={{ fontSize: 64, fontWeight: 'bold', color: 'white', marginBottom: 12 }}>
          MC 단체주문
        </div>

        {/* 서브타이틀 */}
        <div style={{ fontSize: 28, color: '#FFC72C', marginBottom: 40 }}>
          맥도날드 단체 주문 & 정산
        </div>

        {/* 하단 기능 태그 */}
        <div style={{ display: 'flex', gap: 16 }}>
          {['메뉴 선택', '키오스크 합산', '자동 정산'].map((tag) => (
            <div
              key={tag}
              style={{
                padding: '10px 24px',
                borderRadius: 50,
                background: 'rgba(255,255,255,0.15)',
                color: 'white',
                fontSize: 22,
                border: '1px solid rgba(255,255,255,0.3)',
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
