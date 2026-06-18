import { useState, useEffect, useRef } from 'react'

interface Props {
  report: string
  isGenerating: boolean
}

export default function ReportOutput({ report, isGenerating }: Props) {
  const [copied, setCopied] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isGenerating) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [report, isGenerating])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(report)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white/10 border border-white/20 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-white/70 text-sm font-medium">生成结果</span>
          {isGenerating && (
            <span className="flex gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          disabled={!report || isGenerating}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all ${
            copied
              ? 'bg-emerald-500/30 text-emerald-300'
              : !report || isGenerating
              ? 'bg-white/5 text-white/20 cursor-not-allowed'
              : 'bg-white/20 hover:bg-white/30 text-white'
          }`}
        >
          {copied ? <><span>✅</span> 已复制</> : <><span>📋</span> 复制全文</>}
        </button>
      </div>

      <div className="px-4 py-4 max-h-96 overflow-y-auto">
        {!report && !isGenerating ? (
          <div className="text-white/25 text-sm text-center py-8">生成结果将显示在这里</div>
        ) : (
          <div className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
            {report}
            {isGenerating && (
              <span className="inline-block w-0.5 h-4 bg-violet-400 ml-0.5 animate-pulse align-middle" />
            )}
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}