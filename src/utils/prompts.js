export function buildGeneratePrompt(purpose, experiences) {
  const expText = experiences.map((e, i) => `${i + 1}. ${e.title}：${e.description}${e.result ? '，成果：' + e.result : ''}`).join('\n');

  const purposeMap = {
    '国家奖学金': {
      scene: '国家奖学金申请材料',
      focus: '学术能力、综合素质、领导力、社会责任感',
      tone: '正式、严谨、有感染力',
      length: '600字以内',
      extra: '请突出学业成绩与综合发展的平衡，体现德智体美劳全面发展'
    },
    '优秀学生干部': {
      scene: '优秀学生干部申报材料',
      focus: '组织领导能力、服务意识、团队协作、工作成果',
      tone: '正式、务实、有说服力',
      length: '600字以内',
      extra: '请突出在岗位上为学生群体做出的实际贡献'
    },
    '优秀志愿者': {
      scene: '优秀志愿者申报材料',
      focus: '公益精神、奉献意识、服务时长与质量、社会影响',
      tone: '真诚、温暖、有感染力',
      length: '600字以内',
      extra: '请突出志愿服务的持续性与个人成长'
    },
    '求职简历': {
      scene: '中文求职简历中的个人经历描述',
      focus: '岗位匹配度、专业能力、成果量化',
      tone: '专业、简洁、有竞争力',
      length: '每段经历50-100字',
      extra: '请使用STAR法则描述经历，突出成果数据'
    },
    '网申登记表': {
      scene: '企业网申登记表中的个人陈述',
      focus: '个人优势、职业规划、企业匹配度',
      tone: '正式、自信、有条理',
      length: '300字以内',
      extra: '请结构化呈现，便于HR快速阅读'
    },
    '面试自我介绍': {
      scene: '面试自我介绍稿',
      focus: '个人亮点、核心优势、与岗位的匹配性',
      tone: '自信、自然、有亲和力',
      length: '2分钟以内（约400字）',
      extra: '请设计适合口头表达的流畅文案，避免过于书面化'
    },
    '保研陈述': {
      scene: '保研个人陈述',
      focus: '学术潜力、科研兴趣、专业基础、未来规划',
      tone: '学术化、严谨、有深度',
      length: '800字以内',
      extra: '请突出学术相关的经历和成果，体现研究潜力'
    },
    '复试介绍': {
      scene: '考研复试自我介绍',
      focus: '专业基础、科研经历、综合素质、读研动机',
      tone: '自信、谦逊、有条理',
      length: '3分钟以内（约600字）',
      extra: '请平衡专业能力与综合素质的展示'
    }
  };

  const config = purposeMap[purpose] || purposeMap['求职简历'];

  return `你是一名专业大学生成长材料顾问。

用户经历如下：

${expText}

请生成一份【${config.scene}】。

要求：
- 语言风格：${config.tone}
- 重点突出：${config.focus}
- 篇幅限制：${config.length}
- ${config.extra}

请直接输出文案内容，不要加任何前缀说明。`;
}
