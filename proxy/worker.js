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

    // 健康检查：访问 /health 可验证 Key 是否配置成功
    if (url.pathname === '/health') {
      const keyExists = !!env.KIMI_API_KEY;
      return new Response(JSON.stringify({
        status: 'ok',
        keyConfigured: keyExists,
        keyLength: env.KIMI_API_KEY?.length || 0,
        hint: keyExists ? 'Key 已配置' : '请在 Variables 中添加 KIMI_API_KEY 并 Deploy',
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin,
        },
      });
    }

    const targetPath = url.pathname + url.search;

    // 目标 API（默认 Kimi，可改为任意 OpenAI 兼容接口）
    const targetBase = env.TARGET_BASE_URL || 'https://api.moonshot.cn';
    const targetUrl = targetBase + targetPath;

    // 读取请求体
    let body;
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    // 环境变量中的 API Key（服务端持有，前端不可见）
    const apiKey = env.KIMI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({
        error: 'Proxy API Key not configured',
        hint: '请在 Cloudflare Worker Settings → Variables 中添加 KIMI_API_KEY（Secret 类型），然后点击 Deploy',
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

    // 构造响应（保留流式输出能力）
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
