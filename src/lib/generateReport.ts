export type ReportType = 'daily' | 'weekly' | 'monthly' | 'review' | 'leave' | 'email'
export type JobRole = 'dev' | 'ops' | 'sales' | 'design' | 'pm' | 'other'
export type ReportStyle = 'simple' | 'formal' | 'kpi'

interface GenerateParams {
  role: JobRole
  content: string
  style: ReportStyle
  reportType: ReportType
}

export const roleMap: Record<JobRole, string> = {
  dev: '研发/工程师',
  ops: '运营',
  sales: '销售',
  design: '设计师',
  pm: '管理/PM',
  other: '其他岗位',
}

export const typeMap: Record<ReportType, string> = {
  daily: '工作日报',
  weekly: '工作周报',
  monthly: '工作月报',
  review: '述职报告',
  leave: '请假条',
  email: '工作邮件',
}

const styleMap: Record<ReportStyle, string> = {
  simple: '简洁版（包含：今日完成、明日计划 两个模块）',
  formal: '正式版（包含：今日完成、遇到问题、解决方案、明日计划 四个模块）',
  kpi: 'KPI导向版（数据量化，突出成果，适合汇报给领导）',
}

function buildPrompt({ role, content, style, reportType }: GenerateParams): string {
  const roleName = roleMap[role]
  const typeName = typeMap[reportType]

  if (reportType === 'leave') {
    return `你是一个职场写作助手。请根据以下信息生成一份正式的请假条：
请假原因/情况（口语化）：${content}
要求：语言正式礼貌，格式规范，包含：称呼、请假原因、请假时间、工作交接说明、结尾敬语。
直接输出请假条内容，不要任何前缀说明：`
  }

  if (reportType === 'email') {
    return `你是一个职场写作助手。请根据以下信息生成一封专业的工作邮件：
岗位：${roleName}
邮件内容/情况（口语化）：${content}
要求：格式规范（主题行、称呼、正文、结尾署名），语言专业，逻辑清晰。
直接输出邮件内容，不要任何前缀说明：`
  }

  if (reportType === 'review') {
    return `你是一个职场写作助手。请根据以下信息生成一份述职报告：
岗位：${roleName}
工作情况（口语化）：${content}
要求：包含 工作概述、主要成果、遇到的挑战与解决方案、能力成长、下阶段规划 五个模块，语言专业正式，突出亮点和数据。
直接输出述职报告内容，不要任何前缀说明：`
  }

  return `你是一个专业的职场写作助手。请根据以下信息生成一份${typeName}：
岗位：${roleName}
风格：${styleMap[style]}
工作内容（口语化）：${content}
要求：
1. 将口语化内容转化为规范职场用语
2. 按照指定风格的模块格式输出
3. 语言简洁专业，避免废话
4. 内容不够具体时可适当补充合理细节
5. 直接输出${typeName}内容，不需要任何前缀说明
请直接生成${typeName}：`
}

const API_URL = 'https://api.kourichat.com/v1/chat/completions'
const API_KEY = 'sk-kouri-uPX43GrxM3amEiKaftVS8VFSv3XJk0XAUnTcAcTwtlBR2mjt'

export async function generateReportStream(
  params: GenerateParams,
  onChunk: (chunk: string) => void
): Promise<void> {
  const prompt = buildPrompt(params)

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
      temperature: 0.7,
      stream: true,
    }),
  })

  if (!response.ok) {
    throw new Error(`API 请求失败: ${response.status}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('无法读取响应流')

  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value, { stream: true })
    const lines = chunk.split('\n')

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed === 'data: [DONE]') continue
      if (!trimmed.startsWith('data: ')) continue

      try {
        const json = JSON.parse(trimmed.slice(6))
        const delta = json.choices?.[0]?.delta?.content
        if (delta) onChunk(delta)
      } catch {
        // 跳过解析失败的行
      }
    }
  }
}

export async function generateReport(params: GenerateParams): Promise<string> {
  let result = ''
  await generateReportStream(params, chunk => {
    result += chunk
  })
  return result
}