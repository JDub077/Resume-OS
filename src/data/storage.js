const STORAGE_KEY = 'resume_os_experiences';
const STORAGE_KEY_SETTINGS = 'resume_os_settings';

// 默认示例数据
const DEFAULT_EXPERIENCES = [
  {
    id: 1,
    title: '贵州支教项目',
    category: '志愿服务',
    time: '2025.04',
    description: '赴贵州山区小学开展为期7天的支教活动，负责三年级语文课程设计与教学，并拍摄制作宣传视频记录支教过程。',
    tags: ['组织协调', '教学实践', '宣传运营'],
    result: '服务学生120人，完成课程设计6份，制作宣传视频3条'
  },
  {
    id: 2,
    title: '学生会外联部部长',
    category: '学生工作',
    time: '2024.09 - 2025.06',
    description: '负责学生会外联部日常管理工作，统筹部门招新与培训，主导学院大型活动的赞助洽谈与资源整合。',
    tags: ['领导力', '商务谈判', '团队管理'],
    result: '拉取赞助经费3万元，组织大型活动3场，部门成员从5人扩展至12人'
  },
  {
    id: 3,
    title: '腾讯产品运营实习',
    category: '实习经历',
    time: '2025.01 - 2025.03',
    description: '在某事业群产品运营团队实习，负责用户增长活动策划、数据分析与内容运营，协助完成产品新功能上线推广。',
    tags: ['数据分析', '用户运营', '活动策划'],
    result: '策划活动参与人数提升40%，输出运营分析报告8份'
  },
  {
    id: 4,
    title: '校园二手交易平台',
    category: '项目实践',
    time: '2024.03 - 2024.08',
    description: '作为项目负责人，带领5人团队开发校园二手物品交易小程序，负责需求分析、产品设计与前端开发。',
    tags: ['产品开发', '团队协作', '前端技术'],
    result: '小程序上线3个月用户数突破2000人，完成交易订单500+笔'
  }
];

function initStorage() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_EXPERIENCES));
  }
}

export function getExperiences() {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveExperience(exp) {
  const list = getExperiences();
  if (exp.id) {
    const idx = list.findIndex(e => e.id === exp.id);
    if (idx >= 0) {
      list[idx] = exp;
    } else {
      list.push(exp);
    }
  } else {
    exp.id = Date.now();
    list.push(exp);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return exp;
}

export function deleteExperience(id) {
  const list = getExperiences().filter(e => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function getExperienceById(id) {
  return getExperiences().find(e => e.id === Number(id));
}

export function getStats() {
  const list = getExperiences();
  const categories = ['学生工作', '志愿服务', '实习经历', '项目实践', '获奖荣誉'];
  const stats = {};
  categories.forEach(c => {
    stats[c] = list.filter(e => e.category === c).length;
  });
  return {
    total: list.length,
    generated: Number(localStorage.getItem('resume_os_generated_count') || 0),
    ...stats
  };
}

export function incrementGenerated() {
  const key = 'resume_os_generated_count';
  const count = Number(localStorage.getItem(key) || 0);
  localStorage.setItem(key, String(count + 1));
}

export function getSettings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_SETTINGS)) || {};
  } catch {
    return {};
  }
}

export function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
}
