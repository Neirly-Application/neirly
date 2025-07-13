const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../authMiddleware/authMiddleware');
const User = require('../models/User');

router.use(authMiddleware);

// GET - Ottieni impostazioni privacy
router.get('/', async (req, res) => {
    try {
        const user = req.user;
        res.json({
            visibility: user.privacy?.visibility || 'friends',
        });
    } catch (err) {
        console.error('error get privacy:', err);
        res.status(500).json({ message: 'Internal Error' });
    }
});

// PUT - Aggiorna le impostazioni privacy
router.put('/', async (req, res) => {
    try {
        const { visibility } = req.body;
        const allowedValues = ['friends', 'everyone', 'private'];

        if (!allowedValues.includes(visibility)) {
            return res.status(400).json({ message: 'Values not valid' })
        }

        const user = req.user;
        user.privacy = {
            ...(user.privacy || {}),
            visibility
        };

        await user.save();
        res.json({ message: 'Privacy Updated', visibility });
    } catch (err) {
        console.error('Privacy updating error:', err);
        res.status(500).json({ message: 'Internal error' });
    }
});

module.exports = router;
