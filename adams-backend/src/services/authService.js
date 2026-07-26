const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Role, InvitationCode, Team, College, Department, Program } = require('../models');

exports.login = async (email, password) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error('Invalid credentials');
  if (user.status !== 'active') throw new Error('Account is not active');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error('Invalid credentials');

  const role = await Role.findByPk(user.roleId);
  const token = jwt.sign({
    id: user.id,
    role: role?.name || 'faculty',
    collegeId: user.collegeId,
    departmentId: user.departmentId,
    programId: user.programId,
    teamId: user.teamId
  }, process.env.JWT_SECRET || 'adams-dev-secret', { expiresIn: '8h' });

  await user.update({ lastLoginAt: new Date() });
  return { token, user: { id: user.id, email: user.email, status: user.status } };
};

exports.register = async (email, password) => {
  const existing = await User.findOne({ where: { email } });
  if (existing) throw new Error('User already exists');

  const hashed = await bcrypt.hash(password, 10);
  const role = await Role.findOne({ where: { name: 'faculty' } });
  const user = await User.create({
    email,
    passwordHash: hashed,
    roleId: role?.id || null
  });

  return { id: user.id, email: user.email };
};

exports.joinTeamWithCode = async (userId, code) => {
  const invitation = await InvitationCode.findOne({ where: { code } });
  if (!invitation) throw new Error('Invalid invitation code');
  if (new Date(invitation.expiresAt) < new Date()) throw new Error('Invitation code expired');
  if (invitation.usedCount >= invitation.maxUses) throw new Error('Invitation code already used');

  const user = await User.findByPk(userId);
  const team = await Team.findByPk(invitation.teamId);
  const role = await Role.findByPk(invitation.roleId);

  await user.update({
    teamId: team.id,
    roleId: role.id,
    programId: team.programId
  });

  await invitation.increment('usedCount');

  return { userId, teamId: team.id, role: role.name };
};

exports.recordLogout = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) return;
  await user.update({ lastLogoutAt: new Date() });
};
