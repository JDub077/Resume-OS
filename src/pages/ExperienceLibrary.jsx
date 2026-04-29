import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, FileText, Search, X } from 'lucide-react'
import { getExperiences, deleteExperience } from '../data/storage.js'

const TABS = ['全部', '学生工作', '志愿服务', '实习经历', '项目实践', '获奖荣誉']

const categoryColors = {
  '学生工作': 'bg-amber-50 text-amber-600 border-amber-100',
  '志愿服务': 'bg-rose-50 text-rose-600 border-rose-100',
  '实习经历': 'bg-emerald-50 text-emerald-600 border-emerald-100',
  '项目实践': 'bg-violet-50 text-violet-600 border-violet-100',
  '获奖荣誉': 'bg-sky-50 text-sky-600 border-sky-100',
}

export default function ExperienceLibrary() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('全部')
  const [search, setSearch] = useState('')
  const [experiences, setExperiences] = useState(getExperiences())
  const [deleteId, setDeleteId] = useState(null)
  const [toast, setToast] = useState(null)

  const filtered = experiences.filter(e => {
    const matchTab = activeTab === '全部' || e.category === activeTab
    const matchSearch = !search || e.title.includes(search) || e.description.includes(search)
    return matchTab && matchSearch
  })

  const handleDelete = (id) => {
    deleteExperience(id)
    setExperiences(getExperiences())
    setDeleteId(null)
    showToast('经历已删除')
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-text">经历资产库</h1>
        <button
          onClick={() => navigate('/input')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors self-start"
        >
          <Plus size={16} />
          添加经历
        </button>
      </div>

      {/* 搜索 */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="搜索经历..."
          className="w-full pl-11 pr-10 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary">
            <X size={16} />
          </button>
        )}
      </div>

      {/* 分类 Tab */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-primary text-white'
                : 'bg-surface border border-border text-text-secondary hover:bg-bg'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 经历卡片 */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-bg mx-auto mb-4 flex items-center justify-center">
            <Search size={24} className="text-text-secondary" />
          </div>
          <p className="text-text-secondary">暂无经历，去添加第一条吧</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {filtered.map((exp, i) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="bg-surface rounded-2xl border border-border p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-text mb-1">{exp.title}</h3>
                    <span className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-medium border ${categoryColors[exp.category] || 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                      {exp.category}
                    </span>
                  </div>
                  <span className="text-xs text-text-secondary">{exp.time}</span>
                </div>

                <p className="text-sm text-text-secondary line-clamp-2 mb-3">{exp.description}</p>

                {exp.result && (
                  <p className="text-xs text-text-secondary bg-bg rounded-lg px-3 py-2 mb-3">
                    成果：{exp.result}
                  </p>
                )}

                {exp.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {exp.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-md bg-primary/5 text-primary text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/input/${exp.id}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:bg-bg transition-colors"
                  >
                    <Pencil size={14} />
                    编辑
                  </button>
                  <button
                    onClick={() => setDeleteId(exp.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-danger hover:bg-danger/5 transition-colors"
                  >
                    <Trash2 size={14} />
                    删除
                  </button>
                  <button
                    onClick={() => navigate('/generate', { state: { selectedIds: [exp.id] } })}
                    className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
                  >
                    <FileText size={14} />
                    用于生成
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* 删除确认 */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface rounded-2xl shadow-xl w-full max-sm max-w-md p-6"
          >
            <h2 className="text-lg font-bold text-text mb-2">确认删除</h2>
            <p className="text-sm text-text-secondary mb-6">删除后无法恢复，是否继续？</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-text-secondary hover:bg-bg transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-danger text-white text-sm font-medium hover:bg-red-600 transition-colors"
              >
                删除
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl bg-text text-white text-sm shadow-lg"
        >
          {toast}
        </motion.div>
      )}
    </div>
  )
}
