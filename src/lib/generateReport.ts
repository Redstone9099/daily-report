import OpenAI from 'openai'

export type JobType = 'dev' | 'ops' | 'sales' | 'design' | 'management' | 'other'
export type ReportStyle = 'simple' | 'formal' | 'kpi'
export type ReportType = 'daily' | 'weekly'

export interface GenerateOptions {
  content: string
  jobType: JobType
  style: ReportStyle
  reportType: ReportType
  userName?: string
}

export interface GenerateResult {
  report: string
  tokensUsed?: number
}

const JOB_TYPE_LABELS: Record<JobType, string> = {
  dev: '研发/工程师',
  ops: '运营',
  sales: '销售',
  design: '设计师',
  management: '管理/PM',
  other: '其他职位',
}

const STYLE_LABELS: Record<ReportStyle, string> = {
  simple: '简洁版',
  formal: '正式版',
  kpi: 'KPI导向版',
}

function buildDailyPrompt(options: GenerateOptions): string {
  const { content, jobType, style, userName } = options
  const jobLabel = JOB_TYPE_LABELS[jobType]
  const styleLabel = STYLE_LABELS[style]

  const styleGuide = {
    simple: `
- 格式简洁，使用"【今日工作】""【明日计划】"两个模块
- 每项工作一行，用序号或短横线列举
- 语言精炼，不超过200字`,
    formal: `
- 格式正式，使用"一、今日工作内容""二、工作完成情况""三、明日工作计划""四、需要协调/风险"四个模块
- 措辞专业规范，体现工作量和质量
- 适当体现工作成果和数据`,
    kpi: `
- 格式以KPI和结果为导向，突出数据和完成率
- 使用"【目标完成情况】""【今日产出】""【明日重点】""【风险/阻塞】"四个模块
- 每项工作都要量化，如：完成XX任务（进度100%）、提升XX指标XX%
- 语言积极正向，体现个人价值`,
  }[style]

  return `你是一个专业的职场写作助手，专门帮助${jobLabel}快速生成规范的工作日报。

用户原始输入（可能是碎片化的、口语化的工作记录）：
${content}

请根据以上内容，生成一份${styleLabel}的工作日报。

格式要求：${styleGuide}

其他要求：
- 将碎片化内容整理成条理清晰的日报
- 如果用户提到了具体数字/数据，保留并适当强调
- 语气专业但不僵硬
- 如果输入内容明显不足，可以合理补充通用性内容，但不要编造具体数字
- 直接输出日报内容，不要加任何前言和解释
${userName ? `- 日报末尾署名：${userName}` : '- 不需要署名'}
- 日期用"今日"代替，不要填写具体日期`
}

function buildWeeklyPrompt(options: GenerateOptions): string {
  const { content, jobType, userName } = options
  const jobLabel = JOB_TYPE_LABELS[jobType]

  return `你是一个专业的职场写作助手，专门帮助${jobLabel}快速生成规范的工作周报。

本周工作记录：
${content}

请根据以上内容，生成一份专业的工作周报。

格式要求：
- 使用"【本周工作总结】""【重要成果与亮点】""【下周工作计划】""【需要支持/风险提示】"四个模块
- 本周总结要归纳提炼，不要逐条罗列每天的工作
- 突出重要成果，体现个人贡献
- 下周计划要具体可执行
- 语言专业，体现全局视角

其他要求：
- 直接输出周报内容，不要加任何前言和解释
${userName ? `- 周报末尾署名：${userName}` : ''}
- 时间范围用"本周"代替，不要填写具体日期`
}

export async function generateReport(
  options: GenerateOptions,
  apiKey: string,
  baseURL?: string,
): Promise<GenerateResult> {
  const client = new OpenAI({
    apiKey,
    baseURL: baseURL || 'https://api.openai.com/v1',
    dangerouslyAllowBrowser: true,
  })

  const prompt = options.reportType === 'weekly'
    ? buildWeeklyPrompt(options)
    : buildDailyPrompt(options)

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  })

  const report = response.choices[0]?.message?.content ?? ''
  const tokensUsed = response.usage?.total_tokens

  return { report, tokensUsed }
}