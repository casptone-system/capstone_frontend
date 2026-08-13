import { test, expect } from '@playwright/test'
import { loadCredentials, apiRequest } from './helpers/e2e-utils'

const creds = loadCredentials()
if (!creds) {
  test('missing creds', async () => { test.skip() })
} else {
  const dean = creds.find((c:any)=> c.role === 'dean')
  test.describe('Dean program creation and chair setup', () => {
    test('Dean can create a program via API and UI reflects it', async ({ page }) => {
      if (!dean) test.skip()
      // create program via API to avoid brittle modal selectors, then verify UI lists it
      const api = await apiRequest(dean.token)
      const collegesResp = await api.get('/api/colleges')
      const colleges = await collegesResp.json()
      const collegeId = colleges?.data?.[0]?.id
      if (!collegeId) test.skip()

      const programName = `E2E BSIT ${Date.now()}`
      const code = `E2E-BSIT-${Math.floor(Math.random()*90000)+10000}`

      const createResp = await api.post('/api/programs', { json: { college_id: collegeId, name: programName, code } })
      expect([200,201]).toContain(createResp.status())

      // now verify in UI that the program is listed
      await page.addInitScript((t)=> localStorage.setItem('auth_token', t), dean.token)
      // Navigate to Programs via SPA navigation (click fallback then history push)
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      const programNav = page.locator('a[href="/programs"], a[href="#/programs"], a:has-text("Programs")').first()
      if (await programNav.count()) {
        await programNav.click()
        await page.waitForTimeout(500)
      } else {
        await page.evaluate(() => { history.pushState({}, '', '/programs'); window.dispatchEvent(new Event('popstate')) })
      }
      const prog = page.locator(`text=${programName}`).first()
      await expect(prog).toBeVisible({ timeout: 10000 })
    })
  })
}
