import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlusCircle,
  FileText,
  Layers,
  Briefcase,
  Heart,
  Code,
  Award,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  X,
  ArrowRight
} from 'lucide-react'
import { getStats, getExperiences, getCategories } from '../data/storage.js'
import { CalendarDays, Share2, Zap, Lightbulb, ShieldCheck } from 'lucide-react'
import ShareCard from '../components/ShareCard.jsx'

const categoryIcons = {
  '学生工作': Briefcase,
  '志愿服务': Heart,
  '实习经历': TrendingUp,
  '项目实践': Code,
  '获奖荣誉': Award,
}

const categoryColors = {
  '学生工作': 'bg-amber-50 text-amber-600',
  '志愿服务': 'bg-rose-50 text-rose-600',
  '实习经历': 'bg-emerald-50 text-emerald-600',
  '项目实践': 'bg-violet-50 text-violet-600',
  '获奖荣誉': 'bg-sky-50 text-sky-600',
}

const painPoints = [
  { icon: AlertCircle, text: '同一段经历要反复改写几十次' },
  { icon: AlertCircle, text: '经历散落在微信、备忘录、旧文档里' },
  { icon: AlertCircle, text: '有经历但不会包装自己' },
  { icon: AlertCircle, text: '去年写的材料，今年新增经历后全部重写' },
]

const solutions = [
  { icon: CheckCircle2, text: '录入一次，永久沉淀为结构化资产' },
  { icon: CheckCircle2, text: '统一库管理，随时检索调用' },
  { icon: CheckCircle2, text: 'AI 根据不同场景自动包装表达' },
  { icon: CheckCircle2, text: '经历增加后，材料自动更新升级' },
]

// ========== 雷达图组件 ==========
function RadarChart({ data, size = 220 }) {
  const center = size / 2
  const radius = size / 2 - 44
  const angleStep = (Math.PI * 2) / data.length

  const points = data.map((d, i) => {
    const angle = i * angleStep - Math.PI / 2
    const r = Math.min(radius, (d.value / d.max) * radius)
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) }
  })

  const gridLevels = 4

  return (
    <svg width={size} height={size} className="mx-auto">
      {Array.from({ length: gridLevels }).map((_, level) => {
        const levelRadius = ((level + 1) / gridLevels) * radius
        const levelPoints = data.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2
          return `${center + levelRadius * Math.cos(angle)},${center + levelRadius * Math.sin(angle)}`
        }).join(' ')
        return <polygon key={level} points={levelPoints} fill="none" stroke="#e5e7eb" strokeWidth="1" />
      })}
      {data.map((_, i) => {
        const angle = i * angleStep - Math.PI / 2
        return (
          <line key={i} x1={center} y1={center}
            x2={center + radius * Math.cos(angle)} y2={center + radius * Math.sin(angle)}
            stroke="#e5e7eb" strokeWidth="1" />
        )
      })}
      <polygon
        points={points.map(p => `${p.x},${p.y}`).join(' ')}
        fill="rgba(99, 102, 241, 0.15)"
        stroke="#6366f1"
        strokeWidth="2"
      />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#6366f1" />
      ))}
      {data.map((d, i) => {
        const angle = i * angleStep - Math.PI / 2
        const labelRadius = radius + 26
        const x = center + labelRadius * Math.cos(angle)
        const y = center + labelRadius * Math.sin(angle)
        return (
          <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
            className="text-[10px] fill-text-secondary font-medium"
          >
            {d.label}
          </text>
        )
      })}
    </svg>
  )
}

