import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  PlusCircle,
  FileText,
  Layers,
  Briefcase,
  Heart,
  Code,
  Award,
  TrendingUp
} from 'lucide-react'
import { getStats } from '../data/storage.js'

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

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ total: 0, generated: 0 })

  useEffect(() => {
    setStats(getStats())
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
    </div>
  )
}
