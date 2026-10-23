import * as THREE from 'three'

export const BODY_POSITIONS = {
  saturn: new THREE.Vector3(75, 0, -32),
  earth: new THREE.Vector3(-24, 0, 27),
}

const atmosphereVertex = /* glsl */ `
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  void main() {
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`

const atmosphereFragment = /* glsl */ `
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  uniform vec3 uColor;
  uniform float uStrength;
  void main() {
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    float rim = pow(1.0 - abs(dot(normalize(vWorldNormal), viewDirection)), 3.0);
    gl_FragColor = vec4(uColor * rim * uStrength, rim * 0.72);
  }
`

function atmosphere(radius: number, color: string, strength = 1) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.09, 48, 32),
    new THREE.ShaderMaterial({
      vertexShader: atmosphereVertex,
      fragmentShader: atmosphereFragment,
      uniforms: { uColor: { value: new THREE.Color(color) }, uStrength: { value: strength } },
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  )
}

function coronaTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 256
  const context = canvas.getContext('2d')!
  const gradient = context.createRadialGradient(128, 128, 20, 128, 128, 128)
  gradient.addColorStop(0, 'rgba(255,238,188,0.9)')
  gradient.addColorStop(0.2, 'rgba(255,174,74,0.36)')
  gradient.addColorStop(0.48, 'rgba(255,105,32,0.10)')
  gradient.addColorStop(1, 'rgba(255,80,20,0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, 256, 256)
  return new THREE.CanvasTexture(canvas)
}

interface PlanetSpec {
  name: string
  radius: number
  orbit: number
  angle: number
  texture: string
  tilt?: number
  atmosphere?: [string, number]
}

const specs: PlanetSpec[] = [
  { name: 'mercury', radius: 0.9, orbit: 18, angle: 1.2, texture: '2k_mercury.jpg' },
  { name: 'venus', radius: 1.5, orbit: 26, angle: 3.9, texture: '2k_venus_surface.jpg', atmosphere: ['#ffc879', 0.55] },
  { name: 'earth', radius: 1.8, orbit: 36, angle: 2.3, texture: '2k_earth_daymap.jpg', atmosphere: ['#4c9fff', 1.25] },
  { name: 'mars', radius: 1.2, orbit: 46, angle: 5.4, texture: '2k_mars.jpg' },
  { name: 'jupiter', radius: 5.5, orbit: 62, angle: 0.85, texture: '2k_jupiter.jpg', tilt: 0.05 },
  { name: 'saturn', radius: 4.8, orbit: 82, angle: -0.4, texture: '2k_saturn.jpg', tilt: 0.38, atmosphere: ['#ffdda0', 0.18] },
  { name: 'uranus', radius: 3.2, orbit: 104, angle: 2.85, texture: '2k_uranus.jpg', tilt: 1.35, atmosphere: ['#83e7ef', 0.5] },
  { name: 'neptune', radius: 3, orbit: 126, angle: 4.75, texture: '2k_neptune.jpg', atmosphere: ['#356dff', 0.75] },
]

export interface SolarSystemWorld {
  group: THREE.Group
  update: (time: number) => void
}

