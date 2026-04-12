import { useState } from 'react'
import { X, Plus, ChevronRight, ChevronLeft, Loader2, Check } from 'lucide-react'
import Modal from './ui/Modal.jsx'
import { TAB_DEFINITIONS, createProject } from '../services/sheetCreator.js'

// ─── Default config values ────────────────────────────────────────────────────
const DEFAULT_STAGES = [
  { label: 'Scope Discovery', color: '#64748b' },
  { label: 'Development',     color: '#3b82f6' },
  { label: 'UAT',             color: '#f59e0b' },
  { label: 'Migration',       color: '#8b5cf6' },
  { label: 'Sustenance',      color: '#14b8a6' },
]
const DEFAULT_DEV_STATUSES  = ['Ongoing', 'Released to Test Site', 'Released to Prod Site', 'Cancelled']
const DEFAULT_CAW_STATUSES  = ['Open', 'In Progress', 'Stuck', 'Completed']
const DEFAULT_CAW_PRIORITIES = ['Critical', 'High', 'Medium', 'Low']

const MODULES = [
  { key: 'MODULE_GANTT',  label: 'Module Gantt',     desc: 'Module-level timeline' },
  { key: 'PHASE_GANTT',   label: 'Phase Gantt',      desc: 'Phase-level timeline' },
  { key: 'GANTT_CHART',   label: 'Gantt Chart',      desc: 'Combined Gantt view' },
  { key: 'WATCHTOWER',    label: 'PBI Tracker',       desc: 'Watchtower roadmap' },
  { key: 'VS_INPUT',      label: 'VS Input',         desc: 'Module priority input' },
  { key: 'CAW',           label: 'CAW Board',        desc: 'Current area of work' },
  { key: 'WEEKLY_UPDATE', label: 'Weekly Log',       desc: 'Weekly update entries' },
  { key: 'INCREMENTAL',   label: 'Increments',       desc: 'Incremental roadmap' },
  { key: 'SCOPE_TRACKER', label: 'Scope Tracker',    desc: 'Scope management' },
  { key: 'ENTITIES',      label: 'Entities',         desc: 'Entity registry' },
]

// ─── PillEditor sub-component ─────────────────────────────────────────────────
function PillEditor({ items, onChange, placeholder = 'Add item…' }) {
  const [input, setInput] = useState('')

  const add = () => {
    const v = input.trim()
    if (!v || items.includes(v)) return
    onChange([...items, v])
    setInput('')
  }

  const remove = (i) => onChange(items.filter((_, idx) => idx !== i))

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-body bg-surface-700 text-gray-200 border border-surface-500"
          >
            {item}
            <button
              onClick={() => remove(i)}
              className="text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
            >
              <X size={10} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder={placeholder}
          className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-surface-700 border border-surface-500 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand"
        />
        <button
          onClick={add}
          className="px-3 py-1.5 text-xs rounded-lg bg-brand text-white hover:bg-brand-dark transition-colors cursor-pointer flex items-center gap-1"
        >
          <Plus size={12} /> Add
        </button>
      </div>
    </div>
  )
}

