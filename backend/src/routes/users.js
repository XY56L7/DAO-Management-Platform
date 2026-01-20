const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// Get user profile
router.get('/:address', async (req, res) => {
  try {
    let user = await User.findOne({ address: req.params.address.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/:address', [
  body('username').optional().isString().trim(),
  body('bio').optional().isString().isLength({ max: 500 }),
  body('avatar').optional().isURL()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updates = {};
    if (req.body.username) updates.username = req.body.username;
    if (req.body.bio) updates.bio = req.body.bio;
    if (req.body.avatar) updates.avatar = req.body.avatar;

    const user = await User.findOneAndUpdate(
      { address: req.params.address.toLowerCase() },
      { $set: updates },
      { new: true, upsert: true }
    );

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user delegation info
router.get('/:address/delegation', async (req, res) => {
  try {
    const user = await User.findOne({ address: req.params.address.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      delegatedTo: user.delegatedTo,
      delegatedFrom: user.delegatedFrom
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
