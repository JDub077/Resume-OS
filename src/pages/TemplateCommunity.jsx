import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, Flame, ArrowRight, Lock } from 'lucide-react'

const TEMPLATES = [
  {
    id: 1,
    title: '国家奖学金高分模板',
    scene: '国家奖学金',
    desc: '突出学术能力与综合素质，结构清晰，语言正式有感染力',
    hot: true,
    color: 'from-amber-500 to-orange-500'
  },
  {
    id: 2,
    title: '优秀学生干部申报模板',
    scene: '优秀学生干部',
    desc: '强调组织领导力与服务意识，用数据和案例说话',
    hot: true,
    color: 'from-rose-500 to-pink-500'
  },
  {
    id: 3,
    title: '产品经理求职简历模板',
    scene: '求职简历',
    desc: '互联网产品岗专用，STAR法则描述，成果量化',
    hot: true,
    color: 'from-emerald-500 to-teal-500'
  },
  {
    id: 4,
    title: '三下乡先进个人模板',
    scene: '优秀志愿者',
    desc: '社会实践与志愿服务类申报，突出奉献精神与社会影响',
    hot: false,
    color: 'from-violet-500 to-purple-500'
  },
  {
    id: 5,
    title: '保研个人陈述模板',
    scene: '保研陈述',
    desc: '学术导向，突出科研潜力与专业基础，逻辑严谨',
    hot: false,
    color: 'from-sky-500 to-blue-500'
  },
  {
    id: 6,
    title: '考研复试自我介绍模板',
    scene: '复试介绍',
    desc: '3分钟口头表达版本，专业能力与综合素质兼顾',
    hot: false,
    color: 'from-cyan-500 to-indigo-500'
  },
  {
    id: 7,
    title: '面试自我介绍通用模板',
    scene: '面试自我介绍',
    desc: '适用于各类企业面试，自信自然，突出岗位匹配度',
    hot: false,
    color: 'from-slate-500 to-gray-500'
  },
  {
    id: 8,
    title: '网申登记表模板',
    scene: '网申登记表',
    desc: '结构化呈现个人优势，便于HR快速抓取关键信息',
    hot: false,
    color: 'from-stone-500 to-neutral-500'
  }
]

const PRO_TEMPLATES = [
  {
    id: 'pro-1',
    title: '英文简历模板',
    desc: '面向海外求职与留学申请，地道英文表达',
    color: 'from-blue-600 to-indigo-600'
  },
  {
    id: 'pro-2',
    title: '面试模拟训练',
    desc: '基于经历生成模拟面试题库，AI 陪练反馈',
    color: 'from-violet-600 to-fuchsia-600'
  },
  {
    id: 'pro-3',
    title: '多语言简历模板',
    desc: '支持日语、韩语、德语等小语种材料生成',
    color: 'from-emerald-600 to-teal-600'
  }
]

export default function TemplateCommunity() {
  const navigate = useNavigate()

  const handleUse = (scene) => {
    navigate('/generate', { state: { preselectedPurpose: scene } })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">模板社区</h1>
          <p className="text-sm text-text-secondary mt-1">热门模板，一键套用</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {TEMPLATES.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-surface rounded-2xl border border-border p-5 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center`}>
                <FileText size={18} className="text-white" />
              </div>
              {t.hot && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-50 text-rose-600 text-xs font-medium">
                  <Flame size={12} />
                  热门
                </span>
              )}
            </div>

            <h3 className="font-bold text-text mb-1">{t.title}</h3>
            <p className="text-xs text-text-secondary bg-bg rounded-lg px-2 py-1 inline-block mb-2">
              适用：{t.scene}
            </p>
            <p className="text-sm text-text-secondary mb-4">{t.desc}</p>

            <button
              onClick={() => handleUse(t.scene)}
              className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors group-hover:underline"
            >
              去生成
              <ArrowRight size={14} />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Pro 模板占位 */}
      <div className="mb-4">
        <h2 className="text-base font-bold text-text flex items-center gap-2 mb-1">
          <Lock size={16} className="text-amber-500" />
          高级会员专属
        </h2>
        <p className="text-xs text-text-secondary mb-4">升级高级会员解锁更多专业模板</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PRO_TEMPLATES.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.08 }}
            className="bg-surface rounded-2xl border border-border p-5 opacity-60 hover:opacity-80 transition-opacity"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center`}>
                <Lock size={18} className="text-white" />
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-600 text-xs font-medium border border-amber-100">
                PRO
              </span>
            </div>

            <h3 className="font-bold text-text mb-1">{t.title}</h3>
            <p className="text-sm text-text-secondary mb-4">{t.desc}</p>

            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
              高级会员解锁
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
