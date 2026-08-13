# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dean-program.spec.ts >> Dean program creation and chair setup >> Dean can create a program via API and UI reflects it
- Location: tests\e2e\dean-program.spec.ts:10:9

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=E2E BSIT 1786437490615').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('text=E2E BSIT 1786437490615').first()

```

```yaml
- heading "Error response" [level=1]
- paragraph: "Error code: 404"
- paragraph: "Message: File not found."
- paragraph: "Error code explanation: 404 - Nothing matches the given URI."
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
  15 |       const colleges = await collegesResp.json()
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
  27 |       // go directly to programs listing for stability
  28 |       await page.goto('/programs')
  29 |       const prog = page.locator(`text=${programName}`).first()
> 30 |       await expect(prog).toBeVisible({ timeout: 10000 })
     |                          ^ Error: expect(locator).toBeVisible() failed
  31 |     })
  32 |   })
  33 | }
  34 | 
```