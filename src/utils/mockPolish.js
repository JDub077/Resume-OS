export function mockPolish(description, title, category) {
  const desc = description || '';
  if (!desc.trim()) return desc;

  // 动词升级映射（从平淡表达升级为申请/简历级别的专业表达）
  const verbUpgrades = {
    '负责': '主导',
    '做': '策划并执行',
    '帮忙': '协同推进',
    '参与': '深度参与',
    '组织': '统筹策划',
    '写': '撰写',
    '管': '统筹管理',
    '带': '带领',
    '教': '讲授',
    '拍': '拍摄制作',
    '设计': '独立设计',
    '弄': '搭建',
    '搞': '推进',
    '跑': '落地执行',
  };

  let polished = desc;

  // 替换动词（最多替换2个，避免过度改写）
  let replaced = 0;
  for (const [plain, strong] of Object.entries(verbUpgrades)) {
    if (polished.includes(plain) && replaced < 2) {
      polished = polished.replace(plain, strong);
      replaced++;
    }
  }

  // 句式微调：将"我"开头的句子改为更客观的表达
  polished = polished.replace(/^我/g, '').replace(/，我/g, '，').trim();
  if (polished.startsWith('，')) polished = polished.slice(1).trim();

  // 如果完全没有成果数据，根据类型补充一句自然的话术（不添加固定前缀）
  const hasNumber = /\d+/.test(polished);
  const hasResult = polished.includes('获') || polished.includes('提升') || polished.includes('突破') || polished.includes('覆盖');
  if (!hasNumber && !hasResult && title) {
    const quantifiers = {
      '学生工作': '相关工作累计覆盖师生300余人次，形成可复用的工作机制。',
      '志愿服务': '服务时长累计超过100小时，在实践中深化了社会责任感。',
      '实习经历': '实习期间输出多项高质量成果，获得团队正面反馈。',
      '项目实践': '项目成果落地应用，积累了从0到1的完整项目经验。',
      '获奖荣誉': '在激烈竞争中脱颖而出，体现出扎实的专业功底与综合素质。',
    };
    const suffix = quantifiers[category] || '在实践中取得了超出预期的实质性成果。';
    if (!/[。！？.!?:;]$/.test(polished)) polished += '。';
    polished += suffix;
  }

  return polished;
}
