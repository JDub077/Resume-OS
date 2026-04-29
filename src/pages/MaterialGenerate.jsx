import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Loader2, Copy, Check, Sparkles, ArrowRight, RotateCcw } from 'lucide-react'
import { getExperiences, incrementGenerated, getSettings } from '../data/storage.js'
import { callAI } from '../utils/ai.js'
import { buildGeneratePrompt } from '../utils/prompts.js'

const PURPOSES = [
  { value: '国家奖学金', label: '国家奖学金申请' },
  { value: '优秀学生干部', label: '优秀学生干部申报' },
  { value: '优秀志愿者', label: '优秀志愿者申报' },
  { value: '求职简历', label: '中文求职简历' },
  { value: '网申登记表', label: '企业网申登记表' },
  { value: '面试自我介绍', label: '面试自我介绍' },
  { value: '保研陈述', label: '保研个人陈述' },
  { value: '复试介绍', label: '考研复试介绍' },
]

export default function MaterialGenerate() {
  const navigate = useNavigate()
  const location = useLocation()
  const [step, setStep] = useState(1)
  const [purpose, setPurpose] = useState('')
  const [experiences, setExperiences] = useState(getExperiences())
  const [selectedIds, setSelectedIds] = useState([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [copied, setCopied] = useState(false)
  const [noKeyWarning, setNoKeyWarning] = useState(false)

  useEffect(() => {
    const preselected = location.state?.selectedIds || []
    const prePurpose = location.state?.preselectedPurpose
    if (prePurpose) {
      setPurpose(prePurpose)
      if (preselected.length > 0) {
        setSelectedIds(preselected)
        setStep(3)
      } else {
        setStep(2)
      }
    } else if (preselected.length > 0) {
      setSelectedIds(preselected)
      setStep(1)
    }
  }, [location.state])

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleGenerate = async () => {
    const settings = getSettings()
    if (!settings.apiKey) {
      setNoKeyWarning(true)
      return
    }

    const selected = experiences.filter(e => selectedIds.includes(e.id))
    if (selected.length === 0) return

    setLoading(true)
    setStep(3)
    try {
      const prompt = buildGeneratePrompt(purpose, selected)
      const content = await callAI(prompt)
      setResult(content)
      incrementGenerated()
      setStep(4)
    } catch (e) {
      setResult(`生成失败：${e.message}\n\n请检查 API Key 和网络连接后重试。`)
      setStep(4)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleMockGenerate = () => {
    const selected = experiences.filter(e => selectedIds.includes(e.id))
    if (selected.length === 0) return
    setLoading(true)
    setStep(3)
    setTimeout(() => {
      const expText = selected.map(e => `${e.title}：${e.description}`).join('；')
      const mockResult = `【${purpose}材料】\n\n尊敬的评审老师/面试官：\n\n您好！以下是我的个人经历概述：\n\n${expText}\n\n在这些经历中，我不仅锻炼了自己的专业技能，更培养了团队协作、沟通表达与问题解决的能力。我始终保持积极进取的态度，努力将每一项工作做到最好。\n\n未来，我将继续以饱满的热情投入到学习和工作中，不断提升自我，争取更大的进步。\n\n感谢您的时间和考虑！`
      setResult(mockResult)
      incrementGenerated()
      setStep(4)
      setLoading(false)
      setNoKeyWarning(false)
    }, 1500)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-6">AI 材料生成器</h1>

      {/* 步骤指示器 */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3, 4].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              step >= s ? 'bg-primary text-white' : 'bg-border text-text-secondary'
            }`}>
              {s}
            </div>
            {s < 4 && <div className={`w-8 h-0.5 ${step > s ? 'bg-primary' : 'bg-border'}`} />}
          </div>
        ))}
      </div>

      {/* 步骤1：选择用途 */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="text-lg font-bold text-text mb-4">第一步：选择用途</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {PURPOSES.map(p => (
              <button
                key={p.value}
                onClick={() => setPurpose(p.value)}
                className={`text-left px-5 py-4 rounded-xl border text-sm font-medium transition-all ${
                  purpose === p.value
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border bg-surface text-text hover:bg-bg'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => purpose && setStep(2)}
            disabled={!purpose}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors"
          >
            下一步
            <ArrowRight size={16} />
          </button>
        </motion.div>
      )}

      {/* 步骤2：选择经历 */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="text-lg font-bold text-text mb-4">第二步：选择经历</h2>
          <div className="space-y-3 mb-6 max-h-96 overflow-auto pr-2">
            {experiences.map(exp => (
              <label
                key={exp.id}
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedIds.includes(exp.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-surface hover:bg-bg'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(exp.id)}
                  onChange={() => toggleSelect(exp.id)}
                  className="mt-1 w-4 h-4 text-primary rounded border-border focus:ring-primary"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-text text-sm">{exp.title}</span>
                    <span className="text-xs text-text-secondary bg-bg px-2 py-0.5 rounded">{exp.category}</span>
                  </div>
                  <p className="text-xs text-text-secondary line-clamp-2">{exp.description}</p>
                </div>
              </label>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-text-secondary hover:bg-bg transition-colors"
            >
              上一步
            </button>
            <button
              onClick={() => selectedIds.length > 0 && handleGenerate()}
              disabled={selectedIds.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors"
            >
              生成
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {/* 步骤3：生成中 */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <Loader2 size={40} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-text-secondary">AI 正在思考，请稍候...</p>
        </motion.div>
      )}

      {/* 无API Key提示 */}
      {noKeyWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface rounded-2xl shadow-xl w-full max-w-md p-6"
          >
            <h2 className="text-lg font-bold text-text mb-2">未配置 API Key</h2>
            <p className="text-sm text-text-secondary mb-6">
              您尚未配置 AI 接口的 API Key。您可以选择：
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setNoKeyWarning(false)}
                className="w-full px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
              >
                去设置 API Key
              </button>
              <button
                onClick={handleMockGenerate}
                className="w-full px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-text-secondary hover:bg-bg transition-colors"
              >
                使用模拟生成（演示用）
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 步骤4：结果展示 */}
      {step === 4 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text flex items-center gap-2">
              <Sparkles size={20} className="text-primary" />
              生成结果
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => { setStep(1); setResult(''); setSelectedIds([]); setPurpose('') }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-text-secondary hover:bg-bg border border-border transition-colors"
              >
                <RotateCcw size={14} />
                重新生成
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-primary hover:bg-primary/5 border border-primary/20 transition-colors"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? '已复制' : '复制'}
              </button>
            </div>
          </div>
          <div className="bg-surface rounded-2xl border border-border p-6">
            <pre className="whitespace-pre-wrap text-sm text-text leading-relaxed font-sans">
              {result}
            </pre>
          </div>
        </motion.div>
      )}
    </div>
  )
}
