import { useState } from 'react'
import { Eye, EyeOff, Save, Check, ExternalLink } from 'lucide-react'
import type { UserSettings } from '../lib/storage'

interface Props {
  settings: UserSettings
  onSave: (s: Partial<UserSettings>) => void
}

export function SettingsPanel({ settings, onSave }: Props) {
  const [apiKey, setApiKey] = useState(settings.apiKey)
  const [baseURL, setBaseURL] = useState(settings.baseURL)
  const [userName, setUserName] = useState(settings.userName)
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    onSave({ apiKey: apiKey.trim(), baseURL: baseURL.trim(), userName: userName.trim() })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span className="w-5 h-5 bg-violet-100 text-violet-600 rounded flex items-center justify-center text-xs">🔑</span>
          AI 接口配置
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              API Key
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noreferrer"
                className="ml-2 text-violet-500 hover:text-violet-600 inline-flex items-center gap-0.5"
              >
                获取 <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-4 py-2.5 pr-10 rounded-xl border-2 border-gray-200 text-sm
                  focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">Key 仅保存在你的浏览器本地，不会上传到任何服务器</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              自定义 API 地址
              <span className="ml-1 text-gray-400 font-normal">（可选，使用中转服务时填写）</span>
            </label>
            <input
              type="text"
              value={baseURL}
              onChange={(e) => setBaseURL(e.target.value)}
              placeholder="https://api.openai.com/v1（留空使用默认）"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm
                focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span className="w-5 h-5 bg-violet-100 text-violet-600 rounded flex items-center justify-center text-xs">👤</span>
          个人信息
        </h3>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            你的名字
            <span className="ml-1 text-gray-400 font-normal">（可选，日报末尾自动署名）</span>
          </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="张三"
            className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm
              focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
          />
        </div>
      </div>

      {!settings.isPro && (
        <div className="rounded-2xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100 p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">✨</span>
            <div>
              <p className="text-sm font-semibold text-violet-800">升级 Pro，无限生成</p>
              <ul className="text-xs text-violet-600 mt-1.5 space-y-1">
                <li>• 每日无限次生成日报 / 周报</li>
                <li>• 历史记录无限保存</li>
                <li>• 优先体验新功能</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleSave}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all ${
          saved
            ? 'bg-green-500 text-white'
            : 'gradient-bg text-white hover:opacity-90'
        }`}
      >
        {saved ? (
          <><Check className="w-4 h-4" /><span>已保存</span></>
        ) : (
          <><Save className="w-4 h-4" /><span>保存设置</span></>
        )}
      </button>
    </div>
  )
}