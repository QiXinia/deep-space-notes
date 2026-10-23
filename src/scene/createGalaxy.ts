import * as THREE from 'three'

const pointVertex = /* glsl */ `
  attribute float aScale;
  attribute vec3 aColor;
  varying vec3 vColor;
  uniform float uPixelRatio;
  void main() {
    vColor = aColor;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = clamp(aScale * uPixelRatio * (760.0 / -mvPosition.z), 0.65, 6.0);
  }
`

const pointFragment = /* glsl */ `
  varying vec3 vColor;
  uniform float uOpacity;
  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    if (d > 0.5) discard;
    float halo = smoothstep(0.5, 0.06, d);
    float core = smoothstep(0.15, 0.0, d);
    gl_FragColor = vec4(vColor + core * 0.55, halo * uOpacity);
  }
`

function seededRandom(seed = 918273) {
  return () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
}

function makePointMaterial(pixelRatio: number, opacity = 1) {
  return new THREE.ShaderMaterial({
    vertexShader: pointVertex,
    fragmentShader: pointFragment,
    uniforms: { uPixelRatio: { value: pixelRatio }, uOpacity: { value: opacity } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
}

const cloudVertex = /* glsl */ `
  attribute float aScale;
  attribute vec3 aColor;
  varying vec3 vColor;
  uniform float uPixelRatio;
  void main() {
    vColor = aColor;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = clamp(aScale * uPixelRatio * (520.0 / -mvPosition.z), 4.0, 130.0);
  }
`

const cloudFragment = /* glsl */ `
  varying vec3 vColor;
  uniform float uOpacity;
  void main() {
    float d = distance(gl_PointCoord, vec2(0.5)) * 2.0;
    float alpha = pow(max(0.0, 1.0 - d), 2.4) * 0.055 * uOpacity;
    gl_FragColor = vec4(vColor, alpha);
  }
`

function glowTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 128
  const context = canvas.getContext('2d')!
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64)
  gradient.addColorStop(0, 'rgba(255,235,198,0.85)')
  gradient.addColorStop(0.16, 'rgba(255,205,150,0.34)')
  gradient.addColorStop(0.48, 'rgba(155,175,220,0.08)')
  gradient.addColorStop(1, 'rgba(80,100,160,0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(canvas)
}

export interface GalaxyWorld {
  group: THREE.Group
  galaxyMaterial: THREE.ShaderMaterial
  cloudMaterial: THREE.ShaderMaterial
  coreMaterial: THREE.SpriteMaterial
  starMaterial: THREE.ShaderMaterial
  update: (time: number) => void
}

export function createGalaxy(isMobile: boolean, pixelRatio: number): GalaxyWorld {
  const group = new THREE.Group()
  const random = seededRandom()
  const count = isMobile ? 32000 : 68000
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const scales = new Float32Array(count)
  const core = new THREE.Color('#ffd6a0')
  const middle = new THREE.Color('#d8e5ff')
  const outer = new THREE.Color('#5885c7')
  const color = new THREE.Color()
  const arms = 4

  for (let i = 0; i < count; i++) {
    const bulge = random() < 0.24
    const radius = bulge ? Math.pow(random(), 2.2) * 62 : Math.pow(random(), 0.64) * 410
    const branch = ((i % arms) / arms) * Math.PI * 2
    const spin = radius * 0.017
    const spread = bulge ? 22 : 3 + radius * 0.045
    const noiseX = (random() + random() + random() - 1.5) * spread
    const noiseZ = (random() + random() + random() - 1.5) * spread
    const noiseY = (random() + random() + random() - 1.5) * (bulge ? 24 : 2.5 + radius * 0.008)
    const angle = branch + spin + (random() - 0.5) * 0.16
    positions[i * 3] = Math.cos(angle) * radius + noiseX
    positions[i * 3 + 1] = noiseY
    positions[i * 3 + 2] = Math.sin(angle) * radius + noiseZ

    if (radius < 85) color.copy(core).lerp(middle, radius / 85)
    else color.copy(middle).lerp(outer, Math.min((radius - 85) / 325, 1))
    color.multiplyScalar(0.32 + random() * 0.68)
    colors.set([color.r, color.g, color.b], i * 3)
    scales[i] = 0.4 + Math.pow(random(), 4) * 2.5
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))
  const galaxyMaterial = makePointMaterial(pixelRatio, 0.95)
  const galaxy = new THREE.Points(geometry, galaxyMaterial)
  galaxy.rotation.y = -0.32
  group.add(galaxy)

  const cloudCount = isMobile ? 360 : 850
  const cloudPositions = new Float32Array(cloudCount * 3)
  const cloudColors = new Float32Array(cloudCount * 3)
  const cloudScales = new Float32Array(cloudCount)
  for (let i = 0; i < cloudCount; i++) {
    const radius = 24 + Math.pow(random(), 0.72) * 380
    const branch = ((i % arms) / arms) * Math.PI * 2
    const angle = branch + radius * 0.017 + (random() - 0.5) * 0.1
    const spread = 5 + radius * 0.025
    cloudPositions[i * 3] = Math.cos(angle) * radius + (random() - 0.5) * spread
    cloudPositions[i * 3 + 1] = (random() - 0.5) * 5
    cloudPositions[i * 3 + 2] = Math.sin(angle) * radius + (random() - 0.5) * spread
    color.copy(core).lerp(outer, Math.min(radius / 350, 1)).multiplyScalar(0.35 + random() * 0.35)
    cloudColors.set([color.r, color.g, color.b], i * 3)
    cloudScales[i] = 24 + random() * 58
  }
  const cloudGeometry = new THREE.BufferGeometry()
  cloudGeometry.setAttribute('position', new THREE.BufferAttribute(cloudPositions, 3))
  cloudGeometry.setAttribute('aColor', new THREE.BufferAttribute(cloudColors, 3))
  cloudGeometry.setAttribute('aScale', new THREE.BufferAttribute(cloudScales, 1))
  const cloudMaterial = new THREE.ShaderMaterial({
    vertexShader: cloudVertex,
    fragmentShader: cloudFragment,
    uniforms: { uPixelRatio: { value: pixelRatio }, uOpacity: { value: 1 } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  const clouds = new THREE.Points(cloudGeometry, cloudMaterial)
  clouds.rotation.y = -0.32
  group.add(clouds)

  const coreMaterial = new THREE.SpriteMaterial({
    map: glowTexture(),
    transparent: true,
    opacity: 0.24,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  const coreGlow = new THREE.Sprite(coreMaterial)
  coreGlow.scale.set(230, 230, 1)
  group.add(coreGlow)

  const starCount = isMobile ? 2200 : 4200
  const starPositions = new Float32Array(starCount * 3)
  const starColors = new Float32Array(starCount * 3)
  const starScales = new Float32Array(starCount)
  for (let i = 0; i < starCount; i++) {
    const theta = random() * Math.PI * 2
    const phi = Math.acos(2 * random() - 1)
    const radius = 900 + random() * 650
    starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    starPositions[i * 3 + 1] = radius * Math.cos(phi)
    starPositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)
    color.set(random() > 0.9 ? '#ffd9b0' : random() > 0.78 ? '#a9c8ff' : '#eef4ff')
    color.multiplyScalar(0.45 + random() * 0.8)
    starColors.set([color.r, color.g, color.b], i * 3)
    starScales[i] = 0.8 + Math.pow(random(), 5) * 5
  }
  const starGeometry = new THREE.BufferGeometry()
  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
  starGeometry.setAttribute('aColor', new THREE.BufferAttribute(starColors, 3))
  starGeometry.setAttribute('aScale', new THREE.BufferAttribute(starScales, 1))
  const starMaterial = makePointMaterial(pixelRatio, 0.85)
  const stars = new THREE.Points(starGeometry, starMaterial)
  group.add(stars)

  return {
    group,
    galaxyMaterial,
    cloudMaterial,
    coreMaterial,
    starMaterial,
    update(time) {
      galaxy.rotation.y = -0.32 + time * 0.003
      clouds.rotation.y = -0.32 + time * 0.003
      stars.rotation.y = time * 0.0008
    },
  }
}
