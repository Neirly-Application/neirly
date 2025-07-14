  const express = require('express');
  const UAParser = require('ua-parser-js');
  const router = express.Router();
  const { authMiddleware } = require('../authMiddleware/authMiddleware');
  const getLocationFromIP = require('../utils/getLocationFromIP');

  // GET /api/devices
  router.get('/', authMiddleware, (req, res) => {
    return res.json(req.user.devices || []);
  });

  // POST /api/devices
  router.post('/devices', authMiddleware, async (req, res) => {
    try {
      const userAgent = req.headers['user-agent'] || 'Unknown';
      const parser = new UAParser(userAgent);
      const result = parser.getResult();

      const deviceName = `${result.os.name || 'Unknown OS'} · ${result.browser.name || 'Unknown Browser'}`;
      const deviceType = result.device.type || 'desktop';
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
      const location = await getLocationFromIP(ip) || 'Unknown';

      const newDevice = {
        name: deviceName,
        type: deviceType,
        location,
        lastActive: new Date()
      };

      req.user.devices = req.user.devices || [];

      const existingDevice = req.user.devices.find(
        d => d.name === newDevice.name && d.location === newDevice.location
      );

      if (existingDevice) {
        existingDevice.lastActive = new Date();
      } else {
        req.user.devices.push(newDevice);
      }

      await req.user.save();
      res.json({ success: true });
    } catch (err) {
      console.error('Error saving device:', err.message);
      res.status(500).json({ success: false, message: 'Failed to save device' });
    }
  });

  // PATCH /api/devices/ping
  router.patch('/ping', authMiddleware, async (req, res) => {
    try {
      const userAgent = req.headers['user-agent'] || 'Unknown';
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
      const location = await getLocationFromIP(ip) || 'Unknown';

      const device = (req.user.devices || []).find(
        d => d.name === userAgent && d.location === location
      );

      if (device) {
        device.lastActive = new Date();
        await req.user.save();
      }

      res.json({ success: true });
    } catch (err) {
      console.error('Device ping error:', err.message);
      res.status(500).json({ success: false });
    }
  });

  // DELETE /api/devices/:index
  router.delete('/:index', authMiddleware, async (req, res) => {
    const index = parseInt(req.params.index, 10);
    if (
      isNaN(index) ||
      index < 0 ||
      index >= (req.user.devices || []).length
    ) {
      return res.status(400).json({ message: 'Invalid device index' });
    }

    req.user.devices.splice(index, 1);
    await req.user.save();
    res.json({ success: true });
  });

  module.exports = router;
