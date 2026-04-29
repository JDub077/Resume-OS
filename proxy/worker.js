/**
 * Cloudflare Worker 代理脚本
 * 部署步骤：
 * 1. 登录 https://dash.cloudflare.com，进入 Workers & Pages
 * 2. 创建 Service Worker，粘贴此脚本
 * 3. 设置环境变量：KIMI_API_KEY = sk-xxx
 * 4. 保存并部署，得到 Worker 地址（如 https://resume-proxy.xxx.workers.dev）
 * 5. 把 Worker 地址填到前端 Base URL 中即可
 */

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '*';

    // CORS 预检
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const url = new URL(request.url);

    // 健康检查
    if (url.pathname === '/health') {
      const rawKey = env.KIMI_API_KEY || '';
      // 去除所有空白字符（空格、换行、制表符等）
      const cleanedKey = rawKey.replace(/\s/g, '');
      return new Response(JSON.stringify({
        status: 'ok',
        keyConfigured: !!cleanedKey,
        rawLength: rawKey.length,
        cleanedLength: cleanedKey.length,
        firstChars: cleanedKey.slice(0, 12),
        targetBase: env.TARGET_BASE_URL || 'https://api.moonshot.cn/v1',
        hint: cleanedKey ? 'Key 已配置' : '请在 Variables 中添加 KIMI_API_KEY（Secret 类型），填入 SiliconFlow / Groq 等厂商的 Key，然后点击 Deploy',
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin,
        },
      });
    }

    const targetPath = url.pathname + url.search;
    // 使用 SiliconFlow（硅基流动）API，国内稳定、OpenAI 兼容、新用户免费送额度
    const targetBase = env.TARGET_BASE_URL || 'https://api.siliconflow.cn/v1';
    const targetUrl = targetBase + targetPath;

    let body;
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    // 读取 Key 并去除所有空白字符
    const apiKey = (env.KIMI_API_KEY || '').replace(/\s/g, '');
    if (!apiKey) {
      return new Response(JSON.stringify({
        error: 'Proxy API Key not configured',
        hint: '请在 Cloudflare Worker Settings → Variables 中添加 KIMI_API_KEY（Secret 类型），填入 SiliconFlow / Groq 等厂商的 Key，然后点击 Deploy',
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin,
        },
      });
    }

    // 转发请求到真实 AI 接口
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    // 构造响应
    const newHeaders = new Headers(response.headers);
    newHeaders.set('Access-Control-Allow-Origin', origin);
    newHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  },
};
