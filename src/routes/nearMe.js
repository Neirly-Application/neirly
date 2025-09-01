const express = require('express');
const router = express.Router();
const NodeGeocoder = require('node-geocoder');
const { authMiddleware } = require('../auth/authMiddleware');
const User = require('../models/User');

const geocoder = NodeGeocoder({ provider: 'openstreetmap' });

router.get('/near-me', authMiddleware, async (req, res) => {
  try {
    const user = req.user;

    if (!user.location?.coordinates || user.location.coordinates.length !== 2) {
      return res.status(400).json({ error: 'User location not set' });
    }

    const [lng, lat] = user.location.coordinates;

    if (lng === 0 && lat === 0) {
      return res.status(400).json({ error: 'Invalid user coordinates' });
    }

    const distance = 1000;
    const minDistance = 50;

    const nearby = await User.find({
      _id: { $nin: [user._id, ...user.friends] },
      location: {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $minDistance: minDistance,
          $maxDistance: distance
        }
      }
    }).select('-passwordHash');

    let road = '', city = '', postcode = '';
    try {
      const resAddress = await geocoder.reverse({ lat, lon: lng });
      if (resAddress && resAddress[0]) {
        const addr = resAddress[0];
        road = addr.streetName || '';
        city = addr.city || '';
        postcode = addr.zipcode || '';
      }
    } catch (geoErr) {
      console.warn('Geocoding failed:', geoErr.message);
    }

    res.json({ nearby, address: { road, city, postcode } });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/set-location', authMiddleware, async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    await User.findByIdAndUpdate(req.user._id, {
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      }
    });

    res.json({ message: 'Location updated successfully', coordinates: [lng, lat] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;