import { useState } from 'react'
import { Copy, Check, Download, RotateCcw } from 'lucide-react'

interface Props {
  report: string
  onReset: () => void
}

export function ReportOutput({ report, onReset }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(report)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const el = document.createElement('textarea')
      el.value = report
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  function handleDownload() {
    const date = new Date().toLocaleDateString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
    }).replace(/\//g, '-')
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `工作日报_${date}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-full">

      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            生成完成
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            title="下载为 txt 文件"
            className="flex items-center gap-1.5 px-3 py-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">下载</span>
          </button>
          <button
            onClick={onReset}
            title="重新生成"
            className="flex items-center gap-1.5 px-3 py-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg text-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">重新写</span>
          </button>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              copied
                ? 'bg-green-500 text-white'
                : 'gradient-bg text-white hover:opacity-90'
            }`}
          >
            {copied ? (
              <><Check className="w-4 h-4" /><span>已复制</span></>
            ) : (
              <><Copy className="w-4 h-4" /><span>一键复制</span></>
            )}
          </button>
        </div>
      </div>

      {/* 日报内容展示 */}
      <div className="flex-1 bg-gray-50 rounded-2xl p-5 overflow-y-auto scrollbar-hide">
        <pre className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed font-sans">
          {report}
        </pre>
      </div>

      {/* 底部提示 */}
      <p className="text-center text-xs text-gray-400 mt-3">
        内容由 AI 生成，请核实后使用 · 可直接复制到企业微信 / 钉钉 / 飞书
      </p>
    </div>
  )
}