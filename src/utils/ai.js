import { getSettings } from '../data/storage.js';
import { mockPolish } from './mockPolish.js';

export async function callAI(prompt) {
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
      temperature: 0.7,
      max_tokens: 2000
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
    const prompt = `你是一名专业的大学生经历解析助手。请将以下经历文本解析为结构化数据。

要求：
1. title：提取经历的核心事件名称作为标题，简洁有力（10字以内），不要简单截取原文开头
2. category：根据经历性质从["学生工作","志愿服务","实习经历","项目实践","获奖荣誉"]中选择最匹配的一个
3. time：提取经历发生的时间，格式化为"YYYY.MM"（如"2024.09"），若跨时段用"2024.09 - 2025.06"
4. description：用1-2句话概括经历内容，保留核心职责和动作，语言简洁专业
5. tags：从经历中提炼3-5个最能体现个人能力的标签（如"数据分析","领导力","团队协作"等），要与经历内容高度匹配
6. result：提取所有量化成果（数字、百分比、排名等），用简短的一句话概括

只返回JSON，不要任何解释。

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

    const content = await callAI(prompt);
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
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
    const prompt = `请对以下大学生经历描述进行专业润色，使其表达更正式、更有说服力，适合用于奖学金申请、简历或自我介绍等材料。保持原意不变，只优化措辞和表达方式。

经历标题：${title || ''}
经历类型：${category || ''}
原始描述："""${description}"""

请直接返回润色后的文本，不要添加任何解释或额外内容。`;
    return await callAI(prompt);
  } catch {
    return mockPolish(description, title, category);
  }
}

function localParse(text) {
  // 简单的本地解析规则
  const title = text.slice(0, 20).replace(/[，。、]/g, '');
  const category = text.includes('支教') || text.includes('志愿') || text.includes('服务')
    ? '志愿服务'
    : text.includes('实习')
    ? '实习经历'
    : text.includes('学生会') || text.includes('部长') || text.includes('社团')
    ? '学生工作'
    : text.includes('项目') || text.includes('开发') || text.includes('小程序')
    ? '项目实践'
    : '获奖荣誉';

  const timeMatch = text.match(/(\d{4})\s*年\s*(\d{1,2})\s*月/);
  const time = timeMatch ? `${timeMatch[1]}.${timeMatch[2].padStart(2, '0')}` : '2025.01';

  const tags = [];
  if (text.includes('组织') || text.includes('策划')) tags.push('组织协调');
  if (text.includes('宣传') || text.includes('视频') || text.includes('拍摄')) tags.push('宣传运营');
  if (text.includes('教学') || text.includes('支教')) tags.push('教学实践');
  if (text.includes('数据') || text.includes('分析')) tags.push('数据分析');
  if (text.includes('领导') || text.includes('管理') || text.includes('部长')) tags.push('领导力');
  if (tags.length === 0) tags.push('综合能力');

  return {
    title: title || '未命名经历',
    category,
    time,
    description: text,
    tags,
    result: ''
  };
}
