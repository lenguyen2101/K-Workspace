// Vercel Serverless Function — proxy tới Gemini API.
// Đọc GEMINI_API_KEY từ env vars Vercel; client không bao giờ thấy key.
// Endpoint: POST /api/generate { prompt: string, imageBase64?: string }

const MODELS = [
  'gemini-3-pro-image-preview',
  'gemini-3-pro-preview-image',
  'gemini-3-flash-image-preview',
  'gemini-2.5-flash-image-preview',
  'gemini-2.5-flash-image',
];

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(200).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed (POST only)' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error: 'GEMINI_API_KEY chưa được set trên server. Add env var trong Vercel dashboard.',
    });
    return;
  }

  const { prompt, imageBase64 } = req.body || {};
  if (!prompt || typeof prompt !== 'string') {
    res.status(400).json({ error: 'Missing prompt (string)' });
    return;
  }

  // Thử lần lượt các model — return ngay khi cái đầu tiên thành công.
  for (const model of MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const parts = [];
    if (imageBase64 && typeof imageBase64 === 'string') {
      parts.push({ inlineData: { mimeType: 'image/png', data: imageBase64 } });
    }
    parts.push({ text: prompt });

    let response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
        }),
      });
    } catch (err) {
      console.error(`[${model}] fetch error:`, err.message);
      continue;
    }

    if (response.status === 404) continue;

    let data;
    try { data = await response.json(); }
    catch { data = { error: 'invalid JSON from Gemini' }; }

    if (!response.ok) {
      res.status(response.status).json({
        error: data?.error?.message || data?.error || `HTTP ${response.status}`,
        model,
        status: response.status,
      });
      return;
    }

    res.status(200).json({ data, model });
    return;
  }

  res.status(404).json({
    error: 'Tất cả Gemini image models đều 404. API key có thể chưa được enable cho image gen.',
    triedModels: MODELS,
  });
}
