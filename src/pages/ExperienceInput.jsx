import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Wand2, Save, Upload, ArrowLeft, Loader2, X, Sparkles } from 'lucide-react'
import { getExperienceById, saveExperience, getCategories, addCategory } from '../data/storage.js'
import { parseExperience, polishExperience } from '../utils/ai.js'

const FIELD_META = [
  { key: 'title', label: '经历标题', step: 0 },
  { key: 'category', label: '类型', step: 1 },
  { key: 'time', label: '时间', step: 2 },
  { key: 'tags', label: '能力标签', step: 3 },
  { key: 'result', label: '成果数据', step: 4 },
  { key: 'description', label: '详细描述', step: 5 },
]

export default function ExperienceInput() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [rawText, setRawText] = useState('')
  const [parsed, setParsed] = useState(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [parsingStep, setParsingStep] = useState(-1)
  const [parsingField, setParsingField] = useState('')
  const [polishing, setPolishing] = useState(false)
  const categories = getCategories()

  useEffect(() => {
    if (isEdit) {
      const exp = getExperienceById(Number(id))
      if (exp) {
        setParsed({ ...exp })
        setRawText(exp.description)
      }
    }
  }, [id, isEdit])

  const handlePolish = async () => {
    if (!parsed?.description) return
    setPolishing(true)
    try {
      const better = await polishExperience(parsed.description, parsed.title, parsed.category)
      setParsed({ ...parsed, description: better })
      showToast('AI 润色完成')
    } catch (e) {
      showToast(e.message || '润色失败')
    } finally {
      setPolishing(false)
    }
  }

  const handleParse = async () => {
    if (!rawText.trim()) return
    setLoading(true)
    setParsed(null)
    setParsingStep(0)
    setParsingField('正在分析文本语义...')

    try {
      const result = await parseExperience(rawText.trim())

      // 逐字段解析动画
      for (let i = 0; i < FIELD_META.length; i++) {
        setParsingStep(i)
        setParsingField(`正在识别：${FIELD_META[i].label}...`)
        await new Promise(r => setTimeout(r, 450))
      }

      setParsed(result)
      setParsingStep(FIELD_META.length)
      setParsingField('')
      showToast('AI 解析完成，请检查并调整')
    } catch (e) {
      showToast(e.message || '解析失败')
      setParsingStep(-1)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = () => {
    if (!parsed?.title) {
      showToast('请填写经历标题')
      return
    }
    // 如果输入了新分类，自动添加到分类列表
    if (parsed.category && !categories.includes(parsed.category)) {
      addCategory(parsed.category)
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

  const fieldVisible = (step) => parsed !== null && parsingStep > step

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

      {/* 解析中动画 */}
      <AnimatePresence>
        {loading && parsingStep >= 0 && parsingStep < FIELD_META.length && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="bg-surface rounded-2xl border border-border p-6 mb-6"
          >
            <div className="flex items-center gap-3 mb-5">
              <Sparkles size={18} className="text-primary animate-pulse" />
              <h2 className="text-lg font-bold text-text">AI 正在解析</h2>
            </div>

            <div className="space-y-3">
              {FIELD_META.map((field, i) => (
                <div key={field.key} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    parsingStep > i ? 'bg-primary text-white' : parsingStep === i ? 'bg-primary/20 text-primary' : 'bg-border text-text-secondary'
                  }`}>
                    {parsingStep > i ? '✓' : i + 1}
                  </div>
                  <span className={`text-sm transition-colors ${
                    parsingStep >= i ? 'text-text font-medium' : 'text-text-secondary'
                  }`}>
                    {field.label}
                  </span>
                  {parsingStep === i && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="ml-auto flex items-center gap-1.5 text-xs text-primary"
                    >
                      <Loader2 size={12} className="animate-spin" />
                      识别中...
                    </motion.div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 text-xs text-text-secondary bg-bg rounded-lg px-3 py-2">
              {parsingField}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 解析结果表单 */}
      {parsed && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface rounded-2xl border border-border p-6"
        >
          <h2 className="text-lg font-bold text-text mb-5">解析结果</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 标题 */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={fieldVisible(0) ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              transition={{ duration: 0.3 }}
            >
              <label className="block text-sm font-medium text-text mb-2">经历标题</label>
              <input
                type="text"
                value={parsed.title || ''}
                onChange={e => setParsed({ ...parsed, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </motion.div>

            {/* 类型 */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={fieldVisible(1) ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              transition={{ duration: 0.3 }}
            >
              <label className="block text-sm font-medium text-text mb-2">类型</label>
              <input
                type="text"
                list="category-list"
                value={parsed.category || ''}
                onChange={e => setParsed({ ...parsed, category: e.target.value })}
                placeholder="选择现有分类或输入新分类"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              <datalist id="category-list">
                {categories.map(c => <option key={c} value={c} />)}
              </datalist>
              <p className="mt-1 text-xs text-text-secondary">可直接输入新分类（如"社会实践"），保存后会自动创建</p>
            </motion.div>

            {/* 时间 */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={fieldVisible(2) ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              transition={{ duration: 0.3 }}
            >
              <label className="block text-sm font-medium text-text mb-2">时间</label>
              <input
                type="text"
                value={parsed.time || ''}
                onChange={e => setParsed({ ...parsed, time: e.target.value })}
                placeholder="如 2025.04"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </motion.div>

            {/* 成果 */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={fieldVisible(4) ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              transition={{ duration: 0.3 }}
            >
              <label className="block text-sm font-medium text-text mb-2">成果数据</label>
              <input
                type="text"
                value={parsed.result || ''}
                onChange={e => setParsed({ ...parsed, result: e.target.value })}
                placeholder="如 服务学生120人"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </motion.div>

            {/* 标签 */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={fieldVisible(3) ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              transition={{ duration: 0.3 }}
              className="md:col-span-2"
            >
              <label className="block text-sm font-medium text-text mb-2">能力标签（用逗号分隔）</label>
              <input
                type="text"
                value={Array.isArray(parsed.tags) ? parsed.tags.join('，') : parsed.tags || ''}
                onChange={e => setParsed({ ...parsed, tags: e.target.value.split(/[,，]/).map(t => t.trim()).filter(Boolean) })}
                placeholder="如 组织协调, 宣传运营"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </motion.div>

            {/* 描述 */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={fieldVisible(5) ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              transition={{ duration: 0.3 }}
              className="md:col-span-2"
            >
              <label className="block text-sm font-medium text-text mb-2">详细描述</label>
              <textarea
                value={parsed.description || ''}
                onChange={e => setParsed({ ...parsed, description: e.target.value })}
                className="w-full h-24 px-4 py-3 rounded-xl border border-border bg-bg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              <div className="mt-2">
                <button
                  onClick={handlePolish}
                  disabled={polishing || !parsed.description}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-primary border border-primary/20 hover:bg-primary/5 transition-colors disabled:opacity-50"
                >
                  {polishing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  {polishing ? 'AI 润色中...' : 'AI 润色表达'}
                </button>
              </div>
            </motion.div>
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
      <AnimatePresence>
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
      </AnimatePresence>
    </div>
  )
}
