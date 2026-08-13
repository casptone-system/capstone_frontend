import { test, expect } from '@playwright/test'
import { loadCredentials, apiRequest } from './helpers/e2e-utils'

const creds = loadCredentials()
if (!creds) {
  test('missing creds', async () => { test.skip() })
} else {
  const dean = creds.find((c:any)=> c.role === 'dean')
  const chair = creds.find((c:any)=> c.role === 'program-chair')

  test.describe('Program Chair assignment and visibility', () => {
    test('Dean can create a program assigned to existing program-chair and chair sees it', async ({ page }) => {
      if (!dean || !chair) test.skip()

      const api = await apiRequest(dean.token)
      // fetch first college
      const collegesResp = await api.get('/api/colleges')
      const colleges = await collegesResp.json()
      const collegeId = colleges?.data?.[0]?.id
      if (!collegeId) test.skip()

      const programName = `E2E Assigned ${Date.now()}`
      const code = `E2E-${Math.floor(Math.random()*90000)+10000}`

      const createResp = await api.post('/api/programs', { json: {
        college_id: collegeId,
        name: programName,
        code,
        chair_id: chair.id,
      }}).catch(async (e)=> { return e.response ? e.response : e })

      const status = typeof createResp.status === 'function' ? createResp.status() : createResp.status
      expect(status === 201 || status === 200).toBeTruthy()

      // now check as chair (token-based) that dashboard lists the program
      await page.addInitScript((t)=> localStorage.setItem('auth_token', t), chair.token)
      // go to programs listing and ensure the assigned program appears
      await page.goto('/programs')
      await expect(page.locator('h1')).toBeVisible()
      const progLocator = page.locator(`text=${programName}`).first()
      await expect(progLocator).toBeVisible({ timeout: 10000 })
    })
  })
}
