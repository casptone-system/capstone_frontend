const http = require('http')
const fs = require('fs')
const path = require('path')

const PUBLIC_DIR = path.join(__dirname, '..', '..', 'public')
const CRED_FILE = path.join('C:', 'capstone', 'backend', 'backend-app', '.e2e-credentials.json')
let credentials = []
try { credentials = JSON.parse(fs.readFileSync(CRED_FILE, 'utf8')) } catch (e) { credentials = [] }

const programs = []
const colleges = [{ id: 1, name: 'College of Testing', code: 'CT', description: 'Test college' }]
let nextProgramId = 1

function findUserByToken(token) {
  if (!token) return null
  const t = token.replace(/^Bearer\s+/, '')
  return credentials.find(c => c.token === t) || null
}

function sendJson(res, status, obj) {
  const body = JSON.stringify({ success: true, data: obj })
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(body)
}

function sendErr(res, status, message) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ success: false, message }))
}

const handler = (req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`)
  const { method, url, headers } = req
  // API routes
  if (url.startsWith('/api/')) {
    if (url === '/api/me' && method === 'GET') {
      // Accept Authorization: Bearer <token> or raw token
      let authHeader = headers.authorization || headers.Authorization || headers['x-e2e-token'] || null

      // If no header, check query param ?token= and cookies
      if (!authHeader) {
        const m = url.match(/\?token=([^&]+)/)
        if (m) authHeader = m[1]
        else if (headers.cookie) {
          const c = headers.cookie.split(';').map(s=>s.trim())
          const found = c.find(s => s.startsWith('auth_token='))
          if (found) authHeader = found.split('=')[1]
        }
      }

      // Normalize Bearer prefix
      const token = authHeader ? String(authHeader).replace(/^Bearer\s+/, '') : null

      console.log('DEBUG /api/me auth header:', authHeader)

      let user = null
      if (token) user = findUserByToken(token)

      // As a last resort for tests, allow simple role query: /api/me?role=dean
      if (!user) {
        const roleMatch = url.match(/\?role=([^&]+)/)
        if (roleMatch) {
          user = credentials.find(c => c.role === roleMatch[1]) || null
        }
      }

      console.log('DEBUG /api/me token matched:', !!user, user ? `role=${user.role}` : '')

      if (!user) return sendErr(res, 401, 'Unauthenticated')

      return sendJson(res, 200, { user: { id: user.id, email: user.email, name: `${user.first_name} ${user.last_name}`, role: user.role } })
    }

    if (url === '/api/colleges' && method === 'GET') {
      return sendJson(res, 200, { data: colleges })
    }

    if (url === '/api/programs' && method === 'GET') {
      return sendJson(res, 200, programs)
    }

    if (url === '/api/programs' && method === 'POST') {
      // read body
      let body = ''
      req.on('data', chunk => body += chunk)
      req.on('end', () => {
        try {
          const data = JSON.parse(body)
          const program = { id: nextProgramId++, name: data.name || data.title || 'New Program', college_id: data.college_id || 1 }
          programs.push(program)
          return sendJson(res, 201, program)
        } catch (e) {
          return sendErr(res, 400, 'Invalid JSON')
        }
      })
      return
    }

    const progInvMatch = url.match(/^\/api\/programs\/(\d+)\/invitations$/)
    if (progInvMatch && method === 'POST') {
      let body = ''
      req.on('data', chunk => body += chunk)
      req.on('end', () => {
        try {
          const data = JSON.parse(body)
          const inv = { id: Date.now(), program_id: Number(progInvMatch[1]), email: data.email, role: data.role }
          return sendJson(res, 201, inv)
        } catch (e) {
          return sendErr(res, 400, 'Invalid JSON')
        }
      })
      return
    }

    // fallback
    return sendErr(res, 404, 'Not found')
  }

  // Serve static files from PUBLIC_DIR
  let filePath = url === '/' ? path.join(PUBLIC_DIR, 'index.html') : path.join(PUBLIC_DIR, url)
  // prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) filePath = path.join(PUBLIC_DIR, 'index.html')

  try {
    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        // fallback to index.html
        fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (err2, data) => {
          if (err2) {
            console.error('Error reading index.html', err2)
            res.writeHead(500)
            res.end('Server error')
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' })
            res.end(data)
          }
        })
        return
      }

      const ext = path.extname(filePath).toLowerCase()
      const contentType = ext === '.js' ? 'application/javascript' : ext === '.css' ? 'text/css' : ext === '.html' ? 'text/html' : 'application/octet-stream'
      fs.readFile(filePath, (err3, data) => {
        if (err3) {
          console.error('Error reading file', filePath, err3)
          res.writeHead(500)
          res.end('Server error')
          return
        }
        res.writeHead(200, { 'Content-Type': contentType })
        res.end(data)
      })
    })
  } catch (e) {
    console.error('Unhandled server error', e)
    res.writeHead(500)
    res.end('Server error')
  }
}

// Start servers on 8080 and 8000 so builds pointing to either port work
const PORT = process.env.MOCK_PORT || 8080
const PORT2 = process.env.MOCK_PORT2 || 8000

const server = http.createServer(handler)
server.listen(PORT, () => console.log(`Mock server listening on http://localhost:${PORT}`))

const server2 = http.createServer(handler)
server2.listen(PORT2, () => console.log(`Mock server also listening on http://localhost:${PORT2}`))

// Export for testing
module.exports = { server, server2 }
