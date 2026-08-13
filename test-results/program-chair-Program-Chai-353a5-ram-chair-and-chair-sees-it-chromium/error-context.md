# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: program-chair.spec.ts >> Program Chair assignment and visibility >> Dean can create a program assigned to existing program-chair and chair sees it
- Location: tests\e2e\program-chair.spec.ts:12:9

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
  9  |   const chair = creds.find((c:any)=> c.role === 'program-chair')
  10 | 
  11 |   test.describe('Program Chair assignment and visibility', () => {
  12 |     test('Dean can create a program assigned to existing program-chair and chair sees it', async ({ page }) => {
  13 |       if (!dean || !chair) test.skip()
  14 | 
  15 |       const api = await apiRequest(dean.token)
  16 |       // fetch first college
  17 |       const collegesResp = await api.get('/api/colleges')
> 18 |       const colleges = await collegesResp.json()
     |                        ^ SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
  19 |       const collegeId = colleges?.data?.[0]?.id
  20 |       if (!collegeId) test.skip()
  21 | 
  22 |       const programName = `E2E Assigned ${Date.now()}`
  23 |       const code = `E2E-${Math.floor(Math.random()*90000)+10000}`
  24 | 
  25 |       const createResp = await api.post('/api/programs', { json: {
  26 |         college_id: collegeId,
  27 |         name: programName,
  28 |         code,
  29 |         chair_id: chair.id,
  30 |       }}).catch(async (e)=> { return e.response ? e.response : e })
  31 | 
  32 |       const status = typeof createResp.status === 'function' ? createResp.status() : createResp.status
  33 |       expect(status === 201 || status === 200).toBeTruthy()
  34 | 
  35 |       // now check as chair (token-based) that dashboard lists the program
  36 |       await page.addInitScript((t)=> localStorage.setItem('auth_token', t), chair.token)
  37 |       // go to programs listing and ensure the assigned program appears
  38 |       await page.goto('/programs')
  39 |       await expect(page.locator('h1')).toBeVisible()
  40 |       const progLocator = page.locator(`text=${programName}`).first()
  41 |       await expect(progLocator).toBeVisible({ timeout: 10000 })
  42 |     })
  43 |   })
  44 | }
  45 | 
```