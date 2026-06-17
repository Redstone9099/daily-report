export interface HistoryRecord {
  id: string
  createdAt: number
  reportType: 'daily' | 'weekly'
  jobType: string
  style: string
  inputContent: string
  outputReport: string
}

export interface UserSettings {
  apiKey: string
  baseURL: string
  userName: string
  isPro: boolean
}

export interface UsageRecord {
  date: string
  count: number
}

const KEYS = {
  HISTORY: 'drg_history',
  SETTINGS: 'drg_settings',
  USAGE: 'drg_usage',
} as const

const FREE_DAILY_LIMIT = 3

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJSON<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getTodayUsage(): number {
  const record = readJSON<UsageRecord>(KEYS.USAGE, { date: today(), count: 0 })
  if (record.date !== today()) return 0
  return record.count
}

export function incrementUsage(): void {
  const current = getTodayUsage()
  writeJSON<UsageRecord>(KEYS.USAGE, { date: today(), count: current + 1 })
}

export function canGenerate(isPro: boolean): boolean {
  if (isPro) return true
  return getTodayUsage() < FREE_DAILY_LIMIT
}

export function remainingCount(isPro: boolean): number {
  if (isPro) return Infinity
  return Math.max(0, FREE_DAILY_LIMIT - getTodayUsage())
}

export function getHistory(): HistoryRecord[] {
  return readJSON<HistoryRecord[]>(KEYS.HISTORY, [])
}

export function saveHistory(record: Omit<HistoryRecord, 'id' | 'createdAt'>): HistoryRecord {
  const list = getHistory()
  const newRecord: HistoryRecord = {
    ...record,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  }
  const updated = [newRecord, ...list].slice(0, 50)
  writeJSON(KEYS.HISTORY, updated)
  return newRecord
}

export function deleteHistory(id: string): void {
  const list = getHistory().filter((r) => r.id !== id)
  writeJSON(KEYS.HISTORY, list)
}

export function clearHistory(): void {
  writeJSON(KEYS.HISTORY, [])
}

export function getSettings(): UserSettings {
  return readJSON<UserSettings>(KEYS.SETTINGS, {
    apiKey: '',
    baseURL: '',
    userName: '',
    isPro: false,
  })
}

export function saveSettings(settings: Partial<UserSettings>): void {
  const current = getSettings()
  writeJSON(KEYS.SETTINGS, { ...current, ...settings })
}