// ========== AI 诊断逻辑 ==========
function generateDiagnosis(stats) {
  const suggestions = []

  if ((stats['实习经历'] || 0) === 0) {
    suggestions.push({ type: 'warning', text: '实习经历为空，建议大三暑期补充一段对口实习，求职竞争力会显著提升' })
  }
  if ((stats['项目实践'] || 0) === 0) {
    suggestions.push({ type: 'warning', text: '项目实践偏少，技术类岗位通常需要至少1-2个项目经历来证明动手能力' })
  }
  if ((stats['获奖荣誉'] || 0) === 0) {
    suggestions.push({ type: 'info', text: '缺少获奖荣誉，建议关注学科竞赛、奖学金申请，为简历增加硬实力背书' })
  }
  if ((stats['志愿服务'] || 0) === 0) {
    suggestions.push({ type: 'info', text: '志愿服务经历空白，适当参与公益活动可以体现社会责任感和软实力' })
  }
  if ((stats['学生工作'] || 0) === 0) {
    suggestions.push({ type: 'info', text: '学生工作经历较少，担任班干部或社团职务有助于锻炼组织协调能力' })
  }

  if (suggestions.length === 0) {
    suggestions.push({ type: 'success', text: '你的经历分布非常均衡！继续保持，可以尝试冲击更高层次的竞赛或顶尖企业实习。' })
  }

  const dimensions = ['学生工作', '志愿服务', '实习经历', '项目实践', '获奖荣誉']
  const filledCount = dimensions.filter(d => (stats[d] || 0) > 0).length
  const totalScore = Math.min(100, filledCount * 12 + (stats.total || 0) * 6)

  return { suggestions, score: totalScore }
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ total: 0, generated: 0 })
  const [showPainModal, setShowPainModal] = useState(false)
  const [showShareCard, setShowShareCard] = useState(false)
  const [timeline, setTimeline] = useState([])

  useEffect(() => {
    setStats(getStats())
    const exps = getExperiences()
    // 按时间排序（简单字符串排序，2025.04 格式）
    const sorted = [...exps].sort((a, b) => {
      const ta = (a.time || '').replace(/\D/g, '')
      const tb = (b.time || '').replace(/\D/g, '')
      return ta.localeCompare(tb)
    })
    setTimeline(sorted)
  }, [])

  const categories = getCategories()
  const FallbackIcon = Briefcase
  const diagnosis = generateDiagnosis(stats)

  return (
    <div>
      {/* 欢迎区 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-3xl font-bold text-text mb-2"
        >
          你好，同学 👋
        </h1>
        <p className="text-text-secondary text-lg"
        >
          你的成长经历已累计沉淀 <span className="font-bold text-primary">{stats.total}</span> 条
        </p>
      </motion.div>

      {/* 数据卡片 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
        {categories.map((cat, i) => {
          const Icon = categoryIcons[cat] || FallbackIcon
          const colorClass = categoryColors[cat] || 'bg-gray-50 text-gray-600'
          return (
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-surface rounded-2xl p-5 border border-border"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colorClass}`}>
                <Icon size={20} />
              </div>
              <p className="text-2xl font-bold text-text">{stats[cat] || 0}</p>
              <p className="text-sm text-text-secondary mt-1">{cat}</p>
            </motion.div>
          )
        })}
      </div>

      {/* AI 成长诊断 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-surface rounded-2xl border border-border p-6 mb-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <Zap size={18} className="text-primary" />
          <h2 className="text-base font-bold text-text">AI 成长诊断</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* 左侧：雷达图 */}
          <div className="flex justify-center">
            <RadarChart
              data={[
                { label: '学生工作', value: stats['学生工作'] || 0, max: Math.max(3, stats.total || 1) },
                { label: '志愿服务', value: stats['志愿服务'] || 0, max: Math.max(3, stats.total || 1) },
                { label: '实习经历', value: stats['实习经历'] || 0, max: Math.max(3, stats.total || 1) },
                { label: '项目实践', value: stats['项目实践'] || 0, max: Math.max(3, stats.total || 1) },
                { label: '获奖荣誉', value: stats['获奖荣誉'] || 0, max: Math.max(3, stats.total || 1) },
              ]}
            />
          </div>

          {/* 右侧：评分与建议 */}
          <div>
            <div className="mb-4">
              <p className="text-sm text-text-secondary mb-1">综合成长指数</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-primary">{diagnosis.score}</span>
                <span className="text-sm text-text-secondary mb-1">/ 100</span>
              </div>
              <div className="mt-2 h-2 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${diagnosis.score}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              {diagnosis.suggestions.map((s, i) => (
                <div key={i} className={`flex items-start gap-2 p-2.5 rounded-xl text-xs ${
                  s.type === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-100'
                    : s.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : 'bg-sky-50 text-sky-700 border border-sky-100'
                }`}>
                  {s.type === 'warning' ? <Lightbulb size={14} className="mt-0.5 flex-shrink-0" />
                    : s.type === 'success' ? <ShieldCheck size={14} className="mt-0.5 flex-shrink-0" />
                    : <Lightbulb size={14} className="mt-0.5 flex-shrink-0" />}
                  <span>{s.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 成长时间线 */}
      {timeline.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="bg-surface rounded-2xl border border-border p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <CalendarDays size={18} className="text-primary" />
            <h2 className="text-base font-bold text-text">成长时间线</h2>
          </div>
          <div className="relative pl-4">
            {/* 竖线 */}
            <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-border" />
            <div className="space-y-4 max-h-64 overflow-auto pr-2">
              {timeline.map((exp, i) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="relative flex items-start gap-3"
                >
                  <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 z-10 border-2 ${
                    i === timeline.length - 1
                      ? 'bg-primary border-primary'
                      : 'bg-surface border-primary'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-medium text-primary">{exp.time}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg text-text-secondary">{exp.category}</span>
                    </div>
                    <p className="text-sm font-medium text-text truncate">{exp.title}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* 痛点对比入口 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-gradient-to-r from-rose-50 to-orange-50 rounded-2xl p-5 border border-rose-100 mb-6 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setShowPainModal(true)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
            <AlertCircle size={20} />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-text mb-0.5">为什么需要履历星球？</h2>
            <p className="text-sm text-text-secondary">点击了解传统写材料方式的 4 大痛点与我们的解决方案</p>
          </div>
          <ArrowRight size={18} className="text-rose-400 flex-shrink-0" />
        </div>
      </motion.div>

      {/* 快捷操作 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-6 border border-primary/10"
      >
        <h2 className="text-lg font-bold text-text mb-4">快捷操作</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/input')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-dark transition-colors"
          >
            <PlusCircle size={18} />
            添加经历
          </button>
          <button
            onClick={() => navigate('/generate')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-surface border border-border text-text font-medium text-sm hover:bg-bg transition-colors"
          >
            <FileText size={18} />
            生成材料
          </button>
          <button
            onClick={() => navigate('/templates')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-surface border border-border text-text font-medium text-sm hover:bg-bg transition-colors"
          >
            <Layers size={18} />
            浏览模板
          </button>
          <button
            onClick={() => setShowShareCard(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-surface border border-border text-text font-medium text-sm hover:bg-bg transition-colors"
          >
            <Share2 size={18} />
            生成分享卡片
          </button>
        </div>
      </motion.div>

      {/* 已生成统计 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 flex items-center gap-2 text-sm text-text-secondary"
      >
        <TrendingUp size={16} />
        已累计生成材料 <span className="font-bold text-text">{stats.generated}</span> 份
      </motion.div>

      {/* 痛点对比弹窗 */}
      <AnimatePresence>
        {showPainModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-surface rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="text-lg font-bold text-text">为什么需要履历星球？</h2>
                <button
                  onClick={() => setShowPainModal(false)}
                  className="p-1.5 rounded-lg hover:bg-bg text-text-secondary"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 左边：痛点 */}
                <div>
                  <h3 className="text-sm font-bold text-rose-600 mb-4 flex items-center gap-2">
                    <AlertCircle size={16} />
                    传统方式的痛点
                  </h3>
                  <div className="space-y-3">
                    {painPoints.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-3 p-3 rounded-xl bg-rose-50/50 border border-rose-100"
                      >
                        <item.icon size={16} className="text-rose-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-text">{item.text}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* 右边：方案 */}
                <div>
                  <h3 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    履历星球的方案
                  </h3>
                  <div className="space-y-3">
                    {solutions.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 + 0.2 }}
                        className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10"
                      >
                        <item.icon size={16} className="text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-text">{item.text}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-border flex justify-end">
                <button
                  onClick={() => { setShowPainModal(false); navigate('/input') }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
                >
                  开始体验
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 分享卡片弹窗 */}
      {showShareCard && <ShareCard onClose={() => setShowShareCard(false)} />}
    </div>
  )
}
