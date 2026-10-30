import fs from 'node:fs/promises'
import path from 'node:path'

const dist = path.resolve('dist')
const html = await fs.readFile(path.join(dist, 'index.html'), 'utf8')

for (const lang of ['zh', 'en']) {
  const dir = path.join(dist, lang)
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(path.join(dir, 'index.html'), html)
}

console.log('postbuild: created /zh and /en entry documents')
