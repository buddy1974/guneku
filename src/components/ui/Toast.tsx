'use client'
import { useEffect, useState } from 'react'

interface Toast { id: string; message: string; type: 'success' | 'error' | 'info' }

let listeners: ((t: Toast) => void)[] = []

export function showToast(message: string, type: Toast['type'] = 'info') {
  const id = Math.random().toString(36).slice(2)
  listeners.forEach(l => l({ id, message, type }))
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const fn = (t: Toast) => {
      setToasts(prev => [...prev, t])
      setTimeout(() => setToasts(prev => prev.filter(x => x.id !== t.id)), 3500)
    }
    listeners.push(fn)
    return () => { listeners = listeners.filter(l => l !== fn) }
  }, [])

  if (!toasts.length) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 'calc(var(--bottom-nav-total) + 1rem)',
      left: '1rem', right: '1rem', zIndex: 300,
      display: 'flex', flexDirection: 'column', gap: '8px',
      pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          backgroundColor: t.type === 'success'
            ? 'rgba(74,124,89,0.95)'
            : t.type === 'error'
            ? 'rgba(139,30,45,0.95)'
            : 'rgba(12,12,20,0.97)',
          borderLeft: `3px solid ${t.type === 'success' ? '#4a7c59' : t.type === 'error' ? '#8B1E2D' : '#f2a90b'}`,
          backdropFilter: 'blur(12px)',
          color: '#F5F2E9', fontFamily: 'Syne, sans-serif',
          fontSize: '13px', fontWeight: 600,
          padding: '14px 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          animation: 'slideUp 0.3s ease-out',
        }}>
          {t.message}
        </div>
      ))}
    </div>
  )
}
