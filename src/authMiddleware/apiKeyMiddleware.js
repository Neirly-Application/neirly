const ApiKey  = require('../models/ApiKey');
const bcrypt  = require('bcryptjs');

const BUCKET  = new Map();          // key → [timestamps]
const WINDOW  = 60 * 1000;          // 1 min
const MAX     = 60;                 // 60 req/min

function log(owner, req, note) {
  const t = new Date().toISOString();
  console.log(`[API‑KEY] ${t} ${req.method} ${req.originalUrl} ‑ ${note} (${owner || 'unknown'})`);
}

module.exports = async function apiKeyMiddleware(req, res, next) {
  try {
    const raw = req.headers.authorization;
    if (!raw?.startsWith('Bearer ')) {
      log(null, req, 'no‑header');
      return res.status(401).json({ message: 'Missing or invalid API key' });
    }
    const key = raw.split(' ')[1];

    /* lookup tramite hash */
    const docs = await ApiKey.find({ revoked: false });
    let doc = null;
    for (const d of docs) {
      if (await bcrypt.compare(key, d.hashedKey)) { doc = d; break; }
    }
    if (!doc)            { log(null, req, 'not‑found'); return res.status(401).json({ message: 'Invalid API key' }); }
    if (doc.expiresAt && Date.now() > doc.expiresAt) {
      log(doc.owner, req, 'expired'); return res.status(403).json({ message: 'API key expired' });
    }

    /* rate‑limit in‑memory */
    const now = Date.now();
    const arr = BUCKET.get(key) || [];
    const recent = arr.filter(ts => now - ts < WINDOW);
    if (recent.length >= MAX) {
      log(doc.owner, req, 'rate‑limit'); return res.status(429).json({ message: 'Rate limit exceeded' });
    }
    recent.push(now); BUCKET.set(key, recent);

    /* log uso */
    doc.lastUsedAt = new Date();
    doc.usageLog.push({ ip: req.ip, userAgent: req.headers['user-agent'] || 'n/a' });
    doc.save().catch(()=>{});

    req.apiKey = { id: doc._id, owner: doc.owner, perms: doc.permissions };
    log(doc.owner, req, 'ok');
    next();
  } catch (e) {
    console.error('[API‑KEY MW]', e); res.status(500).json({ message: 'API key middleware error' });
  }
};
