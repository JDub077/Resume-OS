import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Trash2, ChevronDown, ChevronUp, Clock, ArrowRight, Sparkles } from 'lucide-react'
import { getGeneratedRecords, deleteGeneratedRecord } from '../data/storage.js'

export default function GeneratedHistory() {
  const navigate = useNavigate()
  const [records, setRecords] = useState(getGeneratedRecords())
  const [expandedId, setExpandedId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const handleDelete = (id) => {
    deleteGeneratedRecord(id)
    setRecords(getGeneratedRecords())
    setDeleteId(null)
  }

  const formatTime = (iso) => {
    try {
      const d = new Date(iso)
      return d.toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    } catch {
      return iso
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <FileText size={24} className="text-primary" />
          已生成材料
        </h1>
        <button
          onClick={() => navigate('/generate')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          <Sparkles size={16} />
          去生成
        </button>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-bg mx-auto mb-4 flex items-center justify-center">
            <FileText size={24} className="text-text-secondary" />
          </div>
          <p className="text-text-secondary mb-2">暂无已保存的生成记录</p>
          <p className="text-xs text-text-secondary">生成材料后点击"保存"即可在这里查看</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {records.map((record) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-surface rounded-2xl border border-border overflow-hidden"
              >
                <div
                  className="p-5 flex items-center gap-4 cursor-pointer hover:bg-bg/50 transition-colors"
                  onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <FileText size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-text text-sm">{record.purposeLabel || record.purpose}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-primary/5 text-primary border border-primary/10">
                        {record.purpose}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-text-secondary">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatTime(record.createdAt)}
                      </span>
                      <span>{record.content?.length || 0} 字</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate('/generate', { state: { selectedIds: record.experienceIds || [] } })
                      }}
                      className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-primary hover:bg-primary/5 border border-primary/20 transition-colors"
                    >
                      用于生成
                      <ArrowRight size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteId(record.id)
                      }}
                      className="p-2 rounded-lg text-text-secondary hover:text-danger hover:bg-danger/5 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                    {expandedId === record.id ? (
                      <ChevronUp size={18} className="text-text-secondary" />
                    ) : (
                      <ChevronDown size={18} className="text-text-secondary" />
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === record.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t border-border pt-4">
                        <pre className="whitespace-pre-wrap text-sm text-text leading-relaxed font-sans bg-bg rounded-xl p-4">
                          {record.content}
                        </pre>
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => navigate('/generate', { state: { selectedIds: record.experienceIds || [] } })}
                            className="sm:hidden flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-primary hover:bg-primary/5 border border-primary/20 transition-colors"
                          >
                            用于生成
                            <ArrowRight size={12} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
            className="bg-surface rounded-2xl shadow-xl w-full max-w-sm p-6"
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
    </div>
  )
}
