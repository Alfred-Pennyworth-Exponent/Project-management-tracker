import { useEffect, useRef, useState, useCallback } from 'react'
import { X } from 'lucide-react'

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

// Drag threshold in px before we dismiss
const DISMISS_THRESHOLD = 120

export default function Modal({ title, onClose, children, size = 'md' }) {
  const dialogRef = useRef(null)
  const isMobile = () => window.innerWidth < 640

  // Drag-to-dismiss state
  const [dragY, setDragY] = useState(0)
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef(null)

  // Focus trap + Escape
  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    const focusables = el.querySelectorAll(FOCUSABLE)
    if (focusables.length) focusables[0].focus()

    const trap = (e) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab') return
      const nodes = el.querySelectorAll(FOCUSABLE)
      if (!nodes.length) return
      const first = nodes[0], last = nodes[nodes.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', trap)
    return () => document.removeEventListener('keydown', trap)
  }, [onClose])

  // Prevent body scroll while sheet is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Touch handlers for drag-to-dismiss (mobile only)
  const onTouchStart = useCallback((e) => {
    if (!isMobile()) return
    dragStart.current = e.touches[0].clientY
    setDragging(true)
  }, [])

  const onTouchMove = useCallback((e) => {
    if (!isMobile() || dragStart.current === null) return
    const delta = e.touches[0].clientY - dragStart.current
    if (delta > 0) {
      e.preventDefault()
      setDragY(delta)
    }
  }, [])

  const onTouchEnd = useCallback(() => {
    if (!isMobile()) return
    setDragging(false)
    if (dragY >= DISMISS_THRESHOLD) {
      onClose()
    } else {
      setDragY(0)
    }
    dragStart.current = null
  }, [dragY, onClose])

  const widths = { sm: 'sm:max-w-sm', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl', xl: 'sm:max-w-4xl' }

  // Backdrop opacity fades as you drag down
  const backdropOpacity = dragging ? Math.max(0.2, 0.5 - (dragY / DISMISS_THRESHOLD) * 0.3) : 0.5

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      style={{ backgroundColor: `rgba(0,0,0,${backdropOpacity})`, backdropFilter: 'blur(4px)', transition: dragging ? 'none' : 'background-color 0.2s' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          transform: `translateY(${dragY}px)`,
          transition: dragging ? 'none' : 'transform 0.38s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
        className={`
          w-full ${widths[size]}
          bg-white dark:bg-surface-800
          border border-gray-200 dark:border-surface-600
          rounded-t-3xl sm:rounded-2xl
          shadow-modal
          flex flex-col
          max-h-[92dvh] sm:max-h-[80vh]
          animate-sheet-up sm:animate-slide-up
          touch-pan-y
        `}
      >
        {/* Drag handle — mobile only */}
        <div
          className="flex justify-center pt-3 pb-0 sm:hidden flex-shrink-0 cursor-grab active:cursor-grabbing"
          aria-hidden="true"
        >
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-surface-500" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-surface-600 flex-shrink-0">
          <h3 id="modal-title" className="font-display text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body — safe area inset for iOS home bar */}
        <div
          className="p-5 overflow-y-auto flex-1 overscroll-contain"
          style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}