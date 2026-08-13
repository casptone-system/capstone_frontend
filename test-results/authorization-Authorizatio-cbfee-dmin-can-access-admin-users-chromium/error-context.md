# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authorization.spec.ts >> Authorization direct URL checks >> SuperAdmin can access admin users
- Location: tests\e2e\authorization.spec.ts:21:9

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('h1')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('h1')

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | import { loadCredentials } from './helpers/e2e-utils'
  3  | 
  4  | const creds = loadCredentials()
  5  | if (!creds) {
  6  |   test('missing creds', async () => { test.skip() })
  7  | } else {
  8  |   const faculty = creds.find((c:any)=> c.role === 'faculty')
  9  |   const superadmin = creds.find((c:any)=> c.role === 'superadmin')
  10 | 
  11 |   test.describe('Authorization direct URL checks', () => {
  12 |     test('Faculty cannot access SuperAdmin pages', async ({ page }) => {
  13 |       if (!faculty) test.skip()
  14 |       await page.addInitScript((t)=> localStorage.setItem('auth_token', t), faculty.token)
  15 |       await page.goto('/admin/users')
  16 |       // Expect either redirect or an authorization message; ensure we do not see the full admin users table header
  17 |       const hdrCount = await page.locator('h1, .admin-header, .users-table').count()
  18 |       expect(hdrCount).toBeLessThan(5)
  19 |     })
  20 | 
  21 |     test('SuperAdmin can access admin users', async ({ page }) => {
  22 |       if (!superadmin) test.skip()
  23 |       await page.addInitScript((t)=> localStorage.setItem('auth_token', t), superadmin.token)
  24 |       await page.goto('/admin/users')
> 25 |       await expect(page.locator('h1')).toBeVisible()
     |                                        ^ Error: expect(locator).toBeVisible() failed
  26 |     })
  27 |   })
  28 | }
  29 | 
```