export function mockPolish(description, title, category) {
  // 本地润色规则：把平淡表达升级为专业表达
  const desc = description || '';

  // 动词升级映射
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
  };

  let polished = desc;

  // 替换动词
  for (const [plain, strong] of Object.entries(verbUpgrades)) {
    if (polished.includes(plain)) {
      polished = polished.replace(plain, strong);
      break; // 只替换第一个匹配的
    }
  }

  // 添加成果量化前缀（如果没有量化数据）
  const hasNumber = /\d+/.test(polished);
  if (!hasNumber && title) {
    const quantifiers = {
      '学生工作': '，累计覆盖学生300+人次',
      '志愿服务': '，服务时长累计超过50小时',
      '实习经历': '，推动业务指标提升20%+',
      '项目实践': '，项目上线后获得2000+用户使用',
      '获奖荣誉': '，在300+名参赛者中脱颖而出',
    };
    const suffix = quantifiers[category] || '，取得显著成效';
    if (!polished.endsWith('。')) polished += '。';
    polished += suffix;
  }

  // 场景化前缀
  const prefixes = {
    '学生工作': '在任职期间，',
    '志愿服务': '秉持奉献精神，',
    '实习经历': '立足业务实际，',
    '项目实践': '作为核心成员，',
    '获奖荣誉': '凭借扎实实力，',
  };
  const prefix = prefixes[category] || '';
  if (prefix && !polished.startsWith(prefix)) {
    polished = prefix + polished;
  }

  return polished;
}
