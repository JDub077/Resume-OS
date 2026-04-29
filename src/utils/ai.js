import { getSettings } from '../data/storage.js';

export async function callAI(prompt) {
  const settings = getSettings();
  const apiKey = settings.apiKey;
  const baseURL = settings.baseURL || 'https://api.openai.com/v1';
  const model = settings.model || 'gpt-3.5-turbo';

  if (!apiKey) {
    throw new Error('请先配置 API Key');
  }

  const res = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
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
  const apiKey = settings.apiKey;

  if (!apiKey) {
    // 无API Key时，做简单的本地解析
    return localParse(text);
  }

  try {
    const prompt = `请将以下大学生经历文本解析为结构化JSON，只返回JSON，不要其他内容：

文本："""${text}"""

要求返回格式：
{
  "title": "经历标题",
  "category": "从[学生工作/志愿服务/实习经历/项目实践/获奖荣誉]中选择一个最匹配的",
  "time": "时间，如2025.04",
  "description": "详细描述",
  "tags": ["能力标签1", "能力标签2"],
  "result": "成果数据"
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