export function createSolarSystem(loader: THREE.TextureLoader, isMobile: boolean): SolarSystemWorld {
  const group = new THREE.Group()
  const rotators: { mesh: THREE.Mesh; speed: number }[] = []
  const segments = isMobile ? 40 : 64
  const sphere = new THREE.SphereGeometry(1, segments, Math.floor(segments * 0.66))

  const sunMap = loader.load('/textures/2k_sun.jpg')
  sunMap.colorSpace = THREE.SRGBColorSpace
  const sun = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ map: sunMap, color: '#fff1d2' }))
  sun.scale.setScalar(9)
  group.add(sun)
  rotators.push({ mesh: sun, speed: 0.018 })

  const coronaMap = coronaTexture()
  const corona = new THREE.Sprite(new THREE.SpriteMaterial({
    map: coronaMap,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    opacity: 0.82,
  }))
  corona.scale.set(42, 42, 1)
  group.add(corona)
  group.add(new THREE.PointLight('#ffe3b0', 5200, 420, 2))
  group.add(new THREE.AmbientLight('#91a4c2', 0.38))
  const rimLight = new THREE.DirectionalLight('#b7d2ff', 0.34)
  rimLight.position.set(80, 45, 100)
  group.add(rimLight)

  const orbitMaterial = new THREE.LineBasicMaterial({ color: '#86a4c7', transparent: true, opacity: 0.13 })
  specs.forEach((spec) => {
    const points: THREE.Vector3[] = []
    for (let i = 0; i <= 180; i++) {
      const angle = (i / 180) * Math.PI * 2
      points.push(new THREE.Vector3(Math.cos(angle) * spec.orbit, 0, Math.sin(angle) * spec.orbit))
    }
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), orbitMaterial))
  })

  specs.forEach((spec, index) => {
    const anchor = new THREE.Group()
    if (spec.name === 'earth') anchor.position.copy(BODY_POSITIONS.earth)
    else if (spec.name === 'saturn') anchor.position.copy(BODY_POSITIONS.saturn)
    else anchor.position.set(Math.cos(spec.angle) * spec.orbit, 0, Math.sin(spec.angle) * spec.orbit)
    anchor.rotation.z = spec.tilt ?? 0.08
    group.add(anchor)

    const map = loader.load(`/textures/${spec.texture}`)
    map.colorSpace = THREE.SRGBColorSpace
    const material = new THREE.MeshStandardMaterial({ map, roughness: 0.92, metalness: 0 })
    if (spec.name === 'earth') {
      material.normalMap = loader.load('/textures/earth_normal_2048.jpg')
      material.normalScale.set(0.32, 0.32)
      material.emissiveMap = loader.load('/textures/earth_lights_2048.png')
      material.emissive.set('#ffd79a')
      material.emissiveIntensity = 1.5
      material.roughness = 0.72
    }
    const planet = new THREE.Mesh(sphere, material)
    planet.scale.setScalar(spec.radius)
    planet.rotation.y = index * 0.7
    anchor.add(planet)
    rotators.push({ mesh: planet, speed: spec.name === 'jupiter' ? 0.07 : 0.025 + index * 0.003 })

    if (spec.atmosphere) anchor.add(atmosphere(spec.radius, ...spec.atmosphere))

    if (spec.name === 'earth') {
      const clouds = new THREE.Mesh(sphere, new THREE.MeshStandardMaterial({
        map: loader.load('/textures/earth_clouds_1024.png'),
        transparent: true,
        opacity: 0.72,
        depthWrite: false,
        roughness: 1,
      }))
      clouds.scale.setScalar(spec.radius * 1.016)
      anchor.add(clouds)
      rotators.push({ mesh: clouds, speed: 0.043 })

      const moon = new THREE.Mesh(sphere, new THREE.MeshStandardMaterial({
        map: loader.load('/textures/moon_1024.jpg'), roughness: 1,
      }))
      moon.scale.setScalar(0.48)
      moon.position.set(3.5, 0.3, 0)
      anchor.add(moon)
    }

    if (spec.name === 'saturn') {
      const inner = spec.radius * 1.25
      const outer = spec.radius * 2.35
      const geometry = new THREE.RingGeometry(inner, outer, 160, 1)
      const position = geometry.attributes.position
      const uv = geometry.attributes.uv
      for (let i = 0; i < position.count; i++) {
        const radius = Math.hypot(position.getX(i), position.getY(i))
        uv.setXY(i, (radius - inner) / (outer - inner), 0.5)
      }
      const ringMap = loader.load('/textures/2k_saturn_ring_alpha.jpg')
      ringMap.colorSpace = THREE.SRGBColorSpace
      const ring = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
        map: ringMap,
        transparent: true,
        opacity: 0.94,
        side: THREE.DoubleSide,
        depthWrite: false,
        roughness: 0.9,
        emissiveMap: ringMap,
        emissive: '#b8a47e',
        emissiveIntensity: 0.5,
      }))
      ring.rotation.x = -Math.PI / 2
      anchor.add(ring)
    }
  })

  return {
    group,
    update(time) {
      rotators.forEach(({ mesh, speed }) => { mesh.rotation.y = time * speed })
      corona.material.rotation = time * 0.006
    },
  }
}
