import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import type { JobType, ReportStyle, ReportType } from '../lib/generateReport'

interface Props {
  onGenerate: (data: {
    content: string
    jobType: JobType
    style: ReportStyle
    reportType: ReportType
  }) => void
  isLoading: boolean
  remainingCount: number
  isPro: boolean
}

const JOB_OPTIONS: { value: JobType; label: string; emoji: string }[] = [
  { value: 'dev', label: '研发 / 工程师', emoji: '💻' },
  { value: 'ops', label: '运营', emoji: '📊' },
  { value: 'sales', label: '销售', emoji: '💼' },
  { value: 'design', label: '设计师', emoji: '🎨' },
  { value: 'management', label: '管理 / PM', emoji: '🗂️' },
  { value: 'other', label: '其他职位', emoji: '✨' },
]

const STYLE_OPTIONS: { value: ReportStyle; label: string; desc: string }[] = [
  { value: 'simple', label: '简洁版', desc: '两个模块，干净利落' },
  { value: 'formal', label: '正式版', desc: '四个模块，规范专业' },
  { value: 'kpi', label: 'KPI导向', desc: '数据量化，突出成果' },
]

const REPORT_TYPE_OPTIONS: { value: ReportType; label: string; emoji: string }[] = [
  { value: 'daily', label: '日报', emoji: '📅' },
  { value: 'weekly', label: '周报', emoji: '📆' },
]

const PLACEHOLDERS: Record<JobType, string> = {
  dev: '例如：修了登录页面的bug，review了小李的代码，下午开了个技术评审会，讨论新模块的架构方案……',
  ops: '例如：今天发了3条推文，用户增长200，跑了个活动数据报表，和设计师对了下周活动页面的需求……',
  sales: '例如：拜访了XX客户，聊了合作意向，跟进了3个老客户续约，发了5份报价单，今日新签1单……',
  design: '例如：完成了首页改版3个方案，和产品开了评审会，确定了方案2，下午出了Banner的三稿……',
  management: '例如：上午主持了周会，下午和技术讨论了Q2规划，处理了几个跨部门协调的事项……',
  other: '把今天做的事情随便写下来，口语化没关系，AI会帮你整理成规范日报……',
}

export function ReportForm({ onGenerate, isLoading, remainingCount, isPro }: Props) {
  const [content, setContent] = useState('')
  const [jobType, setJobType] = useState<JobType>('dev')
  const [style, setStyle] = useState<ReportStyle>('formal')
  const [reportType, setReportType] = useState<ReportType>('daily')

  const canSubmit = content.trim().length >= 10 && (isPro || remainingCount > 0) && !isLoading

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    onGenerate({ content: content.trim(), jobType, style, reportType })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* 日报 / 周报 切换 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">报告类型</label>
        <div className="flex gap-3">
          {REPORT_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setReportType(opt.value)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                reportType === opt.value
                  ? 'border-violet-500 bg-violet-50 text-violet-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              <span>{opt.emoji}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 职位类型 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">你的岗位</label>
        <div className="grid grid-cols-3 gap-2">
          {JOB_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setJobType(opt.value)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-sm transition-all ${
                jobType === opt.value
                  ? 'border-violet-500 bg-violet-50 text-violet-700 font-medium'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              <span>{opt.emoji}</span>
              <span className="truncate">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 今日工作内容 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          今天做了什么
          <span className="ml-1.5 text-xs text-gray-400 font-normal">口语化输入就行，AI来整理</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={PLACEHOLDERS[jobType]}
          rows={5}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm text-gray-800 placeholder-gray-400
            focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100
            resize-none transition-all leading-relaxed"
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-400">
            {content.length < 10 && content.length > 0 ? '再多写几个字~' : ''}
          </span>
          <span className={`text-xs ${content.length > 800 ? 'text-orange-400' : 'text-gray-400'}`}>
            {content.length} / 1000
          </span>
        </div>
      </div>

      {/* 日报风格 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">日报风格</label>
        <div className="grid grid-cols-3 gap-2">
          {STYLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStyle(opt.value)}
              className={`flex flex-col items-center px-2 py-3 rounded-xl border-2 text-sm transition-all ${
                style === opt.value
                  ? 'border-violet-500 bg-violet-50 text-violet-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              <span className="font-medium">{opt.label}</span>
              <span className="text-xs mt-0.5 opacity-70">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 提交按钮 */}
      <div className="pt-1">
        {!isPro && (
          <p className="text-center text-xs text-gray-400 mb-3">
            今日剩余免费次数：
            <span className={`font-semibold ${remainingCount === 0 ? 'text-red-400' : 'text-violet-500'}`}>
              {remainingCount}
            </span>
            &nbsp;/ 3 次
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-base transition-all ${
            canSubmit
              ? 'gradient-bg text-white shadow-lg shadow-violet-200 hover:shadow-violet-300 hover:scale-[1.01] active:scale-[0.99]'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>AI 生成中…</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>一键生成{reportType === 'weekly' ? '周报' : '日报'}</span>
            </>
          )}
        </button>

        {!isPro && remainingCount === 0 && (
          <p className="text-center text-xs text-red-400 mt-2">
            今日免费次数已用完，明天再来 或 升级 Pro 无限使用 ✨
          </p>
        )}
      </div>

    </form>
  )
}