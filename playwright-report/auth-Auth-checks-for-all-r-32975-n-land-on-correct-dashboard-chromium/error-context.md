# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Auth checks for all roles >> vpaa can land on correct dashboard
- Location: tests\e2e\auth.spec.ts:18:9

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
```

# Page snapshot

```yaml
- main [ref=e8]:
  - main [ref=e13]:
    - main [ref=e18]:
      - generic [ref=e19]:
        - complementary [ref=e20]:
          - generic [ref=e21]:
            - generic [ref=e22]: A
            - generic [ref=e23]: ADAMS
          - navigation [ref=e24]:
            - paragraph [ref=e25]: Overview
            - link "Dashboard" [ref=e26] [cursor=pointer]:
              - /url: "#"
            - link "Accreditation Readiness" [ref=e34] [cursor=pointer]:
              - /url: "#"
            - link "Institutional Reports" [ref=e42] [cursor=pointer]:
              - /url: "#"
            - paragraph [ref=e50]: Monitoring
            - link "College Progress" [ref=e51] [cursor=pointer]:
              - /url: "#"
            - link "Compliance Reports" [ref=e59] [cursor=pointer]:
              - /url: "#"
            - link "Document Completion 0" [ref=e65] [cursor=pointer]:
              - /url: "#"
              - text: Document Completion
              - generic [ref=e71]: "0"
            - paragraph [ref=e72]: Coordination
            - link "Deans & QA Office" [ref=e73] [cursor=pointer]:
              - /url: "#"
            - link "Notifications 0" [ref=e79] [cursor=pointer]:
              - /url: "#"
              - text: Notifications
              - generic [ref=e84]: "0"
          - button "Logout" [ref=e86] [cursor=pointer]
          - generic [ref=e89]:
            - generic [ref=e90]: EV
            - generic [ref=e91]:
              - paragraph [ref=e92]: E2E Vpaa
              - paragraph [ref=e93]: VPAA / Director of Instruction
        - main [ref=e94]:
          - generic [ref=e95]:
            - generic [ref=e96]:
              - paragraph [ref=e97]: Office of the VPAA
              - heading "VPAA Dashboard" [level=1] [ref=e98]
            - generic [ref=e99]:
              - button "0" [ref=e100] [cursor=pointer]
              - button "Generate Institutional Report" [ref=e106] [cursor=pointer]
              - button "Readiness Dashboard" [ref=e114] [cursor=pointer]
          - generic [ref=e119]:
            - generic [ref=e129]:
              - paragraph [ref=e130]: "0"
              - paragraph [ref=e131]: Colleges Monitored
            - generic [ref=e141]:
              - paragraph [ref=e142]: "0"
              - paragraph [ref=e143]: Programs Tracked
            - generic [ref=e150]:
              - paragraph [ref=e151]: 0%
              - paragraph [ref=e152]: Avg. Compliance
            - generic [ref=e160]:
              - paragraph [ref=e161]: 0%
              - paragraph [ref=e162]: Documents Complete
            - generic [ref=e171]:
              - paragraph [ref=e172]: "0"
              - paragraph [ref=e173]: Critical Alerts
            - generic [ref=e183]:
              - paragraph [ref=e184]: "0"
              - paragraph [ref=e185]: Review Status
          - generic [ref=e186]:
            - generic [ref=e187]:
              - generic [ref=e189]:
                - generic [ref=e197]:
                  - heading "Accreditation Progress by College" [level=2] [ref=e198]
                  - paragraph [ref=e199]: Institution-wide compliance across all colleges
                - button "Full Report →" [ref=e200] [cursor=pointer]
              - generic [ref=e201]:
                - generic [ref=e202]:
                  - generic [ref=e210]:
                    - heading "Final Review Queue" [level=2] [ref=e211]
                    - paragraph [ref=e212]: Forwarded by QA — your endorsement marks accreditation ready
                  - button "All Documents →" [ref=e213] [cursor=pointer]
                - generic [ref=e215]:
                  - generic [ref=e216]: Document
                  - generic [ref=e217]: College
                  - generic [ref=e218]: QA Officer
                  - generic [ref=e219]: Submitted
                  - generic [ref=e220]: Action
            - generic [ref=e221]:
              - generic [ref=e223]:
                - generic [ref=e232]:
                  - heading "Major Compliance Issues" [level=2] [ref=e233]
                  - paragraph [ref=e234]: Escalated from QA, Deans, and Program Chairs
                - generic [ref=e235]: 0 Items
              - generic [ref=e236]:
                - generic [ref=e247]:
                  - heading "Review Pipeline" [level=2] [ref=e248]
                  - paragraph [ref=e249]: VPAA is the final stage — endorsement sets Accreditation Ready
                - generic [ref=e250]:
                  - generic [ref=e258]:
                    - paragraph [ref=e259]: Faculty Upload
                    - paragraph [ref=e260]: Evidence submitted by faculty
                  - generic [ref=e268]:
                    - paragraph [ref=e269]: Area In-Charge Review
                    - paragraph [ref=e270]: Documents reviewed per area
                  - generic [ref=e278]:
                    - paragraph [ref=e279]: Faculty Upload
                    - paragraph [ref=e280]: Evidence submitted by faculty
                  - generic [ref=e288]:
                    - paragraph [ref=e289]: Area In-Charge Review
                    - paragraph [ref=e290]: Reviewed per area
                  - generic [ref=e298]:
                    - paragraph [ref=e299]: Program Chair Review
                    - paragraph [ref=e300]: Approved and forwarded
                  - generic [ref=e308]:
                    - paragraph [ref=e309]: Dean Monitoring
                    - paragraph [ref=e310]: Dean monitors progress only
                  - generic [ref=e318]:
                    - paragraph [ref=e319]: QA Monitoring
                    - paragraph [ref=e320]: QA monitors compliance
                  - generic [ref=e321]:
                    - generic [ref=e322]: "8"
                    - generic [ref=e324]:
                      - paragraph [ref=e325]: VPAA Monitoring
                      - paragraph [ref=e326]: Your stage — monitor institutional readiness
              - generic [ref=e327]:
                - generic [ref=e338]:
                  - heading "Institutional Reports" [level=2] [ref=e339]
                  - paragraph [ref=e340]: For accreditation decision-making
                - generic [ref=e341]:
                  - generic [ref=e342]:
                    - generic [ref=e349]:
                      - paragraph [ref=e350]: Institutional Compliance Report
                      - paragraph [ref=e351]: Updated Live
                    - button "View" [ref=e353] [cursor=pointer]
                  - generic [ref=e354]:
                    - generic [ref=e361]:
                      - paragraph [ref=e362]: Accreditation Readiness Summary
                      - paragraph [ref=e363]: Updated Live
                    - button "View" [ref=e365] [cursor=pointer]
                  - generic [ref=e366]:
                    - generic [ref=e373]:
                      - paragraph [ref=e374]: Cross-College Audit Trail
                      - paragraph [ref=e375]: Updated Live
                    - button "View" [ref=e377] [cursor=pointer]
                  - generic [ref=e378]:
                    - generic [ref=e385]:
                      - paragraph [ref=e386]: Faculty Participation Report
                      - paragraph [ref=e387]: Updated Live
                    - button "View" [ref=e389] [cursor=pointer]
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