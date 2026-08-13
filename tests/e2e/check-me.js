const fetch = globalThis.fetch || require('node-fetch')
const token = '23|FBOZtBCWZcOoKBYF8LAOCDrRctLvyNeCGwGYbOwJ394bf101'
;(async ()=>{
  try{
    const res = await fetch('http://localhost:8000/api/me', { headers: { Authorization: `Bearer ${token}` } })
    const txt = await res.text()
    console.log('status', res.status)
    console.log('body', txt)
  }catch(e){console.error(e)}
})()
