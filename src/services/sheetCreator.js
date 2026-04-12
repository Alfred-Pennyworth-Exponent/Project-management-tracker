const BASE = 'https://sheets.googleapis.com/v4/spreadsheets'

// ─── Tab definitions ──────────────────────────────────────────────────────────
// Each entry: { key, label, headers }
// label  = the actual Google Sheet tab name
// headers = column headers written to row 1

export const TAB_DEFINITIONS = [
  {
    key:     'MODULE_GANTT',
    label:   'Module Gantt Data',
    headers: ['Module Name', 'Start Date', 'End Date', 'Module Stage', 'Phase'],
  },
  {
    key:     'PHASE_GANTT',
    label:   'Phase Gantt Data',
    headers: ['Module Name', 'Start Date', 'End Date', 'Module Stage', 'Phase'],
  },
  {
    key:     'GANTT_CHART',
    label:   'Gantt Chart',
    headers: ['Module Name', 'Start Date', 'End Date', 'Stage', 'Phase'],
  },
  {
    key:     'WATCHTOWER',
    label:   'Watchtower Roadmap',
    headers: [
      'Module', 'PBIID', 'Phase', 'Site - L0', 'App - L1', '% L2 Complete',
      'Doctype - L3', 'Function', 'Stage - L3 Lifecycle', 'Development Status',
      'Priority', 'Module Scope Discovery Start', 'Module Development Start',
      'Module UAT Start', 'Migration Start Date', 'Module Go Live Date', 'Notes',
    ],
  },
  {
    key:     'VS_INPUT',
    label:   'VS Input - module priority',
    headers: ['Module', 'Priority', 'VS Notes'],
  },
  {
    key:     'CAW',
    label:   'CAW',
    headers: ['Current Area of Work', 'Related Module', 'EE Team', 'SPOC', 'Status', 'Priority', 'ETA for Go-live'],
  },
  {
    key:     'WEEKLY_UPDATE',
    label:   'Weekly Update',
    headers: ['Week Number', 'Module', 'Update', 'Status', 'Notes'],
  },
  {
    key:     'INCREMENTAL',
    label:   'Incremental Roadmap',
    headers: ['Module', 'Type', 'Description', 'Status', 'Priority', 'ETA'],
  },
  {
    key:     'SCOPE_TRACKER',
    label:   'Scope Tracker',
    headers: ['Module', 'Scope Item', 'Status', 'Notes'],
  },
  {
    key:     'ENTITIES',
    label:   'Entities',
    headers: ['Module', 'Entity', 'Type', 'Notes'],
  },
]

// ─── Step 1: Create spreadsheet ───────────────────────────────────────────────
async function createSpreadsheet(name, token) {
  const res = await fetch(BASE, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      properties: { title: name },
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Failed to create spreadsheet: ${err.error?.message || res.status}`)
  }
  const data = await res.json()
  return data.spreadsheetId
}

// ─── Step 2: Add tabs ─────────────────────────────────────────────────────────
async function addSheetTabs(spreadsheetId, tabLabels, token) {
  const requests = tabLabels.map((title, index) => ({
    addSheet: {
      properties: { title, index: index + 1 }, // +1 to place after default Sheet1
    },
  }))

  const res = await fetch(`${BASE}/${spreadsheetId}:batchUpdate`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ requests }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Failed to add tabs: ${err.error?.message || res.status}`)
  }
  return res.json()
}

// ─── Step 3: Write headers ────────────────────────────────────────────────────
async function writeTabHeaders(spreadsheetId, selectedTabs, projectConfig, token) {
  const data = selectedTabs.map(tab => ({
    range:  `${tab.label}!A1`,
    values: [tab.headers],
  }))

  // Also write project config as a hidden metadata sheet
  // We store it as JSON in a special _config tab (always created)
  data.push({
    range:  '_config!A1',
    values: [[JSON.stringify(projectConfig)]],
  })

  const res = await fetch(`${BASE}/${spreadsheetId}/values:batchUpdate`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ valueInputOption: 'RAW', data }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Failed to write headers: ${err.error?.message || res.status}`)
  }
  return res.json()
}

// ─── Add _config tab ─────────────────────────────────────────────────────────
async function addConfigTab(spreadsheetId, token) {
  const res = await fetch(`${BASE}/${spreadsheetId}:batchUpdate`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      requests: [{ addSheet: { properties: { title: '_config', index: 0 } } }],
    }),
  })
  // Ignore errors — sheet may already exist
  return res.json().catch(() => null)
}

// ─── Main orchestrator ────────────────────────────────────────────────────────
export async function createProject({ name, creator, selectedTabKeys, config, token }) {
  // 1. Create spreadsheet
  const spreadsheetId = await createSpreadsheet(name, token)

  // 2. Filter tabs to selected keys
  const selectedTabs = TAB_DEFINITIONS.filter(t => selectedTabKeys.includes(t.key))
  const tabLabels    = selectedTabs.map(t => t.label)

  // 3. Add _config tab + selected tabs
  await addConfigTab(spreadsheetId, token)
  if (tabLabels.length > 0) {
    await addSheetTabs(spreadsheetId, tabLabels, token)
  }

  // 4. Write headers + config
  const projectConfig = {
    name,
    creator,
    createdAt:   new Date().toISOString(),
    selectedTabs: selectedTabKeys,
    ...config,
  }
  await writeTabHeaders(spreadsheetId, selectedTabs, projectConfig, token)

  return { spreadsheetId, projectConfig }
}
