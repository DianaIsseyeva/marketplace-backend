const express = require('express');
const User = require('../models/user-model');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const user = new User(req.body);
    const token = user.generateJWT();
    user.token = token;
    await user.save();
    return res.status(201).send({ user, token });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

router.post('/sessions', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).send({ error: 'Username not found' });
    }
    const isMatch = await user.checkPassword(password);
    if (!isMatch) {
      return res.status(400).send({ error: 'Password is wrong' });
    }
    const token = user.generateJWT();
    user.token = token;
    await user.save();
    return res.send({ message: 'Authenticated', user, token });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

router.delete('/sessions', async (req, res) => {
  const token = req.get('Authorization');
  const success = { message: 'Success' };
  if (!token) return res.status(200).send(success);

  const user = await User.findOne({ token });
  if (!user) return res.status(200).send(success);

  user.token = '';
  await user.save();
  return res.status(200).send(success);
});

module.exports = router;
