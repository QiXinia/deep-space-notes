import { mkdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputDir = path.join(root, 'public', 'textures')
const solarSource = 'https://api.github.com/repos/Shrey1803/Solar-system/contents/textures'
const earthSource = 'https://api.github.com/repos/mrdoob/three.js/contents/examples/textures/planets'

const textures = [
  '2k_sun.jpg',
  '2k_mercury.jpg',
  '2k_venus_surface.jpg',
  '2k_earth_daymap.jpg',
  '2k_mars.jpg',
  '2k_jupiter.jpg',
  '2k_saturn.jpg',
  '2k_saturn_ring_alpha.jpg',
  '2k_uranus.jpg',
  '2k_neptune.jpg',
  '2k_stars_milky_way.jpg',
].map((file) => `${solarSource}/${file}?ref=main`)

const earthTextures = [
  'earth_clouds_1024.png',
  'earth_lights_2048.png',
  'earth_normal_2048.jpg',
  'moon_1024.jpg',
].map((file) => `${earthSource}/${file}?ref=dev`)

await mkdir(outputDir, { recursive: true })

for (const url of [...textures, ...earthTextures]) {
  const filename = new URL(url).pathname.split('/').at(-1)
  const destination = path.join(outputDir, filename)
  if (existsSync(destination)) continue

  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github.raw',
      'User-Agent': 'deep-space-notes-asset-script',
    },
  })
  if (!response.ok) throw new Error(`${filename}: download failed (${response.status})`)
  await writeFile(destination, Buffer.from(await response.arrayBuffer()))
  console.log(`Downloaded public/textures/${filename}`)
}
