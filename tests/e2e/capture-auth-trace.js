const fs = require('fs')
const path = require('path')
const { chromium } = require('playwright')

const CRED_FILE = process.env.E2E_CREDENTIALS_FILE || path.join('C:', 'capstone', 'backend', 'backend-app', '.e2e-credentials.json')
const BASE = process.env.E2E_BASE_URL || 'http://localhost:8080'

async function run() {
  const creds = JSON.parse(fs.readFileSync(CRED_FILE, 'utf8'))
  const results = []

  for (const c of creds) {
    const browser = await chromium.launch()
    const context = await browser.newContext()
    const page = await context.newPage()

    const record = {
      testName: `auth-${c.role}`,
      role: c.role,
      tokenSetBeforeNavigation: !!c.token,
      authorizationHeaderPresent: false,
      apiMeUrl: null,
      apiMeStatus: null,
      apiMeResponseRole: null,
      restoreSessionRequested: false,
      authStoreAuthenticated: false,
      routeBefore: null,
      routeAfter: null,
      finalUrl: null,
      notes: [],
    }

    // Capture requests/responses to /api/me
    page.on('request', req => {
      try {
        const url = req.url()
        if (url.includes('/api/me')) {
          record.apiMeUrl = url
          const hdr = req.headers()
          const authHeaderValue = hdr.authorization || hdr.Authorization || null
          record.authorizationHeaderPresent = !!authHeaderValue
          // Check whether the incoming token matches any known E2E credential token (do NOT log token)
          if (authHeaderValue) {
            const t = String(authHeaderValue).replace(/^Bearer\s+/i, '')
            record.authorizationHeaderMatchesKnown = creds.some(cc => cc.token === t)
          } else {
            record.authorizationHeaderMatchesKnown = false
          }

          record.restoreSessionRequested = true // inference: /api/me triggered
        }
      } catch (e) { }
    })

    page.on('response', async res => {
      try {
        const url = res.url()
        if (url.includes('/api/me')) {
          record.apiMeStatus = res.status()
          // parse minimal JSON to extract role/user id safely
          const ct = res.headers()['content-type'] || ''
          if (ct.includes('application/json')) {
            const txt = await res.text()
            try {
              const body = JSON.parse(txt)
              // body may be { success:true, data: { user: { role: 'dean', id: 5 } } }
              const user = body?.data?.user || body?.user || null
              if (user) {
                record.apiMeResponseRole = user.role || user.role_slug || null
              }
            } catch (e) {
              record.notes.push('api/me returned non-JSON body')
            }
          }
        }
      } catch (e) { }
    })

    // set token in localStorage/sessionStorage before navigation
    if (c.token) {
      await page.addInitScript(token => {
        try {
          localStorage.setItem('auth_token', token)
          sessionStorage.setItem('auth_token', token)
        } catch (e) { }
      }, c.token)
    }

    // Record route before navigation (none)
    record.routeBefore = 'N/A (root)'

    // Navigate
    await page.goto(BASE + '/')

    // Wait a bit for SPA bootstrap
    await page.waitForTimeout(800)

    // Check for dashboard existence
    const dashboardTexts = ['VPAA Dashboard', 'Dean Dashboard', 'Super Administrator', 'Dashboard', 'Welcome to ADAMS']
    let dashboardNow = 0
    for (const t of dashboardTexts) {
      const cnt = await page.locator(`text=${t}`).count()
      dashboardNow += cnt
    }

    const joinNow = await page.locator('input[placeholder*="invitation"], #invite-code, .invite-input').count()

    record.authStoreAuthenticated = dashboardNow > 0

    // Evaluate final URL and route
    record.finalUrl = page.url()

    // routeAfter inference
    record.routeAfter = record.finalUrl.replace(BASE, '') || '/'

    // If dashboard present, record displayName presence
    if (dashboardNow > 0) {
      record.notes.push('Dashboard text found')
    } else if (joinNow > 0) {
      record.notes.push('Join/invitation view present')
    } else {
      record.notes.push('Neither dashboard nor join view found')
    }

    results.push(record)

    await context.close()
    await browser.close()
  }

  const out = path.join(__dirname, 'auth-trace-results.json')
  fs.writeFileSync(out, JSON.stringify(results, null, 2))
  console.log('Wrote', out)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
