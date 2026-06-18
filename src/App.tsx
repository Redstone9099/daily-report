import { useState, useEffect } from 'react'
import ReportForm from './components/ReportForm'
import ReportOutput from './components/ReportOutput'
import HistoryPanel from './components/HistoryPanel'
import { getHistory, type ReportRecord } from './lib/storage'
import './App.css'

type Tab = 'generate' | 'history'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('generate')
  const [currentReport, setCurrentReport] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [history, setHistory] = useState<ReportRecord[]>([])

  useEffect(() => {
    setHistory(getHistory())
  }, [])

  const handleStreamChunk = (chunk: string) => {
    setCurrentReport(prev => prev + chunk)
  }

  const handleStreamDone = (fullReport: string) => {
    setCurrentReport(fullReport)
    setHistory(getHistory())
  }

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    if (tab === 'generate') {
      setCurrentReport('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900">
      {/* 背景光晕 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative text-center pt-10 pb-6 px-4">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 rounded-2xl mb-4 backdrop-blur-sm border border-white/20 shadow-lg">
          <span className="text-2xl">📋</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-1.5 tracking-tight">工作日报生成器</h1>
        <p className="text-blue-300/70 text-sm">口语化输入 → AI 秒出规范文档</p>
      </div>

      {/* Main Card */}
      <div className="relative max-w-2xl mx-auto px-4 pb-12">
        <div className="bg-white/8 backdrop-blur-xl rounded-3xl border border-white/15 shadow-2xl overflow-hidden">
          {/* Tab Bar */}
          <div className="flex border-b border-white/10 bg-white/5">
            <button
              onClick={() => handleTabChange('generate')}
              className={`flex-1 py-4 text-sm font-medium transition-all ${
                activeTab === 'generate'
                  ? 'text-white border-b-2 border-violet-400 bg-white/5'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              ⚡ 生成文档
            </button>
            <button
              onClick={() => handleTabChange('history')}
              className={`flex-1 py-4 text-sm font-medium transition-all ${
                activeTab === 'history'
                  ? 'text-white border-b-2 border-violet-400 bg-white/5'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              🕐 历史记录
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'generate' && (
              <div className="space-y-5">
                <ReportForm
                  onStreamChunk={handleStreamChunk}
                  onStreamDone={handleStreamDone}
                  isGenerating={isGenerating}
                  setIsGenerating={setIsGenerating}
                />
                {(currentReport || isGenerating) && (
                  <ReportOutput
                    report={currentReport}
                    isGenerating={isGenerating}
                  />
                )}
              </div>
            )}
            {activeTab === 'history' && (
              <HistoryPanel history={history} />
            )}
          </div>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          数据仅存储在本地浏览器 · 不上传任何内容
        </p>
      </div>
    </div>
  )
}

export default App