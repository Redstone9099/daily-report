import { useState } from 'react'
import type { ReportRecord } from '../lib/storage'
import { typeMap } from '../lib/generateReport'
import type { ReportType } from '../lib/generateReport'

interface Props {
  history: ReportRecord[]
}

export default function HistoryPanel({ history }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = async (record: ReportRecord) => {
    await navigator.clipboard.writeText(record.result)
    setCopiedId(record.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (history.length === 0) {
    return (
      <div className="text-center text-white/40 py-16">
        <div className="text-5xl mb-4">📭</div>
        <p className="text-sm">还没有历史记录</p>
        <p className="text-xs mt-1 text-white/25">生成文档后会自动保存在这里</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {history.map(record => {
        const isExpanded = expandedId === record.id
        const typeName = typeMap[record.reportType as ReportType] ?? record.reportType
        return (
          <div
            key={record.id}
            className="bg-white/8 rounded-2xl border border-white/10 overflow-hidden transition-all"
          >
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-white/15 text-white/70 px-2 py-0.5 rounded-full">
                  {typeName}
                </span>
                <span className="text-white/35 text-xs">
                  {new Date(record.timestamp).toLocaleString('zh-CN', {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(record)}
                  className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
                    copiedId === record.id
                      ? 'bg-emerald-500/30 text-emerald-300'
                      : 'bg-white/10 hover:bg-white/20 text-white/60'
                  }`}
                >
                  {copiedId === record.id ? '✅ 已复制' : '📋 复制'}
                </button>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : record.id)}
                  className="text-xs bg-white/10 hover:bg-white/20 text-white/60 px-2.5 py-1 rounded-lg transition-all"
                >
                  {isExpanded ? '收起 ▲' : '展开 ▼'}
                </button>
              </div>
            </div>

            <div className="px-4 pb-4">
              <p className={`text-white/70 text-sm leading-relaxed whitespace-pre-wrap ${
                isExpanded ? '' : 'line-clamp-2'
              }`}>
                {record.result}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}