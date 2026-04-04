import { useEffect } from 'react'
import {
  LayoutDashboard, BarChart2, ListChecks, Zap,
  CalendarDays, ScanSearch, RefreshCw, ChevronLeft,
  ChevronRight, Sun, Moon, X
} from 'lucide-react'

const VIEWS = [
  { id: 'overview',   label: 'Overview',      Icon: LayoutDashboard },
  { id: 'gantt',      label: 'Gantt Chart',   Icon: BarChart2 },
  { id: 'pbi',        label: 'PBI Tracker',   Icon: ListChecks },
  { id: 'caw',        label: 'CAW Board',     Icon: Zap },
  { id: 'weekly',     label: 'Weekly Log',    Icon: CalendarDays },
  { id: 'scope',      label: 'Scope Tracker', Icon: ScanSearch },
  { id: 'increments', label: 'Increments',    Icon: RefreshCw },
]

// Shared nav content used by both mobile drawer and desktop sidebar
function NavItems({ activeView, onNavigate, collapsed, onItemClick }) {
  return (
    <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
      {VIEWS.map(({ id, label, Icon }) => {
        const active = activeView === id
        return (
          <button
            key={id}
            onClick={() => { onNavigate(id); onItemClick?.() }}
            title={collapsed ? label : undefined}
            className={`
              w-full flex items-center rounded-lg text-sm font-body transition-all duration-150 cursor-pointer text-left
              min-h-[44px] sm:min-h-0
              ${collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'}
              ${active
                ? 'bg-brand text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-surface-700'
              }
            `}
          >
            <Icon size={15} className="flex-shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </button>
        )
      })}
    </nav>
  )
}

export default function Sidebar({ activeView, onNavigate, theme, onToggleTheme, collapsed, onToggleCollapsed, mobileOpen, onMobileClose }) {
  // Close drawer on Escape
  useEffect(() => {
    if (!mobileOpen) return
    const handler = (e) => { if (e.key === 'Escape') onMobileClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [mobileOpen, onMobileClose])

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      {/* ── Mobile drawer ── */}
      <div className={`sm:hidden fixed inset-0 z-40 ${mobileOpen ? '' : 'pointer-events-none'}`} aria-hidden={!mobileOpen}>
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={onMobileClose}
        />
        {/* Drawer panel */}
        <aside
          className={`
            absolute inset-y-0 left-0 w-72
            bg-white dark:bg-surface-800
            border-r border-gray-200 dark:border-surface-600
            flex flex-col
            transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
            ${mobileOpen ? 'translate-x-0 animate-drawer-in' : '-translate-x-full'}
          `}
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between h-14 px-4 border-b border-gray-200 dark:border-surface-600 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-brand flex items-center justify-center flex-shrink-0">
                <span className="text-[9px] font-bold text-white font-display">ERP</span>
              </div>
              <span className="font-display font-bold text-sm tracking-wide text-gray-900 dark:text-gray-100">
                ERP Tracker
              </span>
            </div>
            <button
              onClick={onMobileClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-surface-600 transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X size={16} />
            </button>
          </div>

          <NavItems activeView={activeView} onNavigate={onNavigate} collapsed={false} onItemClick={onMobileClose} />

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-surface-600 p-3 flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onToggleTheme}
              className="p-2.5 rounded-lg text-gray-400 hover:text-brand hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
              {theme === 'dark' ? 'Dark mode' : 'Light mode'}
            </span>
          </div>
        </aside>
      </div>

      {/* ── Desktop sidebar ── */}
      <aside className={`
        hidden sm:flex flex-col h-full flex-shrink-0 transition-all duration-300 ease-in-out
        border-r border-gray-200 dark:border-surface-600
        bg-white dark:bg-surface-800
        ${collapsed ? 'w-[52px]' : 'w-52'}
      `}>
        {/* Logo / collapse toggle */}
        <div className={`
          flex items-center h-14 border-b border-gray-200 dark:border-surface-600
          ${collapsed ? 'justify-center px-2' : 'justify-between px-4'}
        `}>
          {!collapsed && (
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-5 h-5 rounded bg-brand flex items-center justify-center flex-shrink-0">
                <span className="text-[9px] font-bold text-white font-display">ERP</span>
              </div>
              <span className="font-display font-bold text-sm tracking-wide text-gray-900 dark:text-gray-100 truncate">
                ERP Tracker
              </span>
            </div>
          )}
          <button
            onClick={onToggleCollapsed}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-surface-600 transition-colors cursor-pointer flex-shrink-0"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        <NavItems activeView={activeView} onNavigate={onNavigate} collapsed={collapsed} />

        {/* Footer */}
        <div className={`
          border-t border-gray-200 dark:border-surface-600 p-2
          ${collapsed ? 'flex justify-center' : 'flex items-center gap-2 px-3'}
        `}>
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            className="p-2 rounded-lg text-gray-400 hover:text-brand hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          {!collapsed && (
            <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
              {theme === 'dark' ? 'Dark mode' : 'Light mode'}
            </span>
          )}
        </div>
      </aside>
    </>
  )
}