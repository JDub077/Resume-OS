const STORAGE_KEY = 'resume_os_experiences';
const STORAGE_KEY_SETTINGS = 'resume_os_settings';

// ========== 代理配置（部署后替换此处）==========
// 1. 在 Cloudflare Worker 上部署 proxy/worker.js
// 2. 设置环境变量 KIMI_API_KEY = sk-xxx
// 3. 把 Worker 地址填到下面 PROXY_URL 中
// 4. 重新构建部署，评委打开网页即可直接使用真实 AI
const PROXY_URL = 'https://resume-proxy.2955647756.workers.dev';
// ================================================

const DEFAULT_SETTINGS = {
  baseURL: PROXY_URL,
  // SiliconFlow（硅基流动）免费模型，国内稳定、OpenAI 兼容
  // 注册地址：https://cloud.siliconflow.cn/
  // 其他可选免费模型：Qwen/Qwen2.5-Coder-7B-Instruct、THUDM/glm-4-9b-chat
  model: 'Qwen/Qwen2.5-7B-Instruct',
  useProxy: Boolean(PROXY_URL),
};

// 默认示例数据（12条丰富经历，覆盖5大维度）
const DEFAULT_EXPERIENCES = [
  {
    id: 101,
    title: '学生会外联部部长',
    category: '学生工作',
    time: '2024.09 - 2025.06',
    description: '负责学生会外联部日常管理工作，统筹部门招新与培训，主导学院大型活动的赞助洽谈与资源整合。',
    tags: ['领导力', '商务谈判', '团队管理'],
    result: '拉取赞助经费3万元，组织大型活动3场，部门成员从5人扩展至12人'
  },
  {
    id: 102,
    title: '班级团支部书记',
    category: '学生工作',
    time: '2023.09 - 2024.06',
    description: '负责班级团支部建设与思想引领工作，组织策划主题团日活动、青年大学习打卡，协助辅导员完成班级日常管理。',
    tags: ['组织协调', '思想引领', '公文写作'],
    result: '班级青年大学习完成率保持100%，获评校级"五四红旗团支部"'
  },
  {
    id: 103,
    title: '社团联合会副主席',
    category: '学生工作',
    time: '2024.03 - 2025.03',
    description: '协助管理全校20余个注册社团，负责社团年审、活动策划审批与资源协调，主导举办校园社团文化节。',
    tags: ['统筹管理', '活动策划', '跨部门协作'],
    result: '社团文化节覆盖师生3000+人次，社团满意度提升25%'
  },
  {
    id: 201,
    title: '贵州山区支教志愿服务',
    category: '志愿服务',
    time: '2025.04',
    description: '赴贵州山区小学开展为期7天的支教活动，负责三年级语文课程设计与教学，并拍摄制作宣传视频记录支教过程。',
    tags: ['教学实践', '宣传运营', '社会服务'],
    result: '服务学生120人，完成课程设计6份，制作宣传视频3条'
  },
  {
    id: 202,
    title: '社区疫情防控志愿者',
    category: '志愿服务',
    time: '2022.12 - 2023.02',
    description: '在社区担任疫情防控志愿者，协助核酸检测信息录入、物资分发与秩序维护，为独居老人提供上门配送服务。',
    tags: ['服务意识', '应急响应', '沟通协作'],
    result: '累计服务时长120小时，覆盖社区居民800余户'
  },
  {
    id: 301,
    title: '腾讯产品运营实习',
    category: '实习经历',
    time: '2025.01 - 2025.03',
    description: '在某事业群产品运营团队实习，负责用户增长活动策划、数据分析与内容运营，协助完成产品新功能上线推广。',
    tags: ['数据分析', '用户运营', '活动策划'],
    result: '策划活动参与人数提升40%，输出运营分析报告8份'
  },
  {
    id: 302,
    title: '字节跳动前端开发实习',
    category: '实习经历',
    time: '2025.06 - 2025.09',
    description: '参与抖音电商业务线前端开发，负责商品详情页性能优化与组件库建设，独立完成3个中后台系统的页面开发与联调。',
    tags: ['React', 'TypeScript', '前端工程化', '性能优化'],
    result: '页面首屏加载时间降低35%，沉淀5个可复用业务组件'
  },
  {
    id: 401,
    title: '校园二手交易平台',
    category: '项目实践',
    time: '2024.03 - 2024.08',
    description: '作为项目负责人，带领5人团队开发校园二手物品交易小程序，负责需求分析、产品设计与前端开发。',
    tags: ['产品开发', '团队协作', '前端技术'],
    result: '小程序上线3个月用户数突破2000人，完成交易订单500+笔'
  },
  {
    id: 402,
    title: '全国大学生数学建模竞赛',
    category: '项目实践',
    time: '2024.09',
    description: '作为团队队长，负责数学模型建立、Python编程实现与论文撰写，针对城市交通拥堵问题提出优化方案。',
    tags: ['数学建模', 'Python', '数据分析', '论文写作'],
    result: '获省级一等奖，论文被推荐参加全国评审'
  },
  {
    id: 403,
    title: '基于深度学习的医学影像分类系统',
    category: '项目实践',
    time: '2024.11 - 2025.04',
    description: '在导师指导下独立开展科研项目，基于ResNet网络实现肺部CT影像的自动分类，完成数据集标注、模型训练与前端可视化。',
    tags: ['深度学习', 'PyTorch', '计算机视觉', '科研实践'],
    result: '模型准确率达94.2%，项目入选校级大创优秀结题'
  },
  {
    id: 501,
    title: '国家奖学金',
    category: '获奖荣誉',
    time: '2024.10',
    description: '凭借优异的学业成绩与全面的综合素质，经学院评审、学校公示，荣获2023-2024学年国家奖学金。',
    tags: ['学业优异', '综合素质'],
    result: '综合测评排名专业第1名（1/156），学业成绩GPA 3.92/4.0'
  },
  {
    id: 502,
    title: '蓝桥杯全国软件设计大赛二等奖',
    category: '获奖荣誉',
    time: '2024.05',
    description: '参加第十五届蓝桥杯全国软件和信息技术专业人才大赛（软件开发组），独立完成算法设计与程序实现。',
    tags: ['算法竞赛', '编程能力', '逻辑思维'],
    result: '获省级一等奖并晋级国赛，最终获全国二等奖'
  },
];

