import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  PlusCircle,
  BookOpen,
  FileText,
  Layers,
  History,
  Settings,
  X,
  Key,
  Globe,
  Cpu,
  Shield
} from 'lucide-react'
import { getSettings, saveSettings } from '../data/storage.js'

const navItems = [
  { path: '/dashboard', label: '首页', icon: LayoutDashboard },
  { path: '/input', label: '录入经历', icon: PlusCircle },
  { path: '/library', label: '经历库', icon: BookOpen },
  { path: '/generate', label: '生成材料', icon: FileText },
  { path: '/history', label: '已生成材料', icon: History },
  { path: '/templates', label: '模板社区', icon: Layers },
]

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState(getSettings())

  const handleSaveSettings = () => {
    saveSettings(settings)
    setShowSettings(false)
  }

  const isProxy = Boolean(settings.useProxy)

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-bg">
      {/* 侧边栏 */}
      <aside className="w-full md:w-64 md:h-screen md:sticky md:top-0 bg-surface border-r border-border flex-shrink-0 relative">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-text leading-tight">履历星球</h1>
              <p className="text-xs text-text-secondary">Resume OS</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon
              const active = location.pathname === item.path
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-secondary hover:bg-bg hover:text-text'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              )
            })}
          </nav>

          {/* 移动端设置按钮 */}
          <div className="md:hidden mt-4 pt-4 border-t border-border">
            <button
              onClick={() => setShowSettings(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-text-secondary hover:bg-bg transition-colors"
            >
              <Settings size={18} />
              API 设置
            </button>
          </div>
        </div>

        {/* 桌面端设置按钮 */}
        <div className="hidden md:block absolute bottom-0 left-0 w-full p-4 border-t border-border bg-surface">
          <button
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-text-secondary hover:bg-bg transition-colors"
          >
            <Settings size={18} />
            API 设置
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="p-6 md:p-10 max-w-6xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 设置弹窗 */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface rounded-2xl shadow-xl w-full max-w-md p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-text">API 设置</h2>
              <button onClick={() => setShowSettings(false)} className="p-1 rounded-lg hover:bg-bg">
                <X size={20} className="text-text-secondary" />
              </button>
            </div>

            {/* 代理模式开关 */}
            <div className="mb-5 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 text-sm font-medium text-text">
                  <Shield size={16} className="text-primary" />
                  代理服务模式
                </label>
                <button
                  onClick={() => setSettings({ ...settings, useProxy: !isProxy })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    isProxy ? 'bg-primary' : 'bg-border'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      isProxy ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-text-secondary">
                {isProxy
                  ? '已启用代理服务，API Key 由服务端持有，前端无需配置'
                  : '关闭代理后，需要在前端填写自己的 API Key'}
              </p>
            </div>

            <div className="space-y-4">
              {!isProxy && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-text mb-2">
                    <Key size={16} />
                    API Key
                  </label>
                  <input
                    type="password"
                    value={settings.apiKey || ''}
                    onChange={e => setSettings({ ...settings, apiKey: e.target.value })}
                    placeholder="sk-..."
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
              )}

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-text mb-2">
                  <Globe size={16} />
                  Base URL
                </label>
                <input
                  type="text"
                  value={settings.baseURL || ''}
                  onChange={e => setSettings({ ...settings, baseURL: e.target.value })}
                  placeholder="https://api.openai.com/v1"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                <p className="mt-1 text-xs text-text-secondary">
                  {isProxy
                    ? '代理服务地址，由开发者预配置'
                    : '留空则使用默认 OpenAI 地址'}
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-text mb-2">
                  <Cpu size={16} />
                  模型
                </label>
                <input
                  type="text"
                  value={settings.model || ''}
                  onChange={e => setSettings({ ...settings, model: e.target.value })}
                  placeholder="gpt-3.5-turbo"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-text-secondary hover:bg-bg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveSettings}
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
              >
                保存
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
