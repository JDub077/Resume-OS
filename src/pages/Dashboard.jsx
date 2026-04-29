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
import { getStats, getExperiences } from '../data/storage.js'
import { CalendarDays } from 'lucide-react'

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

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ total: 0, generated: 0 })
  const [showPainModal, setShowPainModal] = useState(false)
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

  const categories = ['学生工作', '志愿服务', '实习经历', '项目实践']

  return (
    <div>
      {/* 欢迎区 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-3xl font-bold text-text mb-2">
          你好，同学 👋
        </h1>
        <p className="text-text-secondary text-lg">
          你的成长经历已累计沉淀 <span className="font-bold text-primary">{stats.total}</span> 条
        </p>
      </motion.div>

      {/* 数据卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {categories.map((cat, i) => {
          const Icon = categoryIcons[cat]
          const colorClass = categoryColors[cat]
          return (
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-surface rounded-2xl p-5 border border-border cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate('/library', { state: { category: cat } })}
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
    </div>
  )
}