function initStorage() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_EXPERIENCES));
  }
  // 预置默认代理配置（首次访问）
  if (!localStorage.getItem(STORAGE_KEY_SETTINGS) && DEFAULT_SETTINGS.baseURL) {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
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
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_SETTINGS)) || {};
  } catch {
    return {};
  }
}

export function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
}

const STORAGE_KEY_CATEGORIES = 'resume_os_categories';
const DEFAULT_CATEGORIES = ['学生工作', '志愿服务', '实习经历', '项目实践', '获奖荣誉'];

export function getCategories() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    if (stored) return JSON.parse(stored);
    return DEFAULT_CATEGORIES;
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

export function addCategory(name) {
  const list = getCategories();
  const trimmed = name?.trim();
  if (trimmed && !list.includes(trimmed)) {
    list.push(trimmed);
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(list));
  }
  return list;
}

const STORAGE_KEY_GENERATED = 'resume_os_generated';

export function initDemoData() {
  const DEMO_EXPERIENCES = [
    {
      id: 101,
      title: '学生会外联部部长',
      category: '学生工作',
      time: '2024.09 - 2025.06',
      description: '负责学生会外联部日常管理工作，统筹部门招新与培训，主导学院大型活动的赞助洽谈与资源整合。',
      tags: ['领导力', '商务谈判', '团队管理'],
      result: '拉取赞助经费3万元，组织大型活动3场，部门成员从5人扩展至12人'
    },
    {
      id: 102,
      title: '班级团支部书记',
      category: '学生工作',
      time: '2023.09 - 2024.06',
      description: '负责班级团支部建设与思想引领工作，组织策划主题团日活动、青年大学习打卡，协助辅导员完成班级日常管理。',
      tags: ['组织协调', '思想引领', '公文写作'],
      result: '班级青年大学习完成率保持100%，获评校级"五四红旗团支部"'
    },
    {
      id: 103,
      title: '社团联合会副主席',
      category: '学生工作',
      time: '2024.03 - 2025.03',
      description: '协助管理全校20余个注册社团，负责社团年审、活动策划审批与资源协调，主导举办校园社团文化节。',
      tags: ['统筹管理', '活动策划', '跨部门协作'],
      result: '社团文化节覆盖师生3000+人次，社团满意度提升25%'
    },
    {
      id: 201,
      title: '贵州山区支教志愿服务',
      category: '志愿服务',
      time: '2025.04',
      description: '赴贵州山区小学开展为期7天的支教活动，负责三年级语文课程设计与教学，并拍摄制作宣传视频记录支教过程。',
      tags: ['教学实践', '宣传运营', '社会服务'],
      result: '服务学生120人，完成课程设计6份，制作宣传视频3条'
    },
    {
      id: 202,
      title: '社区疫情防控志愿者',
      category: '志愿服务',
      time: '2022.12 - 2023.02',
      description: '在社区担任疫情防控志愿者，协助核酸检测信息录入、物资分发与秩序维护，为独居老人提供上门配送服务。',
      tags: ['服务意识', '应急响应', '沟通协作'],
      result: '累计服务时长120小时，覆盖社区居民800余户'
    },
    {
      id: 301,
      title: '腾讯产品运营实习',
      category: '实习经历',
      time: '2025.01 - 2025.03',
      description: '在某事业群产品运营团队实习，负责用户增长活动策划、数据分析与内容运营，协助完成产品新功能上线推广。',
      tags: ['数据分析', '用户运营', '活动策划'],
      result: '策划活动参与人数提升40%，输出运营分析报告8份'
    },
    {
      id: 302,
      title: '字节跳动前端开发实习',
      category: '实习经历',
      time: '2025.06 - 2025.09',
      description: '参与抖音电商业务线前端开发，负责商品详情页性能优化与组件库建设，独立完成3个中后台系统的页面开发与联调。',
      tags: ['React', 'TypeScript', '前端工程化', '性能优化'],
      result: '页面首屏加载时间降低35%，沉淀5个可复用业务组件'
    },
    {
      id: 401,
      title: '校园二手交易平台',
      category: '项目实践',
      time: '2024.03 - 2024.08',
      description: '作为项目负责人，带领5人团队开发校园二手物品交易小程序，负责需求分析、产品设计与前端开发。',
      tags: ['产品开发', '团队协作', '前端技术'],
      result: '小程序上线3个月用户数突破2000人，完成交易订单500+笔'
    },
    {
      id: 402,
      title: '全国大学生数学建模竞赛',
      category: '项目实践',
      time: '2024.09',
      description: '作为团队队长，负责数学模型建立、Python编程实现与论文撰写，针对城市交通拥堵问题提出优化方案。',
      tags: ['数学建模', 'Python', '数据分析', '论文写作'],
      result: '获省级一等奖，论文被推荐参加全国评审'
    },
    {
      id: 403,
      title: '基于深度学习的医学影像分类系统',
      category: '项目实践',
      time: '2024.11 - 2025.04',
      description: '在导师指导下独立开展科研项目，基于ResNet网络实现肺部CT影像的自动分类，完成数据集标注、模型训练与前端可视化。',
      tags: ['深度学习', 'PyTorch', '计算机视觉', '科研实践'],
      result: '模型准确率达94.2%，项目入选校级大创优秀结题'
    },
    {
      id: 501,
      title: '国家奖学金',
      category: '获奖荣誉',
      time: '2024.10',
      description: '凭借优异的学业成绩与全面的综合素质，经学院评审、学校公示，荣获2023-2024学年国家奖学金。',
      tags: ['学业优异', '综合素质'],
      result: '综合测评排名专业第1名（1/156），学业成绩GPA 3.92/4.0'
    },
    {
      id: 502,
      title: '蓝桥杯全国软件设计大赛二等奖',
      category: '获奖荣誉',
      time: '2024.05',
      description: '参加第十五届蓝桥杯全国软件和信息技术专业人才大赛（软件开发组），独立完成算法设计与程序实现。',
      tags: ['算法竞赛', '编程能力', '逻辑思维'],
      result: '获省级一等奖并晋级国赛，最终获全国二等奖'
    },
  ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_EXPERIENCES));

  // 同时填充示例已生成记录，让"已生成材料"页面也有内容
  const DEMO_RECORDS = [
    {
      id: 9001,
      purpose: '求职简历',
      targetDetail: '前端开发岗',
      content: `【个人简介】
计算机科学与技术专业本科生，具备扎实的前端开发基础与两次大厂实习经历，擅长React生态与工程化实践。

【项目与实习经历】
1. 字节跳动前端开发实习（2025.06-2025.09）
   - 参与抖音电商业务线前端开发，负责商品详情页性能优化与组件库建设
   - 通过代码分割与懒加载策略，将页面首屏加载时间降低35%
   - 独立沉淀5个可复用业务组件，被团队纳入内部组件库推广使用

2. 校园二手交易平台（2024.03-2024.08）
   - 担任项目负责人，带领5人团队完成小程序从0到1的开发与上线
   - 负责前端架构设计、核心页面开发及与后端接口联调
   - 上线3个月用户数突破2000人，完成交易订单500+笔

【获奖荣誉】
- 蓝桥杯全国软件设计大赛二等奖
- 国家奖学金（综测专业第1名）`,
      createdAt: '2025-09-15T10:30:00.000Z',
    },
    {
      id: 9002,
      purpose: '国家奖学金',
      targetDetail: '',
      content: `【学业表现】
本人始终保持严谨的治学态度，学业成绩GPA达3.92/4.0，综合测评位列专业第1名（1/156），连续三年获得学业一等奖学金。

【科研与实践】
积极参与科研训练，在导师指导下独立完成"基于深度学习的医学影像分类系统"项目，模型准确率达94.2%，入选校级大创优秀结题项目。参加全国大学生数学建模竞赛，针对城市交通拥堵问题建立优化模型，获省级一等奖。

【学生工作与社会服务】
担任学生会外联部部长期间，成功拉取赞助经费3万元，组织大型校园活动3场，部门规模从5人扩展至12人。担任班级团支部书记，班级获评校级"五四红旗团支部"。积极参与志愿服务，累计服务时长120小时。`,
      createdAt: '2025-04-20T14:00:00.000Z',
    },
  ];

  localStorage.setItem(STORAGE_KEY_GENERATED, JSON.stringify(DEMO_RECORDS));
  localStorage.setItem('resume_os_generated_count', '2');
}

export function getGeneratedRecords() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_GENERATED)) || [];
  } catch {
    return [];
  }
}

export function saveGeneratedRecord(record) {
  const list = getGeneratedRecords();
  const newRecord = {
    ...record,
    id: record.id || Date.now(),
    createdAt: record.createdAt || new Date().toISOString(),
  };
  list.unshift(newRecord);
  localStorage.setItem(STORAGE_KEY_GENERATED, JSON.stringify(list.slice(0, 50)));
  return newRecord;
}

export function deleteGeneratedRecord(id) {
  const list = getGeneratedRecords().filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY_GENERATED, JSON.stringify(list));
}
