import { getSettings } from '../data/storage.js';
import { mockPolish } from './mockPolish.js';

export async function callAI(prompt, opts = {}) {
  const settings = getSettings();
  const useProxy = settings.useProxy;
  const apiKey = settings.apiKey;
  const baseURL = settings.baseURL || 'https://api.openai.com/v1';
  const model = settings.model || 'gpt-3.5-turbo';

  // 代理模式下不需要前端 Key，Worker 端会自己加
  // 非代理模式下必须有 Key
  if (!useProxy && !apiKey) {
    throw new Error('请先配置 API Key');
  }

  const headers = {
    'Content-Type': 'application/json',
  };

  // 非代理模式才发送前端 Key
  if (!useProxy && apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const res = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: '你是一名专业的大学生成长材料顾问，擅长将学生的经历转化为高质量的申请材料。' },
        { role: 'user', content: prompt }
      ],
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.maxTokens ?? 2000
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI接口错误: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

export async function parseExperience(text) {
  const settings = getSettings();
  const useProxy = settings.useProxy;
  const apiKey = settings.apiKey;

  if (!useProxy && !apiKey) {
    // 无API Key时，做简单的本地解析
    return localParse(text);
  }

  try {
    const prompt = `你是一名专业的大学生经历解析助手。请将以下经历文本解析为结构化JSON数据。

核心要求：
1. title（最重要）：提取核心事件名称（8-15字），必须是对事件本质的提炼，不能简单截取原文前几个字。
   - 坏例子："2024年3月到8月"（这是时间，不是事件）
   - 好例子："校园二手交易平台"（提炼了项目本质）
   - 坏例子："大三上学期我在学生会"（这是背景铺垫）
   - 好例子："学生会外联部部长"（提炼了职位本质）
   - 提取策略：寻找"做了什么"的核心名词，忽略时间、地点、背景铺垫。
2. category：从["学生工作","志愿服务","实习经历","项目实践","获奖荣誉"]中选择最匹配的一个。
3. time：格式化为"YYYY.MM"，跨时段用"YYYY.MM - YYYY.MM"。无明确时间则留空字符串"""。
4. description：用1-2句话概括核心职责与动作，语言简洁专业，不要复制原文。
5. tags：提炼3-5个精准能力标签。标签必须具体，避免"努力""认真"等空泛词。优先使用技能型标签（如"前端开发""数据分析""商务谈判"）。
6. result：提取所有量化成果（数字、百分比、排名），用一句话概括。无量化数据则总结定性成果。

示例1：
输入："2024年3月到8月，我带领5人团队做了一个校园二手小程序，负责前端开发和需求分析，用户数突破2000"
输出：{"title":"校园二手交易平台","category":"项目实践","time":"2024.03 - 2024.08","description":"作为项目负责人，带领5人团队开发校园二手物品交易小程序，负责需求分析、产品设计与前端开发。","tags":["产品开发","团队协作","前端技术"],"result":"小程序上线3个月用户数突破2000人"}

示例2：
输入："大三上学期我在学生会外联部当部长，拉了三万块钱赞助，组织了迎新晚会和篮球赛"
输出：{"title":"学生会外联部部长","category":"学生工作","time":"","description":"负责学生会外联部日常管理工作，统筹部门招新与培训，主导学院大型活动的赞助洽谈与资源整合。","tags":["领导力","商务谈判","组织协调"],"result":"拉取赞助经费3万元，组织大型活动2场"}

示例3：
输入："我在社区当志愿者帮忙做核酸检测，干了两个月，服务了八百多户"
输出：{"title":"社区疫情防控志愿服务","category":"志愿服务","time":"","description":"在社区担任疫情防控志愿者，协助核酸检测信息录入、物资分发与秩序维护，为居民提供上门配送服务。","tags":["服务意识","应急响应","沟通协作"],"result":"累计服务时长超120小时，覆盖社区居民800余户"}

请严格遵循以上格式，只返回JSON，不要markdown代码块，不要任何解释。

文本："""${text}"""

返回格式：
{
  "title": "...",
  "category": "...",
  "time": "...",
  "description": "...",
  "tags": ["...", "..."],
  "result": "..."
}`;

    const content = await callAI(prompt, { temperature: 0.2 });
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      // 字段校验与补全
      const fallback = localParse(text);
      return {
        title: parsed.title || fallback.title,
        category: parsed.category || fallback.category,
        time: parsed.time || fallback.time,
        description: parsed.description || fallback.description,
        tags: Array.isArray(parsed.tags) && parsed.tags.length > 0 ? parsed.tags : fallback.tags,
        result: parsed.result || fallback.result,
      };
    }
    return localParse(text);
  } catch {
    return localParse(text);
  }
}

