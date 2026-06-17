import { useState, useCallback } from 'react'
import { FileText, Clock, Settings, Zap } from 'lucide-react'
import { ReportForm } from './components/ReportForm'
import { ReportOutput } from './components/ReportOutput'
import { HistoryPanel } from './components/HistoryPanel'
import { SettingsPanel } from './components/SettingsPanel'
import { generateReport } from './lib/generateReport'
import type { JobType, ReportStyle, ReportType } from './lib/generateReport'
import {
  getSettings, saveSettings,
  getHistory, saveHistory, deleteHistory, clearHistory,
  canGenerate, remainingCount, incrementUsage,
} from './lib/storage'
import type { HistoryRecord, UserSettings } from './lib/storage'

type Tab = 'generate' | 'history' | 'settings'

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'generate', label: '生成', icon: <Zap className="w-4 h-4" /> },
  { id: 'history', label: '历史', icon: <Clock className="w-4 h-4" /> },
  { id: 'settings', label: '设置', icon: <Settings className="w-4 h-4" /> },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('generate')
  const [settings, setSettings] = useState<UserSettings>(getSettings)
  const [history, setHistory] = useState<HistoryRecord[]>(getHistory)

  const [isLoading, setIsLoading] = useState(false)
  const [report, setReport] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reuseKey, setReuseKey] = useState(0)

  const refreshHistory = useCallback(() => {
    setHistory(getHistory())
  }, [])

  async function handleGenerate(data: {
    content: string
    jobType: JobType
    style: ReportStyle
    reportType: ReportType
  }) {
    if (!settings.apiKey) {
      setError('请先在「设置」页填写 API Key')
      setTab('settings')
      return
    }

    if (!canGenerate(settings.isPro)) {
      setError('今日免费次数已用完，明天再来或升级 Pro ✨')
      return
    }

    setError(null)
    setIsLoading(true)
    setReport(null)

    try {
      const result = await generateReport(
        { ...data, userName: settings.userName || undefined },
        settings.apiKey,
        settings.baseURL || undefined,
      )

      setReport(result.report)
      incrementUsage()

      saveHistory({
        reportType: data.reportType,
        jobType: data.jobType,
        style: data.style,
        inputContent: data.content,
        outputReport: result.report,
      })
      refreshHistory()

      saveSettings(settings)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('401') || msg.includes('Unauthorized')) {
        setError('API Key 无效，请检查设置')
      } else if (msg.includes('429')) {
        setError('请求太频繁，请稍后再试')
      } else if (msg.includes('network') || msg.includes('fetch')) {
        setError('网络错误，请检查网络连接或 API 地址')
      } else {
        setError(`生成失败：${msg}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  function handleReset() {
    setReport(null)
    setError(null)
  }

  function handleReuse(record: HistoryRecord) {
    setTab('generate')
    setReuseKey((k) => k + 1)
    sessionStorage.setItem('drg_reuse', JSON.stringify({
      content: record.inputContent,
      jobType: record.jobType,
      style: record.style,
      reportType: record.reportType,
    }))
  }

  return (
    <div className="min-h-screen gradient-bg flex items-start justify-center py-8 px-4">
      <div className="w-full max-w-4xl">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-2xl mb-3 shadow-lg">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">工作日报生成器</h1>
          <p className="text-white/70 text-sm mt-1">口语化输入 → AI 秒出规范日报 / 周报</p>
        </div>

        {/* 主卡片 */}
        <div className="glass-card rounded-3xl shadow-2xl shadow-violet-900/20 overflow-hidden">

          {/* Tab 导航 */}
          <div className="flex border-b border-gray-100">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-4 text-sm font-medium transition-all ${
                  tab === t.id
                    ? 'text-violet-600 border-b-2 border-violet-500'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab 内容 */}
          <div className="p-6">
            {tab === 'generate' && (
              <div>
                {error && (
                  <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                    {error}
                  </div>
                )}
                {report ? (
                  <ReportOutput report={report} onReset={handleReset} />
                ) : (
                  <ReportForm
                    key={reuseKey}
                    onGenerate={handleGenerate}
                    isLoading={isLoading}
                    remainingCount={remainingCount(settings.isPro)}
                    isPro={settings.isPro}
                  />
                )}
              </div>
            )}

            {tab === 'history' && (
              <HistoryPanel
                history={history}
                onDelete={(id) => { deleteHistory(id); refreshHistory() }}
                onClearAll={() => { clearHistory(); refreshHistory() }}
                onReuse={handleReuse}
              />
            )}

            {tab === 'settings' && (
              <SettingsPanel
                settings={settings}
                onSave={(partial) => setSettings((prev) => ({ ...prev, ...partial }))}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/40 text-xs mt-6">
          数据仅存储在本地浏览器 · 不收集任何个人信息
        </p>
      </div>
    </div>
  )
}
