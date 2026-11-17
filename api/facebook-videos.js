// Serverless function (Vercel): returns the school's latest Facebook page videos as JSON.
//
// The Facebook access token stays on the server (environment variables) and is never sent to visitors.
// Facebook is contacted at most about once every 15 minutes, because responses are cached by the host.
//
// Required environment variables (see FACEBOOK-SETUP.md):
//   FB_PAGE_ID     the numeric ID of the school's Facebook page
//   FB_PAGE_TOKEN  a long-lived Page access token
// Optional:
//   FB_GRAPH_VERSION  defaults to v26.0

const GRAPH_VERSION = process.env.FB_GRAPH_VERSION || 'v26.0';
const FB_HOSTS = ['https://www.facebook.com/', 'https://facebook.com/', 'https://fb.watch/'];

function firstLine(text) {
  return String(text || '').split('\n').map((s) => s.trim()).find(Boolean) || '';
}
function shorten(text, max) {
  const s = String(text || '').replace(/\s+/g, ' ').trim();
  return s.length > max ? s.slice(0, max - 1).trimEnd() + '…' : s;
}
function absoluteUrl(link) {
  if (!link) return '';
  const full = link.startsWith('/') ? 'https://www.facebook.com' + link : link;
  return FB_HOSTS.some((h) => full.startsWith(h)) ? full : '';
}

export function shapeVideos(data) {
  return (data && Array.isArray(data.data) ? data.data : [])
    .map((v) => ({
      id: String(v.id),
      title: shorten(v.title || firstLine(v.description), 90),
      url: absoluteUrl(v.permalink_url),
      thumbnail: typeof v.picture === 'string' && v.picture.startsWith('https://') ? v.picture : '',
      date: v.created_time || '',
      length: Number(v.length) || 0,
    }))
    .filter((v) => v.url);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  const pageId = process.env.FB_PAGE_ID;
  const token = process.env.FB_PAGE_TOKEN;
  if (!pageId || !token) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(503).json({ error: 'not_configured' });
  }

  const url = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(pageId)}/videos`);
  url.search = new URLSearchParams({
    fields: 'id,title,description,permalink_url,picture,created_time,length',
    limit: '12',
    access_token: token,
  }).toString();

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const data = await response.json();
    if (!response.ok || data.error) {
      const e = data && data.error ? data.error : {};
      // Log the reason (never the token) so it shows in the hosting logs, e.g. code 190 = token expired.
      console.error('Facebook API error', { status: response.status, code: e.code, type: e.type, message: e.message });
      res.setHeader('Cache-Control', 'no-store');
      return res.status(502).json({ error: 'facebook_error', code: e.code || null });
    }
    res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=3600');
    return res.status(200).json({ videos: shapeVideos(data) });
  } catch (err) {
    console.error('Facebook API unreachable', err && err.name);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ error: 'unreachable' });
  }
}
