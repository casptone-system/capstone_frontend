module.exports = {
  secret: process.env.JWT_SECRET || 'adams-dev-secret',
  expiresIn: '8h'
};
