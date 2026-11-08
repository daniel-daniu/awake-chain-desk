import fs from 'node:fs/promises'
import path from 'node:path'

const dist = path.resolve('dist')
const html = await fs.readFile(path.join(dist, 'index.html'), 'utf8')

const routes = [
  '',
  'chains',
  'products',
  'products/flex-staking',
  'products/locked-360',
  'products/locked-600',
  'products/anubis-lp',
  'products/polygon-lp',
  'products/bonds',
  'products/reserve',
  'products/helix',
  'ecosystem',
  'learn',
  'portfolio',
  'news',
  'about',
]

for (const lang of ['zh', 'en']) {
  for (const route of routes) {
    const dir = path.join(dist, lang, route)
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(path.join(dir, 'index.html'), html)
  }
}

console.log(`Created ${routes.length * 2} localized route documents.`)
