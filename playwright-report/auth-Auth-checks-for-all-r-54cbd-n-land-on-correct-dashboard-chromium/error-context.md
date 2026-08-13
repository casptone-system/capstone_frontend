# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Auth checks for all roles >> superadmin can land on correct dashboard
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
          - img "ADAMS Logo" [ref=e22]
          - navigation [ref=e23]:
            - paragraph [ref=e24]: Main
            - link "Dashboard" [ref=e25] [cursor=pointer]:
              - /url: "#"
            - link "User Management" [ref=e33] [cursor=pointer]:
              - /url: "#"
            - link "Audit Logs" [ref=e41] [cursor=pointer]:
              - /url: "#"
            - paragraph [ref=e47]: System
            - link "Database" [ref=e48] [cursor=pointer]:
              - /url: "#"
            - link "Email Config" [ref=e55] [cursor=pointer]:
              - /url: "#"
            - link "Security" [ref=e61] [cursor=pointer]:
              - /url: "#"
            - link "Storage" [ref=e67] [cursor=pointer]:
              - /url: "#"
            - paragraph [ref=e72]: Reports
            - link "Analytics" [ref=e73] [cursor=pointer]:
              - /url: "#"
            - link "System Reports" [ref=e81] [cursor=pointer]:
              - /url: "#"
          - button "Logout" [ref=e88] [cursor=pointer]
          - generic [ref=e91]:
            - generic [ref=e92]: ES
            - generic [ref=e93]:
              - paragraph [ref=e94]: E2E Superadmin
              - paragraph [ref=e95]: Super Administrator
        - main [ref=e96]:
          - generic [ref=e97]:
            - generic [ref=e98]:
              - paragraph [ref=e99]: Dashboard
              - heading "Super Administrator" [level=1] [ref=e100]
            - generic [ref=e101]:
              - button "3" [ref=e102] [cursor=pointer]
              - button "New User" [ref=e108] [cursor=pointer]
              - button "Settings" [ref=e113] [cursor=pointer]
          - generic [ref=e118]:
            - generic [ref=e128]:
              - paragraph [ref=e129]: "0"
              - paragraph [ref=e130]: Total Users
            - generic [ref=e138]:
              - paragraph [ref=e139]: "0"
              - paragraph [ref=e140]: Active Users
            - generic [ref=e148]:
              - paragraph [ref=e149]: "0"
              - paragraph [ref=e150]: Pending Accounts
            - generic [ref=e158]:
              - paragraph [ref=e159]: Stable
              - paragraph [ref=e160]: System Health
            - generic [ref=e167]:
              - paragraph [ref=e168]: 0%
              - paragraph [ref=e169]: Storage Used
            - generic [ref=e179]:
              - paragraph [ref=e180]: "0"
              - paragraph [ref=e181]: Pending Reviews
          - generic [ref=e182]:
            - generic [ref=e183]:
              - generic [ref=e184]:
                - generic [ref=e185]:
                  - generic [ref=e195]:
                    - heading "User Management" [level=2] [ref=e196]
                    - paragraph [ref=e197]: Create, edit, and govern all user accounts
                  - button "Create User →" [ref=e198] [cursor=pointer]
                - generic [ref=e199]:
                  - button "Create User" [ref=e200] [cursor=pointer]
                  - button "Edit User" [ref=e201] [cursor=pointer]
                  - button "Delete User" [ref=e202] [cursor=pointer]
                  - button "Restore User" [ref=e203] [cursor=pointer]
                  - button "Reset Password" [ref=e204] [cursor=pointer]
                  - button "Lock / Unlock" [ref=e205] [cursor=pointer]
                  - button "Activate / Deactivate" [ref=e206] [cursor=pointer]
                  - button "Assign Role" [ref=e207] [cursor=pointer]
                  - button "Manage Permissions" [ref=e208] [cursor=pointer]
                - generic [ref=e210]:
                  - generic [ref=e211]: User
                  - generic [ref=e212]: Role
                  - generic [ref=e213]: Status
                  - generic [ref=e214]: Last Active
                  - generic [ref=e215]: Action
              - generic [ref=e217]:
                - generic [ref=e225]:
                  - heading "Audit Trail" [level=2] [ref=e226]
                  - paragraph [ref=e227]: Every action recorded in real time
                - button "Full Log →" [ref=e228] [cursor=pointer]
            - generic [ref=e229]:
              - generic [ref=e230]:
                - generic [ref=e240]:
                  - heading "System Management" [level=2] [ref=e241]
                  - paragraph [ref=e242]: Infrastructure, storage, and config
                - generic [ref=e243]:
                  - generic [ref=e244]:
                    - paragraph [ref=e251]: Database Backup
                    - generic [ref=e252]: Ready
                  - generic [ref=e253]:
                    - paragraph [ref=e259]: Email Config
                    - generic [ref=e260]: Configured
                  - generic [ref=e261]:
                    - paragraph [ref=e267]: Security
                    - generic [ref=e268]: Enforced
                  - generic [ref=e269]:
                    - paragraph [ref=e274]: Storage
                    - generic [ref=e275]: 0% Used
                  - generic [ref=e276]:
                    - paragraph [ref=e281]: Notifications
                    - generic [ref=e282]: Active
                  - generic [ref=e283]:
                    - paragraph [ref=e289]: System Reports
                    - generic [ref=e290]: Available
              - generic [ref=e291]:
                - generic [ref=e302]:
                  - heading "Compliance Snapshot" [level=2] [ref=e303]
                  - paragraph [ref=e304]: System-wide accreditation health
                - generic [ref=e305]:
                  - generic [ref=e307]:
                    - paragraph [ref=e308]: Overall Accreditation
                    - paragraph [ref=e309]: 80%
                  - generic [ref=e313]:
                    - paragraph [ref=e314]: Document Submission
                    - paragraph [ref=e315]: 85%
                  - generic [ref=e319]:
                    - paragraph [ref=e320]: Faculty Participation
                    - paragraph [ref=e321]: 91%
                  - generic [ref=e325]:
                    - paragraph [ref=e326]: Pending QA Review
                    - paragraph [ref=e327]: 43%
                  - generic [ref=e331]:
                    - paragraph [ref=e332]: Overdue Requirements
                    - paragraph [ref=e333]: 12%
              - generic [ref=e336]:
                - generic [ref=e345]:
                  - heading "Super Admin Workflow" [level=2] [ref=e346]
                  - paragraph [ref=e347]: Manage users, permissions, audit logs, and system operations
                - generic [ref=e348]:
                  - generic [ref=e349]:
                    - generic [ref=e350]: Manage Users
                    - list [ref=e351]:
                      - listitem [ref=e352]: Create User
                      - listitem [ref=e353]: View Users
                      - listitem [ref=e354]: Edit Users
                      - listitem [ref=e355]: Delete Users
                      - listitem [ref=e356]: Restore Users
                      - listitem [ref=e357]: Reset Password
                      - listitem [ref=e358]: Lock / Unlock Account
                      - listitem [ref=e359]: Activate / Deactivate Account
                      - listitem [ref=e360]: Assign Roles
                      - listitem [ref=e361]: Manage Permissions
                  - generic [ref=e362]:
                    - generic [ref=e363]: View User Activity Logs
                    - list [ref=e364]:
                      - listitem [ref=e365]: Login History
                      - listitem [ref=e366]: Logout History
                      - listitem [ref=e367]: Uploaded Files
                      - listitem [ref=e368]: Edited Documents
                      - listitem [ref=e369]: Deleted Documents
                      - listitem [ref=e370]: Generated Reports
                      - listitem [ref=e371]: IP Address
                      - listitem [ref=e372]: Browser
                      - listitem [ref=e373]: Device
                      - listitem [ref=e374]: Session Duration
                      - listitem [ref=e375]: Audit Trail
                  - generic [ref=e376]:
                    - generic [ref=e377]: System Management
                    - list [ref=e378]:
                      - listitem [ref=e379]: Database Backup
                      - listitem [ref=e380]: Restore Database
                      - listitem [ref=e381]: Email Configuration
                      - listitem [ref=e382]: Notification Settings
                      - listitem [ref=e383]: Storage Management
                      - listitem [ref=e384]: Security Settings
                      - listitem [ref=e385]: System Reports
              - generic [ref=e386]:
                - generic [ref=e396]:
                  - heading "Pending Alerts" [level=2] [ref=e397]
                  - paragraph [ref=e398]: Items requiring immediate action
                - generic [ref=e399]:
                  - paragraph [ref=e407]: Review user accounts and permissions for updates
                  - paragraph [ref=e413]: Storage usage is being monitored
                  - paragraph [ref=e420]: Inactive accounts can be reactivated from the admin tools
                  - paragraph [ref=e428]: Backup and report operations are available from the system tools
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