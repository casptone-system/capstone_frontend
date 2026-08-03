const test = require('node:test')
const assert = require('node:assert/strict')
const { validateEmail, validatePasswordStrength, validateRequired } = require('../src/lib/validation')

test('validateEmail rejects malformed addresses', () => {
  assert.equal(validateEmail('user@example.com'), '')
  assert.match(validateEmail('user@'), /valid email/i)
  assert.match(validateEmail(''), /required/i)
})

test('validatePasswordStrength enforces complexity', () => {
  assert.equal(validatePasswordStrength('SecurePass1'), '')
  assert.match(validatePasswordStrength('short'), /at least 8/i)
  assert.match(validatePasswordStrength('secret123'), /uppercase/i)
})

test('validateRequired catches empty input', () => {
  assert.equal(validateRequired('  Jane  '), '')
  assert.match(validateRequired('   '), /required/i)
})
