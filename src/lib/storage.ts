export interface ReportRecord {
  id: string
  date: string
  input: string
  output: string
  template: string
}

const STORAGE_KEY = 'work_reports'

export function getHistory(): ReportRecord[] {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

export function saveReport(report: ReportRecord): void {
  const reports = getHistory()
  reports.unshift(report)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports))
}

export function deleteReport(id: string): void {
  const reports = getHistory().filter(r => r.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports))
}