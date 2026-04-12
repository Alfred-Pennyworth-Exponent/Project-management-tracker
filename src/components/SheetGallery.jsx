import { useState } from 'react'
import { X, ExternalLink, Trash2, FolderOpen, Plus } from 'lucide-react'
import Modal from './ui/Modal.jsx'
import { useSheetGallery } from '../hooks/useSheetGallery.js'

function formatDate(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export default function SheetGallery({ onClose, onOpenWizard }) {
  const { projects, currentId, switchProject, removeProject } = useSheetGallery()
  const [confirmDelete, setConfirmDelete] = useState(null) // id to confirm delete

  const handleDelete = (id) => {
    removeProject(id)
    setConfirmDelete(null)
  }

  return (
    <Modal size="md" onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <FolderOpen size={18} className="text-brand" />
          <h2 className="text-base font-display font-bold text-gray-100">Projects</h2>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-surface-700 cursor-pointer">
          <X size={16} />
        </button>
      </div>

      {/* Project list */}
      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen size={32} className="text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-body">No projects yet.</p>
            <p className="text-xs text-gray-600 mt-1">Click <strong className="text-gray-400">+ New Project</strong> to get started.</p>
          </div>
        ) : (
          projects.map(project => {
            const isActive = project.id === currentId
            return (
              <div
                key={project.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors group ${
                  isActive
                    ? 'border-brand bg-brand/10'
                    : 'border-surface-500 bg-surface-700 hover:border-surface-400 hover:bg-surface-600'
                }`}
                onClick={() => !isActive && switchProject(project.id)}
              >
                {/* Active indicator */}
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? 'bg-brand' : 'bg-surface-500'}`} />

                {/* Project info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-display font-semibold text-gray-100 truncate">
                      {project.name}
                    </span>
                    {isActive && (
                      <span className="text-[10px] font-mono text-brand border border-brand/30 rounded px-1.5 py-0.5 flex-shrink-0">
                        active
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-500 font-body mt-0.5 truncate">
                    {project.creator} · {formatDate(project.createdAt)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                  <a
                    href={`https://docs.google.com/spreadsheets/d/${project.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-md text-gray-400 hover:text-gray-200 hover:bg-surface-600 transition-colors"
                    title="Open in Google Sheets"
                  >
                    <ExternalLink size={13} />
                  </a>
                  {confirmDelete === project.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="px-2 py-1 text-[10px] rounded bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="px-2 py-1 text-[10px] rounded bg-surface-600 text-gray-400 hover:bg-surface-500 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(project.id)}
                      className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-surface-600 transition-colors cursor-pointer"
                      title="Remove from list"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-surface-600 flex justify-between items-center">
        <p className="text-xs text-gray-600 font-mono">
          {projects.length} project{projects.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={() => { onClose(); onOpenWizard() }}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-display font-semibold rounded-lg bg-brand text-white hover:bg-brand-dark transition-colors cursor-pointer"
        >
          <Plus size={13} />
          New Project
        </button>
      </div>
    </Modal>
  )
}
