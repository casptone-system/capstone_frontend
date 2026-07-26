const authService = require('../services/authService');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { token, user } = await authService.login(email, password);
    res.json({ token, user });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

exports.register = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await authService.register(email, password);
    res.status(201).json({ user, message: 'Verification email sent' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.joinTeam = async (req, res) => {
  const { code } = req.body;
  try {
    const assignment = await authService.joinTeamWithCode(req.user.id, code);
    res.json({ assignment, message: 'Joined team successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.logout = async (req, res) => {
  await authService.recordLogout(req.user.id);
  res.json({ message: 'Logged out' });
};
