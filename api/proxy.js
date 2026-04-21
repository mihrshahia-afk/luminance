// Vercel serverless function — proxies bahai.org requests to avoid CORS issues.
// Only allows fetching from bahai.org domains for security.

export default async function handler(req, res) {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  // Only allow bahai.org domains
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.endsWith('bahai.org')) {
      return res.status(403).json({ error: 'Only bahai.org URLs are allowed' });
    }
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Luminance-Bahai-Library/1.0',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Upstream returned ${response.status}` });
    }

    const text = await response.text();

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(text);
  } catch (err) {
    res.status(502).json({ error: 'Failed to fetch upstream', detail: err.message });
  }
}
