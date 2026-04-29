import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { X, Download, Sparkles } from 'lucide-react'
import html2canvas from 'html2canvas'
import { getStats, getExperiences } from '../data/storage.js'

export default function ShareCard({ onClose }) {
  const cardRef = useRef(null)
  const [downloading, setDownloading] = useState(false)
  const stats = getStats()
  const experiences = getExperiences()

  // 取最近3条亮点经历
  const highlights = [...experiences]
    .sort((a, b) => (b.time || '').localeCompare(a.time || ''))
    .slice(0, 3)

  const handleDownload = async () => {
    if (!cardRef.current) return
    setDownloading(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      })
      const link = document.createElement('a')
      link.download = `我的成长履历-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (e) {
      console.error(e)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface rounded-2xl shadow-xl w-full max-w-sm flex flex-col max-h-[90vh]"
      >
        {/* 头部 */}
        <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
          <h2 className="text-base font-bold text-text flex items-center gap-2">
            <Sparkles size={18} className="text-primary" />
            生成分享卡片
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-bg text-text-secondary">
            <X size={18} />
          </button>
        </div>

        {/* 卡片预览区 */}
        <div className="flex-1 overflow-auto p-4 flex justify-center bg-bg/50">
          <div
            ref={cardRef}
            className="w-[320px] rounded-2xl overflow-hidden shadow-lg flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            {/* 卡片内容 */}
            <div className="p-6 text-white">
              {/* Logo区 */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">R</span>
                </div>
                <span className="font-bold text-sm opacity-90">履历星球</span>
              </div>

              {/* 标题 */}
              <h3 className="text-2xl font-bold mb-1">我的成长履历</h3>
              <p className="text-sm opacity-80 mb-6">
                已累计沉淀 {stats.total} 条经历
              </p>

              {/* 数据条 */}
              <div className="space-y-3 mb-6">
                {[
                  { label: '学生工作', value: stats['学生工作'] || 0 },
                  { label: '志愿服务', value: stats['志愿服务'] || 0 },
                  { label: '实习经历', value: stats['实习经历'] || 0 },
                  { label: '项目实践', value: stats['项目实践'] || 0 },
                  { label: '获奖荣誉', value: stats['获奖荣誉'] || 0 },
                ].map(item => {
                  const max = Math.max(3, stats.total || 1)
                  const pct = Math.min(100, (item.value / max) * 100)
                  return (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs mb-1 opacity-90">
                        <span>{item.label}</span>
                        <span>{item.value} 条</span>
                      </div>
                      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white/80 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* 亮点经历 */}
              {highlights.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs font-bold opacity-70 mb-2 uppercase tracking-wider">近期亮点</p>
                  <div className="space-y-2">
                    {highlights.map(h => (
                      <div key={h.id} className="bg-white/10 rounded-lg p-2.5">
                        <p className="text-xs font-bold">{h.title}</p>
                        <p className="text-[10px] opacity-70 mt-0.5">{h.time} · {h.category}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 底部 */}
              <div className="pt-4 border-t border-white/20 flex items-center justify-between">
                <p className="text-[10px] opacity-60">扫码体验履历星球</p>
                <p className="text-[10px] opacity-60">AI 驱动的成长资产管理</p>
              </div>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="p-4 border-t border-border flex-shrink-0">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors"
          >
            <Download size={16} />
            {downloading ? '生成中...' : '下载图片'}
          </button>
          <p className="mt-2 text-center text-xs text-text-secondary">
            下载后可分享到 QQ 空间、朋友圈等社交平台
          </p>
        </div>
      </motion.div>
    </div>
  )
}