export async function polishExperience(description, title, category) {
  const settings = getSettings();
  const useProxy = settings.useProxy;
  const apiKey = settings.apiKey;

  // 无 API Key 时 fallback 到本地规则
  if (!useProxy && !apiKey) {
    return mockPolish(description, title, category);
  }

  try {
    const prompt = `你是一名专业的申请材料润色专家。请对以下大学生经历描述进行润色，要求如下：

【核心原则】
1. 保持原意完全不变，不能添加原文中没有的信息或成果。
2. 措辞升级为申请/简历级别的正式表达，将口语化、平淡化的动词替换为更专业的表达。
3. 绝对禁止添加固定的模板化前缀（如"凭借扎实实力""作为核心成员""立足业务实际"等套话）。
4. 绝对禁止输出千篇一律的句式，要根据原文内容灵活改写。
5. 如果原文已经有具体的成果数字，保留并突出；如果没有，不要编造数字。
6. 输出只需润色后的纯文本，不要加任何解释、前缀或markdown格式。

【润色示例】
原文：我在学生会外联部当部长，拉了三万块钱赞助，组织了迎新晚会和篮球赛
润色后：统筹学生会外联部日常运作，主导学院大型活动的赞助洽谈与资源整合，成功拉取赞助经费3万元，策划并执行迎新晚会、篮球赛等校级活动。

原文：做了一个校园二手小程序，负责前端，用户数突破2000
润色后：作为项目负责人带领团队完成校园二手交易小程序从0到1的开发，独立承担前端架构设计与核心页面实现，产品上线3个月内用户数突破2000人。

原文：在社区做志愿者帮忙做核酸检测
润色后：在社区疫情防控工作中承担核酸检测信息录入、物资分发与秩序维护等任务，为独居老人提供上门配送服务。

经历标题：${title || ''}
经历类型：${category || ''}
原始描述："""${description}"""

请直接返回润色后的文本：`;
    return await callAI(prompt);
  } catch {
    return mockPolish(description, title, category);
  }
}

function localParse(text) {
  // 改进的本地解析：尝试从语义结构中提取标题，而非简单截取
  let title = '';

  // 规则1: 提取"担任/作为/任"后的职位名称
  const roleMatch = text.match(/(?:担任|作为|任)\s*([^，。、,\n]{2,15})/);
  if (roleMatch) title = roleMatch[1].trim();

  // 规则2: 提取"获/荣获/获得"后的奖项/荣誉
  if (!title) {
    const awardMatch = text.match(/(?:获|荣获|获得)\s*([^，。、,\n]{2,20})/);
    if (awardMatch) title = awardMatch[1].trim();
  }

  // 规则3: 提取包含"实习"的核心短语
  if (!title) {
    const internMatch = text.match(/([^，。、,\n]{0,10}实习[^，。、,\n]{0,10})/);
    if (internMatch) title = internMatch[1].trim();
  }

  // 规则4: 提取包含"项目/系统/平台/小程序"的项目名称
  if (!title) {
    const projectMatch = text.match(/([^，。、,\n]{0,15}(?:项目|系统|平台|小程序|网站|APP)[^，。、,\n]{0,10})/);
    if (projectMatch) title = projectMatch[1].trim();
  }

  // 规则5: 清理开头的时间/地点状语后取首个语义单元
  if (!title) {
    const cleaned = text
      .replace(/^(?:在|于|于)?(?:\d{4}[年\.\-]\d{1,2}[月]?[份]?|大[一二三四]|[上下]学期|在校期间|大学期间|本人|我)[，、,.\s]*/, '')
      .trim();
    // 取到第一个标点或18个字为止
    const firstUnit = cleaned.match(/^([^，。、,\n]{2,18})/);
    if (firstUnit) title = firstUnit[1].trim();
  }

  if (!title) title = '未命名经历';
  if (title.length > 20) title = title.slice(0, 18);

  const category = text.includes('支教') || text.includes('志愿') || text.includes('服务')
    ? '志愿服务'
    : text.includes('实习')
    ? '实习经历'
    : text.includes('学生会') || text.includes('部长') || text.includes('社团') || text.includes('班级') || text.includes('干部')
    ? '学生工作'
    : text.includes('项目') || text.includes('开发') || text.includes('小程序') || text.includes('系统') || text.includes('竞赛')
    ? '项目实践'
    : text.includes('奖') || text.includes('荣誉') || text.includes('学金')
    ? '获奖荣誉'
    : '项目实践';

  const timeMatch = text.match(/(\d{4})\s*[年\.\-]\s*(\d{1,2})\s*月?/);
  const time = timeMatch ? `${timeMatch[1]}.${timeMatch[2].padStart(2, '0')}` : '';

  const tags = [];
  if (text.includes('组织') || text.includes('策划') || text.includes('统筹')) tags.push('组织协调');
  if (text.includes('宣传') || text.includes('视频') || text.includes('拍摄')) tags.push('宣传运营');
  if (text.includes('教学') || text.includes('支教') || text.includes('讲授')) tags.push('教学实践');
  if (text.includes('数据') || text.includes('分析')) tags.push('数据分析');
  if (text.includes('领导') || text.includes('管理') || text.includes('部长') || text.includes('主席')) tags.push('领导力');
  if (text.includes('代码') || text.includes('开发') || text.includes('前端') || text.includes('编程')) tags.push('技术开发');
  if (text.includes('论文') || text.includes('科研') || text.includes('研究')) tags.push('科研能力');
  if (tags.length === 0) tags.push('综合能力');

  return {
    title,
    category,
    time,
    description: text,
    tags,
    result: ''
  };
}
