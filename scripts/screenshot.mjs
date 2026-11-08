import fs from 'node:fs/promises'

const [, , url, output, rawWidth = '390', rawHeight = '1600', rawPort = '9223'] = process.argv
const width = Number(rawWidth)
const height = Number(rawHeight)
const port = Number(rawPort)

if (!url || !output) {
  throw new Error('Usage: node scripts/screenshot.mjs <url> <output> [width] [height] [port]')
}

const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then((response) => response.json())
const target = targets.find((item) => item.type === 'page')
if (!target?.webSocketDebuggerUrl) throw new Error('No compatible Edge page target found')

const socket = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true })
  socket.addEventListener('error', reject, { once: true })
})

let nextId = 1
const pending = new Map()
socket.addEventListener('message', (event) => {
  const payload = JSON.parse(String(event.data))
  if (!payload.id) return
  const request = pending.get(payload.id)
  if (!request) return
  pending.delete(payload.id)
  if (payload.error) request.reject(new Error(payload.error.message))
  else request.resolve(payload.result)
})

const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = nextId++
    pending.set(id, { resolve, reject })
    socket.send(JSON.stringify({ id, method, params }))
  })

await send('Page.enable')
await send('Emulation.setDeviceMetricsOverride', {
  width,
  height,
  deviceScaleFactor: 1,
  mobile: width < 600,
  screenWidth: width,
  screenHeight: height,
})
await send('Emulation.setTouchEmulationEnabled', {
  enabled: width < 600,
  maxTouchPoints: width < 600 ? 5 : 1,
})
await send('Page.navigate', { url })
await new Promise((resolve) => setTimeout(resolve, 28_000))
const result = await send('Page.captureScreenshot', {
  format: 'png',
  fromSurface: true,
  captureBeyondViewport: false,
})
await fs.writeFile(output, Buffer.from(result.data, 'base64'))
socket.close()
console.log(output)
