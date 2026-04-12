import { SHEET_ID } from '../config.js'
import { getServiceAccountToken } from './serviceAccount.js'

const BASE = 'https://sheets.googleapis.com/v4/spreadsheets'

async function readToken(userToken) {
  return userToken || await getServiceAccountToken()
}

// ─── Read ────────────────────────────────────────────────────────────────────
export async function readSheet(sheetName, userToken = null, sheetId = null) {
  const id    = sheetId || SHEET_ID
  const token = await readToken(userToken)
  const range = encodeURIComponent(`${sheetName}!A1:ZZ5000`)
  const url   = `${BASE}/${id}/values/${range}?access_token=${token}`
  const res   = await fetch(url)
  if (res.status === 400) return []   // tab doesn't exist in this sheet
  if (!res.ok) throw new Error(`Sheets read error: ${res.status}`)
  const data  = await res.json()
  return rowsToObjects(data.values || [])
}

export async function readSheetRaw(sheetName, userToken = null, sheetId = null) {
  const id    = sheetId || SHEET_ID
  const token = await readToken(userToken)
  const range = encodeURIComponent(`${sheetName}!A1:ZZ5000`)
  const url   = `${BASE}/${id}/values/${range}?access_token=${token}`
  const res   = await fetch(url)
  if (res.status === 400) return []   // tab doesn't exist in this sheet
  if (!res.ok) throw new Error(`Sheets read error: ${res.status}`)
  const data  = await res.json()
  return data.values || []
}

// ─── Write single cell / range ────────────────────────────────────────────────
export async function writeCell(sheetName, row, col, value, token, sheetId = null) {
  const id         = sheetId || SHEET_ID
  const colLetter  = colToLetter(col)
  const range      = encodeURIComponent(`${sheetName}!${colLetter}${row}`)
  const url        = `${BASE}/${id}/values/${range}?valueInputOption=USER_ENTERED&access_token=${token}`
  const res        = await fetch(url, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ values: [[value]] }),
  })
  if (!res.ok) throw new Error(`Sheets write error: ${res.status}`)
  return res.json()
}

// ─── Batch update multiple ranges ─────────────────────────────────────────────
export async function batchWrite(updates, token, sheetId = null) {
  const id  = sheetId || SHEET_ID
  const url = `${BASE}/${id}/values:batchUpdate?access_token=${token}`
  const res = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ valueInputOption: 'USER_ENTERED', data: updates }),
  })
  if (!res.ok) throw new Error(`Sheets batch write error: ${res.status}`)
  return res.json()
}

// ─── Append rows (one or many) ────────────────────────────────────────────────
export async function appendRows(sheetName, rows, token, sheetId = null) {
  const id    = sheetId || SHEET_ID
  const range = encodeURIComponent(`${sheetName}!A1`)
  const url   = `${BASE}/${id}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=OVERWRITE&access_token=${token}`
  const res   = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ values: rows }),
  })
  if (!res.ok) throw new Error(`Sheets append error: ${res.status}`)
  return res.json()
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function rowsToObjects(rows) {
  if (!rows.length) return []
  const headers = rows[0].map(h => h?.toString().trim())
  const seen    = {}
  const keys    = headers.map((h, i) => {
    if (!h) return `_col_${i}`
    if (seen[h] !== undefined) return `${h}_${i}`
    seen[h] = i
    return h
  })
  return rows.slice(1).map(row => {
    const obj = {}
    keys.forEach((k, i) => { obj[k] = row[i] ?? '' })
    return obj
  })
}

function colToLetter(col) {
  let result = ''
  let n = col
  while (n > 0) {
    const rem = (n - 1) % 26
    result = String.fromCharCode(65 + rem) + result
    n = Math.floor((n - 1) / 26)
  }
  return result
}
