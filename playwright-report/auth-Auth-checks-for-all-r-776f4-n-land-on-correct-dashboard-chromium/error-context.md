# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Auth checks for all roles >> qa can land on correct dashboard
- Location: tests\e2e\auth.spec.ts:18:9

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | import fs from 'fs'
  3  | import path from 'path'
  4  | import { loadCredentials } from './helpers/e2e-utils'
  5  | 
  6  | const CRED_FILE = process.env.E2E_CREDENTIALS_FILE || path.join('C:', 'capstone', 'backend', 'backend-app', '.e2e-credentials.json')
  7  | 
  8  | test.describe('Auth checks for all roles', () => {
  9  |   const creds = loadCredentials()
  10 |   if (!creds) {
  11 |     test('credentials file missing', async () => {
  12 |       test.skip()
  13 |     })
  14 |     return
  15 |   }
  16 | 
  17 |   for (const c of creds) {
  18 |     test(`${c.role} can land on correct dashboard`, async ({ page }) => {
  19 |       // set token if present to skip login
  20 |       if (c.token) {
  21 |         await page.addInitScript((token) => { localStorage.setItem('auth_token', token) }, c.token)
  22 |       }
  23 | 
  24 |       await page.goto('/')
  25 |       await expect(page).toHaveTitle(/ADAMS|Accreditation/)
  26 | 
  27 |       // Basic dashboard presence checks: user may either land on a dashboard (h1)
  28 |       // or on the Join/Invitation view if they are not yet assigned to a team.
  29 |       const dashboardVisible = await page.locator('h1').count()
  30 |       const joinTokenVisible = await page.locator('input[placeholder*="invitation"], #invite-code, .invite-input').count()
  31 |       if (!dashboardVisible && !joinTokenVisible) {
  32 |         // give a short extra wait for SPA routing
  33 |         await page.waitForTimeout(500)
  34 |       }
  35 | 
  36 |       // Re-evaluate presence
  37 |       const dashboardNow = await page.locator('h1').count()
  38 |       const joinNow = await page.locator('input[placeholder*="invitation"], #invite-code, .invite-input').count()
> 39 |       expect(dashboardNow > 0 || joinNow > 0).toBeTruthy()
     |                                               ^ Error: expect(received).toBeTruthy()
  40 |       // Try several common selectors for the user's display name; fall back to header text
  41 |       let displayName: string | null = null
  42 |       const nameSelectors = ['.app-header .user-name', '.app-header .profile-name', '.app-header .user-display', '.profile-name', '.user-display', 'header .user-name']
  43 |       for (const sel of nameSelectors) {
  44 |         const el = page.locator(sel).first()
  45 |         if (await el.count()) {
  46 |           displayName = (await el.innerText()).trim() || null
  47 |           if (displayName) break
  48 |         }
  49 |       }
  50 |       if (!displayName) {
  51 |         const hdr = await page.locator('header, .app-header').first().innerText().catch(()=>null)
  52 |         displayName = hdr ? hdr.trim() : null
  53 |       }
  54 |       expect(!!displayName).toBeTruthy()
  55 |       const avatarCount = await page.locator('img[alt="Profile photo"], .app-header img, .profile-avatar').count()
  56 |       expect(avatarCount).toBeGreaterThanOrEqual(0)
  57 | 
  58 |       // navigation, visit another page and return
  59 |       const nav = page.locator('a.nav-link, nav a').first()
  60 |       if (await nav.count()) {
  61 |         await nav.click()
  62 |         await page.waitForTimeout(300)
  63 |         await page.goBack()
  64 |       }
  65 | 
  66 |       // reload should retain auth when token set
  67 |       await page.reload()
  68 |       await expect(page.locator('h1')).toBeVisible()
  69 |     })
  70 |   }
  71 | })
  72 | 
```