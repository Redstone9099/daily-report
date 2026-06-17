import { useState } from 'react'
import { Clock, Trash2, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react'
import type { HistoryRecord } from '../lib/storage'

interface Props {
  history: HistoryRecord[]
  onDelete: (id: string) => void
  onClearAll: () => void
  onReuse: (record: HistoryRecord) => void
}

const JOB_LABEL: Record<string, string> = {
  dev: '💻 研发',
  ops: '📊 运营',
  sales: '💼 销售',
  design: '🎨 设计',
  management: '🗂️ 管理',
  other: '✨ 其他',
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) {
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }) +
    ' ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function HistoryItem({
  record,
  onDelete,
  onReuse,
}: {
  record: HistoryRecord
  onDelete: (id: string) => void
  onReuse: (record: HistoryRecord) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation()
    await navigator.clipboard.writeText(record.outputReport)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden hover:border-violet-200 transition-colors">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs text-gray-400 shrink-0">{formatTime(record.createdAt)}</span>
          <span className="text-xs px-2 py-0.5 bg-violet-50 text-violet-600 rounded-full shrink-0">
            {record.reportType === 'weekly' ? '周报' : '日报'}
          </span>
          <span className="text-xs text-gray-500 shrink-0">{JOB_LABEL[record.jobType] ?? record.jobType}</span>
          <span className="text-xs text-gray-400 truncate hidden sm:block">
            {record.inputContent.slice(0, 30)}{record.inputContent.length > 30 ? '…' : ''}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button
            onClick={handleCopy}
            className={`p-1.5 rounded-lg transition-colors ${
              copied ? 'text-green-500' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(record.id) }}
            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          {expanded
            ? <ChevronUp className="w-4 h-4 text-gray-400" />
            : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
          <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-sans mb-3">
            {record.outputReport}
          </pre>
          <button
            onClick={() => onReuse(record)}
            className="text-xs text-violet-600 hover:text-violet-700 font-medium"
          >
            用这次的输入内容重新生成 →
          </button>
        </div>
      )}
    </div>
  )
}

export function HistoryPanel({ history, onDelete, onClearAll, onReuse }: Props) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Clock className="w-10 h-10 text-gray-200 mb-3" />
        <p className="text-gray-400 text-sm">还没有生成记录</p>
        <p className="text-gray-300 text-xs mt-1">每次生成的日报都会保存在这里</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">共 {history.length} 条记录（最多保留 50 条）</span>
        <button
          onClick={onClearAll}
          className="text-xs text-gray-400 hover:text-red-400 transition-colors"
        >
          清空全部
        </button>
      </div>
      <div className="space-y-2">
        {history.map((record) => (
          <HistoryItem
            key={record.id}
            record={record}
            onDelete={onDelete}
            onReuse={onReuse}
          />
        ))}
      </div>
    </div>
  )
}