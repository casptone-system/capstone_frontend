# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dean-program.spec.ts >> Dean program creation and chair setup >> Dean can create a program via API and UI reflects it
- Location: tests\e2e\dean-program.spec.ts:10:9

# Error details

```
SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | import { loadCredentials, apiRequest } from './helpers/e2e-utils'
  3  | 
  4  | const creds = loadCredentials()
  5  | if (!creds) {
  6  |   test('missing creds', async () => { test.skip() })
  7  | } else {
  8  |   const dean = creds.find((c:any)=> c.role === 'dean')
  9  |   test.describe('Dean program creation and chair setup', () => {
  10 |     test('Dean can create a program via API and UI reflects it', async ({ page }) => {
  11 |       if (!dean) test.skip()
  12 |       // create program via API to avoid brittle modal selectors, then verify UI lists it
  13 |       const api = await apiRequest(dean.token)
  14 |       const collegesResp = await api.get('/api/colleges')
> 15 |       const colleges = await collegesResp.json()
     |                        ^ SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
  16 |       const collegeId = colleges?.data?.[0]?.id
  17 |       if (!collegeId) test.skip()
  18 | 
  19 |       const programName = `E2E BSIT ${Date.now()}`
  20 |       const code = `E2E-BSIT-${Math.floor(Math.random()*90000)+10000}`
  21 | 
  22 |       const createResp = await api.post('/api/programs', { json: { college_id: collegeId, name: programName, code } })
  23 |       expect([200,201]).toContain(createResp.status())
  24 | 
  25 |       // now verify in UI that the program is listed
  26 |       await page.addInitScript((t)=> localStorage.setItem('auth_token', t), dean.token)
  27 |       // Navigate to Programs via SPA navigation (click fallback then history push)
  28 |       await page.goto('/')
  29 |       await page.waitForLoadState('networkidle')
  30 |       const programNav = page.locator('a[href="/programs"], a[href="#/programs"], a:has-text("Programs")').first()
  31 |       if (await programNav.count()) {
  32 |         await programNav.click()
  33 |         await page.waitForTimeout(500)
  34 |       } else {
  35 |         await page.evaluate(() => { history.pushState({}, '', '/programs'); window.dispatchEvent(new Event('popstate')) })
  36 |       }
  37 |       const prog = page.locator(`text=${programName}`).first()
  38 |       await expect(prog).toBeVisible({ timeout: 10000 })
  39 |     })
  40 |   })
  41 | }
  42 | 
```