import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Loader2, Copy, Check, Sparkles, ArrowRight, RotateCcw } from 'lucide-react'
import { getExperiences, incrementGenerated, getSettings } from '../data/storage.js'
import { callAI } from '../utils/ai.js'
import { buildGeneratePrompt } from '../utils/prompts.js'
import { generateMockContent } from '../utils/mockGenerate.js'

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
  const [isDemo, setIsDemo] = useState(false)
  const [aiInfo, setAiInfo] = useState(null)
  const [elapsed, setElapsed] = useState(0)

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
    const selected = experiences.filter(e => selectedIds.includes(e.id))
    if (selected.length === 0) return

    const settings = getSettings()
    const hasKey = Boolean(settings.apiKey)

    setLoading(true)
    setStep(3)
    setIsDemo(!hasKey)
    setAiInfo(hasKey ? { model: settings.model || 'gpt-3.5-turbo', baseURL: settings.baseURL || '默认' } : null)
    setElapsed(0)

    if (!hasKey) {
      // 演示模式：延迟 0.8s
      await new Promise(r => setTimeout(r, 800))
      const content = generateMockContent(purpose, selected)
      setResult(content)
      incrementGenerated()
      setStep(4)
      setLoading(false)
      return
    }

    // 真实 AI 模式：记录耗时
    const start = Date.now()
    try {
      const prompt = buildGeneratePrompt(purpose, selected)
      const content = await callAI(prompt)
      const cost = ((Date.now() - start) / 1000).toFixed(1)
      setElapsed(Number(cost))
      setResult(content)
      incrementGenerated()
      setStep(4)
    } catch (e) {
      const cost = ((Date.now() - start) / 1000).toFixed(1)
      setElapsed(Number(cost))
      setResult(`生成失败：${e.message}\n\n请检查 API Key、Base URL 和模型名称是否正确。`)
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20"
        >
          <Loader2 size={40} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-text-secondary mb-2"
          >
            {isDemo ? '演示模式生成中...' : `正在调用 ${aiInfo?.model || 'AI'} 接口生成...`}
          </p>
          {!isDemo && (
            <p className="text-xs text-text-secondary"
            >
              真实 AI 生成通常需要 3-8 秒
            </p>
          )}
        </motion.div>
      )}

      {/* 步骤4：结果展示 */}
      {step === 4 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text flex items-center gap-2">
              <Sparkles size={20} className="text-primary" />
              生成结果
              {isDemo ? (
                <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-600 text-xs font-medium border border-amber-100">
                  演示模式
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-medium border border-emerald-100">
                  AI 生成 · {aiInfo?.model}
                </span>
              )}
            </h2>
            <div className="flex items-center gap-2">
              {!isDemo && elapsed > 0 && (
                <span className="text-xs text-text-secondary mr-1">
                  耗时 {elapsed}s
                </span>
              )}
              <button
                onClick={() => { setStep(1); setResult(''); setSelectedIds([]); setPurpose(''); setIsDemo(false); setAiInfo(null); setElapsed(0) }}
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
