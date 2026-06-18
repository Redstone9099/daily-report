import { useState } from 'react'
import { generateReportStream, typeMap } from '../lib/generateReport'
import type { ReportType, JobRole, ReportStyle } from '../lib/generateReport'
import { saveReport } from '../lib/storage'

interface Props {
  onStreamChunk: (chunk: string) => void
  onStreamDone: (fullReport: string) => void
  isGenerating: boolean
  setIsGenerating: (v: boolean) => void
}

const FREE_LIMIT = 3

const reportTypes: { id: ReportType; label: string; icon: string }[] = [
  { id: 'daily',   label: '日报',   icon: '📅' },
  { id: 'weekly',  label: '周报',   icon: '📆' },
  { id: 'monthly', label: '月报',   icon: '📊' },
  { id: 'review',  label: '述职',   icon: '🏆' },
  { id: 'leave',   label: '请假条', icon: '🌴' },
  { id: 'email',   label: '邮件',   icon: '✉️' },
]

const roles: { id: JobRole; label: string; icon: string }[] = [
  { id: 'dev',    label: '研发',   icon: '💻' },
  { id: 'ops',    label: '运营',   icon: '📊' },
  { id: 'sales',  label: '销售',   icon: '🛒' },
  { id: 'design', label: '设计',   icon: '🎨' },
  { id: 'pm',     label: 'PM',     icon: '📌' },
  { id: 'other',  label: '其他',   icon: '✨' },
]

const styles: { id: ReportStyle; label: string; desc: string }[] = [
  { id: 'simple', label: '简洁版', desc: '两模块，干净利落' },
  { id: 'formal', label: '正式版', desc: '四模块，规范专业' },
  { id: 'kpi',    label: 'KPI版',  desc: '数据量化，突出成果' },
]

const needsStyle: ReportType[] = ['daily', 'weekly', 'monthly']

const placeholders: Record<ReportType, string> = {
  daily:   '例如：修了登录页的bug，review了小李的代码，下午开了技术评审会讨论新模块架构……',
  weekly:  '例如：这周完成了支付模块的开发，修了三个线上bug，周五参加了季度规划会……',
  monthly: '例如：本月负责了新版本上线，带了两个实习生，完成了Q3 OKR的80%……',
  review:  '例如：过去半年主导了三个项目，从零搭建了监控体系，团队从5人扩到10人……',
  leave:   '例如：我明天要请一天假，家里有点事，工作已经交接给小王了……',
  email:   '例如：要给客户发邮件说项目延期了一周，原因是需求变更，请他们谅解……',
}

export default function ReportForm({
  onStreamChunk,
  onStreamDone,
  isGenerating,
  setIsGenerating,
}: Props) {
  const [reportType, setReportType] = useState<ReportType>('daily')
  const [role, setRole] = useState<JobRole>('dev')
  const [content, setContent] = useState('')
  const [style, setStyle] = useState<ReportStyle>('formal')
  const [usedCount, setUsedCount] = useState(() =>
    parseInt(localStorage.getItem('usedCount') || '0')
  )

  const showStyle = needsStyle.includes(reportType)
  const remaining = FREE_LIMIT - usedCount

  const handleGenerate = async () => {
    if (!content.trim() || isGenerating) return
    if (usedCount >= FREE_LIMIT) {
      alert('免费次数已用完，请升级 Pro 版本')
      return
    }

    setIsGenerating(true)
    let fullReport = ''

    try {
      await generateReportStream(
        { role, content, style, reportType },
        chunk => {
          fullReport += chunk
          onStreamChunk(chunk)
        }
      )
      const newCount = usedCount + 1
      setUsedCount(newCount)
      localStorage.setItem('usedCount', String(newCount))
      saveReport({ role, content, style, reportType, result: fullReport })
      onStreamDone(fullReport)
    } catch {
      alert('生成失败，请稍后重试')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* 文档类型 */}
      <div>
        <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wide">文档类型</label>
        <div className="grid grid-cols-3 gap-2">
          {reportTypes.map(t => (
            <button
              key={t.id}
              onClick={() => setReportType(t.id)}
              className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                reportType === t.id
                  ? 'bg-white text-indigo-900 shadow-lg scale-[1.02]'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <span className="mr-1">{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 岗位 */}
      <div>
        <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wide">你的岗位</label>
        <div className="grid grid-cols-3 gap-2">
          {roles.map(r => (
            <button
              key={r.id}
              onClick={() => setRole(r.id)}
              className={`py-2 px-3 rounded-xl text-sm transition-all ${
                role === r.id
                  ? 'bg-white text-indigo-900 font-medium shadow-lg scale-[1.02]'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <span className="mr-1">{r.icon}</span>{r.label}
            </button>
          ))}
        </div>
      </div>

      {/* 输入框 */}
      <div>
        <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wide">
          内容描述 <span className="normal-case text-white/30 ml-1">口语化输入就行，AI 来整理</span>
        </label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          maxLength={1000}
          rows={5}
          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/25 resize-none focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all text-sm leading-relaxed"
          placeholder={placeholders[reportType]}
        />
        <div className="text-right text-white/25 text-xs mt-1">{content.length} / 1000</div>
      </div>

      {/* 风格（仅日报/周报/月报显示） */}
      {showStyle && (
        <div>
          <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wide">报告风格</label>
          <div className="grid grid-cols-3 gap-2">
            {styles.map(s => (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                className={`py-3 px-2 rounded-xl text-center transition-all ${
                  style === s.id
                    ? 'bg-white text-indigo-900 shadow-lg scale-[1.02]'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                <div className="font-medium text-sm">{s.label}</div>
                <div className={`text-xs mt-0.5 ${style === s.id ? 'text-indigo-500' : 'text-white/35'}`}>
                  {s.desc}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 剩余次数 */}
      <div className="flex items-center justify-between">
        <span className="text-white/35 text-xs">
          今日剩余：
          <span className={remaining <= 1 ? 'text-rose-400 font-semibold' : 'text-white/60'}>
            {remaining}
          </span>
          {' '}/ {FREE_LIMIT} 次
        </span>
        {remaining <= 1 && (
          <span className="text-xs text-amber-400/80">⚠️ 次数即将用完</span>
        )}
      </div>

      {/* 生成按钮 */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || !content.trim()}
        className={`w-full py-4 rounded-2xl font-semibold text-base transition-all ${
          isGenerating || !content.trim()
            ? 'bg-white/15 text-white/30 cursor-not-allowed'
            : 'bg-gradient-to-r from-violet-500 to-blue-500 text-white hover:from-violet-400 hover:to-blue-400 shadow-lg hover:shadow-violet-500/25 hover:scale-[1.02] active:scale-[0.98]'
        }`}
      >
        {isGenerating
          ? <span className="flex items-center justify-center gap-2"><span className="animate-spin inline-block">⏳</span> AI 生成中...</span>
          : `⚡ 生成${typeMap[reportType]}`
        }
      </button>
    </div>
  )
}