// ─── StageEditor sub-component ────────────────────────────────────────────────
function StageEditor({ stages, onChange }) {
  const [input, setInput] = useState('')
  const [color, setColor] = useState('#6366f1')

  const add = () => {
    const label = input.trim()
    if (!label || stages.find(s => s.label === label)) return
    onChange([...stages, { label, color }])
    setInput('')
  }

  const remove = (i) => onChange(stages.filter((_, idx) => idx !== i))

  const updateColor = (i, c) => onChange(stages.map((s, idx) => idx === i ? { ...s, color: c } : s))

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {stages.map((stage, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-body border border-surface-500"
            style={{ background: stage.color + '22', color: stage.color, borderColor: stage.color + '55' }}
          >
            <input
              type="color"
              value={stage.color}
              onChange={e => updateColor(i, e.target.value)}
              className="w-4 h-4 rounded-full cursor-pointer border-0 bg-transparent"
              title="Change color"
            />
            {stage.label}
            <button
              onClick={() => remove(i)}
              className="text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
            >
              <X size={10} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="color"
          value={color}
          onChange={e => setColor(e.target.value)}
          className="w-9 h-8 rounded-lg cursor-pointer border border-surface-500 bg-surface-700"
        />
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="Stage name…"
          className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-surface-700 border border-surface-500 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand"
        />
        <button
          onClick={add}
          className="px-3 py-1.5 text-xs rounded-lg bg-brand text-white hover:bg-brand-dark transition-colors cursor-pointer flex items-center gap-1"
        >
          <Plus size={12} /> Add
        </button>
      </div>
    </div>
  )
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────
export default function NewProjectWizard({ token, user, onClose, onCreated }) {
  const [step, setStep] = useState(1)

  // Step 1
  const [name, setName] = useState('')

  // Step 2
  const [selectedKeys, setSelectedKeys] = useState(MODULES.map(m => m.key))

  // Step 3
  const [stages,        setStages]        = useState(DEFAULT_STAGES)
  const [devStatuses,   setDevStatuses]   = useState(DEFAULT_DEV_STATUSES)
  const [defaultStage,  setDefaultStage]  = useState('Scope Discovery')
  const [cawStatuses,   setCawStatuses]   = useState(DEFAULT_CAW_STATUSES)
  const [cawPriorities, setCawPriorities] = useState(DEFAULT_CAW_PRIORITIES)

  // Step 4
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState(null)

  const toggleModule = (key) => {
    setSelectedKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  const handleCreate = async () => {
    setCreating(true)
    setCreateError(null)
    try {
      const config = {
        stages,
        devStatuses,
        defaultStage,
        cawStatuses,
        cawPriorities,
      }
      const { spreadsheetId, projectConfig } = await createProject({
        name,
        creator: user,
        selectedTabKeys: selectedKeys,
        config,
        token,
      })

      onCreated({
        id:        spreadsheetId,
        name,
        creator:   user,
        createdAt: projectConfig.createdAt,
      })
    } catch (err) {
      setCreateError(err.message)
      setCreating(false)
    }
  }

  const hasGantt = selectedKeys.includes('MODULE_GANTT') || selectedKeys.includes('PHASE_GANTT') || selectedKeys.includes('GANTT_CHART')
  const hasPBI   = selectedKeys.includes('WATCHTOWER')
  const hasCAW   = selectedKeys.includes('CAW')

  const steps = ['Basics', 'Modules', 'Configure', 'Review']

  return (
    <Modal size="lg" onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-display font-bold text-gray-100">New Project</h2>
          <p className="text-xs font-mono text-gray-500 mt-0.5">Step {step} of 4 — {steps[step - 1]}</p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-surface-700 cursor-pointer">
          <X size={16} />
        </button>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1 mb-6">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-1 flex-1">
            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-colors ${
              i + 1 < step ? 'bg-brand text-white' :
              i + 1 === step ? 'bg-brand/20 text-brand border border-brand' :
              'bg-surface-700 text-gray-500'
            }`}>
              {i + 1 < step ? <Check size={12} /> : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px ${i + 1 < step ? 'bg-brand' : 'bg-surface-600'}`} />
            )}
          </div>
        ))}
      </div>

      {/* ── Step 1: Basics ── */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-body font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Project Name <span className="text-red-400">*</span>
            </label>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && name.trim().length >= 2 && setStep(2)}
              placeholder="e.g. Pump Location Assessment"
              className="w-full px-3 py-2 rounded-lg bg-surface-700 border border-surface-500 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-brand text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-body font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Created By
            </label>
            <div className="px-3 py-2 rounded-lg bg-surface-800 border border-surface-600 text-gray-400 text-sm font-mono">
              {user || 'Sign in to set creator'}
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: Modules ── */}
      {step === 2 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 mb-3">Select which modules to include in this project.</p>
          <div className="grid grid-cols-2 gap-2">
            {MODULES.map(m => (
              <button
                key={m.key}
                onClick={() => toggleModule(m.key)}
                className={`flex items-start gap-3 p-3 rounded-lg border text-left cursor-pointer transition-colors ${
                  selectedKeys.includes(m.key)
                    ? 'border-brand bg-brand/10 text-gray-100'
                    : 'border-surface-500 bg-surface-700 text-gray-400 hover:border-surface-400'
                }`}
              >
                <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                  selectedKeys.includes(m.key) ? 'bg-brand border-brand' : 'border-gray-500'
                }`}>
                  {selectedKeys.includes(m.key) && <Check size={10} className="text-white" />}
                </div>
                <div>
                  <div className="text-xs font-semibold font-body">{m.label}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{m.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Step 3: Configure ── */}
      {step === 3 && (
        <div className="space-y-6 max-h-80 overflow-y-auto pr-1">
          {hasGantt && (
            <div>
              <h3 className="text-xs font-display font-bold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-1 h-3 bg-brand rounded-full inline-block" />
                Gantt — Lifecycle Stages
              </h3>
              <StageEditor stages={stages} onChange={setStages} />
            </div>
          )}

          {hasPBI && (
            <div>
              <h3 className="text-xs font-display font-bold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-1 h-3 bg-amber-500 rounded-full inline-block" />
                PBI Tracker — Development Statuses
              </h3>
              <PillEditor items={devStatuses} onChange={setDevStatuses} placeholder="Add status…" />
              <div className="mt-3">
                <label className="text-xs text-gray-400 font-body mb-2 block">Default starting stage:</label>
                <div className="flex flex-wrap gap-2">
                  {stages.map(s => (
                    <button
                      key={s.label}
                      onClick={() => setDefaultStage(s.label)}
                      className={`px-3 py-1 rounded-full text-xs cursor-pointer border transition-colors ${
                        defaultStage === s.label
                          ? 'border-brand bg-brand/10 text-brand'
                          : 'border-surface-500 text-gray-400 hover:border-surface-400'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {hasCAW && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-display font-bold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-1 h-3 bg-purple-500 rounded-full inline-block" />
                  CAW Board — Status Options
                </h3>
                <PillEditor items={cawStatuses} onChange={setCawStatuses} placeholder="Add status…" />
              </div>
              <div>
                <h3 className="text-xs font-display font-bold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-1 h-3 bg-red-500 rounded-full inline-block" />
                  CAW Board — Priority Levels
                </h3>
                <PillEditor items={cawPriorities} onChange={setCawPriorities} placeholder="Add priority…" />
              </div>
            </div>
          )}

          {!hasGantt && !hasPBI && !hasCAW && (
            <p className="text-sm text-gray-500 text-center py-8">
              No configurable modules selected. Continue to review.
            </p>
          )}
        </div>
      )}

      {/* ── Step 4: Review & Create ── */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="rounded-lg bg-surface-700 border border-surface-500 p-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400 font-body">Project name</span>
              <span className="text-gray-100 font-semibold">{name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-body">Creator</span>
              <span className="text-gray-100 font-mono text-xs">{user}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-gray-400 font-body">Modules</span>
              <span className="text-gray-100 text-xs text-right max-w-[200px]">
                {selectedKeys.length === 0
                  ? 'None selected'
                  : MODULES.filter(m => selectedKeys.includes(m.key)).map(m => m.label).join(', ')
                }
              </span>
            </div>
            {hasGantt && (
              <div className="flex justify-between items-start">
                <span className="text-gray-400 font-body">Gantt stages</span>
                <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
                  {stages.map(s => (
                    <span key={s.label} className="px-2 py-0.5 rounded-full text-[10px]" style={{ background: s.color + '33', color: s.color }}>
                      {s.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {createError && (
            <div className="rounded-lg bg-red-900/30 border border-red-500/30 px-4 py-3 text-xs text-red-400">
              {createError}
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={creating}
            className="w-full py-2.5 rounded-lg bg-brand text-white font-display font-semibold text-sm hover:bg-brand-dark transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {creating ? (
              <><Loader2 size={14} className="animate-spin" /> Creating project…</>
            ) : (
              'Create Project'
            )}
          </button>
        </div>
      )}

      {/* Footer nav */}
      <div className="flex justify-between mt-6 pt-4 border-t border-surface-600">
        <button
          onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-body rounded-lg border border-surface-500 text-gray-400 hover:text-gray-200 hover:bg-surface-700 transition-colors cursor-pointer"
        >
          <ChevronLeft size={14} />
          {step === 1 ? 'Cancel' : 'Back'}
        </button>

        {step < 4 && (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={step === 1 && name.trim().length < 2}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-display font-semibold rounded-lg bg-brand text-white hover:bg-brand-dark transition-colors cursor-pointer disabled:opacity-40"
          >
            Next
            <ChevronRight size={14} />
          </button>
        )}
      </div>
    </Modal>
  )
}
