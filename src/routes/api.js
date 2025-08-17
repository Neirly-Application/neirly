const express  = require('express');
const router   = express.Router();
const crypto   = require('crypto');
const bcrypt   = require('bcryptjs');
const ApiKey   = require('../models/ApiKey');
const { authMiddleware } = require('../auth/authMiddleware');

router.use(authMiddleware);

function generateApiKey() {
  const randomHex = crypto.randomBytes(24)      // 48 hex → 24 byte
                         .toString('hex')       // es. "a04d2745d66625f0…"
                         .toUpperCase()
                         .slice(0, 32);         // = 32 char

  return `neirly_live_${randomHex}`;            // es. neirly_live_A04D2745D66625F048693E749F9F04BB
}

/* POST /api/developer/generate-key */
router.post('/generate-key', async (req,res)=>{
  const { description='' } = req.body;
  if (description.trim().length < 10)
      return res.status(400).json({ message:'Description min 10 chars' });

  const exists = await ApiKey.findOne({ owner:req.user._id, status:'active' });
  if (exists)  return res.status(403).json({ message:'Active key already exists' });

  const key  = generateApiKey();
  const hash = await bcrypt.hash(key,12);

  await ApiKey.create({
    key,
    hashedKey: hash,
    description: description.trim(),
    owner: req.user._id,
    permissions:['read:profile']
  });

  res.status(201).json({ key });
});

/* GET /api/developer/current-key */
router.get('/current-key', async (req,res)=>{
  const doc=await ApiKey.findOne({ owner:req.user._id, status:'active' });
  if(!doc) return res.status(404).json({ message:'No active API key' });
  res.json({
    key:         doc.key,
    description: doc.description,
    createdAt:   doc.createdAt,
    status:      doc.status,
    lastUsed:    doc.lastUsedAt
  });
});

/* POST /api/developer/revoke-key */
router.post('/revoke-key', async (req,res)=>{
  const doc=await ApiKey.findOne({ owner:req.user._id, status:'active' });
  if(!doc) return res.status(400).json({ message:'No active key to revoke' });
  doc.status='revoked'; await doc.save();
  res.json({ message:'API key revoked' });
});

module.exports = router;
