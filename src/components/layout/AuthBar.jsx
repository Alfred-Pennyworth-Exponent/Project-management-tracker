import { RefreshCw, LogIn, LogOut, Menu, FolderOpen, Plus, ExternalLink } from 'lucide-react'
import { signIn, signOut } from '../../services/auth.js'

export default function AuthBar({
  user, token, onTokenChange, saveState, lastSync, onRefresh, onMenuOpen,
  currentProject, currentSheetId, onOpenGallery, onOpenWizard,
}) {
  const syncLabel = lastSync
    ? (() => {
        const diff = Math.floor((Date.now() - lastSync) / 1000)
        if (diff < 60)   return `Synced ${diff}s ago`
        if (diff < 3600) return `Synced ${Math.floor(diff / 60)}m ago`
        return `Synced at ${lastSync.toLocaleTimeString()}`
      })()
    : 'Not synced'

  const statusColor = saveState === 'error' ? 'bg-red-400' : saveState === 'saving' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
  const statusText  = saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved' : saveState === 'error' ? 'Save failed' : syncLabel

  const sheetUrl = currentSheetId
    ? `https://docs.google.com/spreadsheets/d/${currentSheetId}`
    : null

  return (
    <header className="h-12 flex items-center justify-between px-4 border-b border-gray-200 dark:border-surface-600 bg-white dark:bg-surface-800 flex-shrink-0 gap-3">
      {/* Left: hamburger + sync status */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onMenuOpen}
          className="sm:hidden p-2 -ml-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
          aria-label="Open menu"
        >
          <Menu size={16} />
        </button>

        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusColor}`} />
          <span className="text-xs font-mono text-gray-400 dark:text-gray-500 hidden xs:block sm:block">{statusText}</span>
          <button
            onClick={onRefresh}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors cursor-pointer"
            aria-label="Refresh data"
            title="Refresh data"
          >
            <RefreshCw size={12} />
          </button>
        </div>
      </div>

      {/* Center: current project name + sheet link */}
      <div className="flex-1 flex items-center justify-center min-w-0">
        {sheetUrl && (
          <a
            href={sheetUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-body text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors max-w-xs truncate group"
            title="Open in Google Sheets"
          >
            <span className="truncate font-medium text-gray-700 dark:text-gray-300">
              {currentProject?.name || 'Default Project'}
            </span>
            <ExternalLink size={11} className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        )}
      </div>

      {/* Right: projects button, new button, auth */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Projects gallery button */}
        <button
          onClick={onOpenGallery}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-body rounded-lg border border-gray-200 dark:border-surface-500 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-surface-700 transition-colors cursor-pointer min-h-[36px]"
          title="Browse projects"
        >
          <FolderOpen size={13} />
          <span className="hidden sm:inline">Projects</span>
        </button>

        {/* New project button */}
        <button
          onClick={onOpenWizard}
          disabled={!token}
          title={token ? 'Create new project' : 'Sign in to create a project'}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-display font-semibold rounded-lg bg-brand text-white hover:bg-brand-dark transition-colors cursor-pointer shadow-sm min-h-[36px] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={13} />
          <span className="hidden sm:inline">New</span>
        </button>

        <div className="w-px h-5 bg-gray-200 dark:bg-surface-600 mx-0.5" />

        {/* Auth */}
        {token ? (
          <>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-brand/10 border border-brand/30 flex items-center justify-center">
                <span className="text-[10px] font-display font-bold text-brand">
                  {user?.slice(0, 2).toUpperCase() || 'U'}
                </span>
              </div>
              <span className="text-xs font-body text-gray-600 dark:text-gray-300 hidden sm:block">{user}</span>
            </div>
            <button
              onClick={() => signOut(onTokenChange)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-body rounded-lg border border-gray-200 dark:border-surface-500 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-surface-700 transition-colors cursor-pointer min-h-[36px]"
            >
              <LogOut size={11} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </>
        ) : (
          <>
            <span className="text-xs font-body text-gray-400 dark:text-gray-500 hidden sm:block">
              Read-only view
            </span>
            <button
              onClick={() => signIn()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-display font-semibold rounded-lg bg-brand text-white hover:bg-brand-dark transition-colors cursor-pointer shadow-sm min-h-[36px]"
            >
              <LogIn size={11} />
              Sign in
            </button>
          </>
        )}
      </div>
    </header>
  )
}
