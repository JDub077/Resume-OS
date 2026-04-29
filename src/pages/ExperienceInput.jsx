import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Wand2, Save, Upload, ArrowLeft, Loader2, X } from 'lucide-react'
import { getExperienceById, saveExperience } from '../data/storage.js'
import { parseExperience } from '../utils/ai.js'

const CATEGORIES = ['学生工作', '志愿服务', '实习经历', '项目实践', '获奖荣誉']

export default function ExperienceInput() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [rawText, setRawText] = useState('')
  const [parsed, setParsed] = useState(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (isEdit) {
      const exp = getExperienceById(Number(id))
      if (exp) {
        setParsed({ ...exp })
        setRawText(exp.description)
      }
    }
  }, [id, isEdit])

  const handleParse = async () => {
    if (!rawText.trim()) return
    setLoading(true)
    try {
      const result = await parseExperience(rawText.trim())
      setParsed(result)
      showToast('AI 解析完成，请检查并调整')
    } catch (e) {
      showToast(e.message || '解析失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = () => {
    if (!parsed?.title) {
      showToast('请填写经历标题')
      return
    }
    const data = {
      ...parsed,
      id: isEdit ? Number(id) : undefined,
      description: rawText || parsed.description
    }
    saveExperience(data)
    showToast(isEdit ? '经历已更新' : '经历已保存')
    setTimeout(() => navigate('/library'), 800)
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setRawText(`上传文件：${file.name}\n（比赛版本暂不支持文件解析，请手动粘贴经历内容）`)
      showToast('文件已接收，请手动补充内容')
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-bg text-text-secondary"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-text">
          {isEdit ? '编辑经历' : '录入经历'}
        </h1>
      </div>

      {/* 原始输入 */}
      <div className="bg-surface rounded-2xl border border-border p-6 mb-6">
        <label className="block text-sm font-medium text-text mb-3">
          经历内容
        </label>
        <textarea
          value={rawText}
          onChange={e => setRawText(e.target.value)}
          placeholder="请输入你的经历内容...&#10;例如：2025年4月赴贵州支教7天，负责课程设计与宣传视频拍摄。"
          className="w-full h-40 px-4 py-3 rounded-xl border border-border bg-bg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <button
            onClick={handleParse}
            disabled={loading || !rawText.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
            AI 解析经历
          </button>
          <label className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-bg text-sm text-text-secondary hover:bg-bg/80 cursor-pointer transition-colors">
            <Upload size={16} />
            上传文件
            <input type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      </div>

      {/* 解析结果表单 */}
      {parsed && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface rounded-2xl border border-border p-6"
        >
          <h2 className="text-lg font-bold text-text mb-5">解析结果</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">经历标题</label>
              <input
                type="text"
                value={parsed.title || ''}
                onChange={e => setParsed({ ...parsed, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">类型</label>
              <select
                value={parsed.category || ''}
                onChange={e => setParsed({ ...parsed, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">时间</label>
              <input
                type="text"
                value={parsed.time || ''}
                onChange={e => setParsed({ ...parsed, time: e.target.value })}
                placeholder="如 2025.04"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">成果数据</label>
              <input
                type="text"
                value={parsed.result || ''}
                onChange={e => setParsed({ ...parsed, result: e.target.value })}
                placeholder="如 服务学生120人"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text mb-2">能力标签（用逗号分隔）</label>
              <input
                type="text"
                value={Array.isArray(parsed.tags) ? parsed.tags.join('，') : parsed.tags || ''}
                onChange={e => setParsed({ ...parsed, tags: e.target.value.split(/[,，]/).map(t => t.trim()).filter(Boolean) })}
                placeholder="如 组织协调, 宣传运营"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text mb-2">详细描述</label>
              <textarea
                value={parsed.description || ''}
                onChange={e => setParsed({ ...parsed, description: e.target.value })}
                className="w-full h-24 px-4 py-3 rounded-xl border border-border bg-bg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
            >
              <Save size={16} />
              保存经历
            </button>
          </div>
        </motion.div>
      )}

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl bg-text text-white text-sm shadow-lg"
        >
          {toast}
          <button onClick={() => setToast(null)} className="ml-1">
            <X size={14} />
          </button>
        </motion.div>
      )}
    </div>
  )
}
