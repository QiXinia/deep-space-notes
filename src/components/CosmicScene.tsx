import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const backgroundVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

const backgroundFragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uAspect;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    mat2 rotation = mat2(0.8, -0.6, 0.6, 0.8);
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p = rotation * p * 2.03 + 13.7;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 uv = vUv - 0.5;
    uv.x *= uAspect;
    float t = uTime * 0.018;
    float cloud = fbm(uv * 2.7 + vec2(t, -t));
    float detail = fbm(uv * 5.0 - vec2(t * 0.7, t));
    float veil = smoothstep(0.34, 0.9, cloud * 0.75 + detail * 0.45);
    float rightGlow = exp(-2.4 * length(uv - vec2(uAspect * 0.22, 0.02)));
    float leftGlow = exp(-3.8 * length(uv + vec2(uAspect * 0.33, 0.18)));
    vec3 color = vec3(0.0);
    color += vec3(0.0, 0.4, 1.0) * veil * rightGlow * 0.2;
    color += vec3(0.98, 0.23, 0.25) * veil * leftGlow * 0.045;
    color += vec3(0.89, 0.91, 0.93) * pow(detail, 5.0) * 0.025;
    gl_FragColor = vec4(color, 1.0);
  }
`

const pointVertex = /* glsl */ `
  attribute float aScale;
  attribute vec3 aColor;
  varying vec3 vColor;
  uniform float uPixelRatio;
  void main() {
    vColor = aColor;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = clamp(aScale * uPixelRatio * (32.0 / -mvPosition.z), 0.7, 7.0);
  }
`

const pointFragment = /* glsl */ `
  varying vec3 vColor;
  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    float alpha = smoothstep(0.5, 0.08, d);
    float core = smoothstep(0.18, 0.0, d);
    gl_FragColor = vec4(vColor + core * 0.65, alpha * 0.9);
  }
`

const planetVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec3 vObjectPosition;
  void main() {
    vNormal = normalize(mat3(modelMatrix) * normal);
    vObjectPosition = position;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`

const planetFragment = /* glsl */ `
  precision highp float;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec3 vObjectPosition;
  uniform float uTime;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
      mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
      mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    vec3 lightDirection = normalize(vec3(-0.8, 0.65, 0.9));
    float diffuse = max(dot(normal, lightDirection), 0.0);
    float rim = pow(1.0 - max(dot(normal, viewDirection), 0.0), 3.0);
    float terrain = sin(vObjectPosition.x * 3.4 + uTime * 0.012 + sin(vObjectPosition.z * 2.7)) * 0.5 + 0.5;
    terrain *= 0.65 + (sin(vObjectPosition.y * 7.0 + vObjectPosition.z * 2.0) * 0.5 + 0.5) * 0.35;
    float bands = sin(vObjectPosition.y * 11.0 + terrain * 4.0) * 0.5 + 0.5;
    vec3 color = vec3(0.002, 0.005, 0.012);
    color += vec3(0.0, 0.4, 1.0) * diffuse * (0.08 + terrain * 0.09);
    color += vec3(0.89, 0.91, 0.93) * bands * diffuse * 0.025;
    float warmSide = smoothstep(-0.2, 0.8, dot(normal, lightDirection));
    color += vec3(0.98, 0.23, 0.25) * rim * warmSide * 0.85;
    color += vec3(0.0, 0.4, 1.0) * rim * 0.28;
    gl_FragColor = vec4(color, 1.0);
  }
`

const atmosphereFragment = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  void main() {
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    float rim = pow(1.0 - abs(dot(normalize(vNormal), viewDirection)), 4.0);
    gl_FragColor = vec4(vec3(0.0, 0.4, 1.0) * rim * 1.4, rim * 0.5);
  }
`

export function CosmicScene() {
  const containerRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' })
    } catch {
      container.classList.add('cosmic-scene--fallback')
      return
    }

    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const pixelRatio = Math.min(window.devicePixelRatio, isMobile ? 1.35 : 1.75)
    renderer.setPixelRatio(pixelRatio)
    renderer.setClearColor(0x000000, 1)
    renderer.autoClear = false
    renderer.domElement.setAttribute('aria-hidden', 'true')
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 180)
    camera.position.set(0, 0, 13)

    const backgroundScene = new THREE.Scene()
    const backgroundCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const backgroundMaterial = new THREE.ShaderMaterial({
      vertexShader: backgroundVertex,
      fragmentShader: backgroundFragment,
      uniforms: { uTime: { value: 0 }, uAspect: { value: 1 } },
      depthWrite: false,
      depthTest: false,
    })
    const backgroundGeometry = new THREE.PlaneGeometry(2, 2)
    backgroundScene.add(new THREE.Mesh(backgroundGeometry, backgroundMaterial))
    const backgroundTarget = new THREE.WebGLRenderTarget(isMobile ? 384 : 768, isMobile ? 384 : 768, { depthBuffer: false })
    const backdropScene = new THREE.Scene()
    const backdropMaterial = new THREE.MeshBasicMaterial({ map: backgroundTarget.texture, depthWrite: false, depthTest: false })
    backdropScene.add(new THREE.Mesh(backgroundGeometry, backdropMaterial))

    const pointMaterial = new THREE.ShaderMaterial({
      vertexShader: pointVertex,
      fragmentShader: pointFragment,
      uniforms: { uPixelRatio: { value: pixelRatio } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    const random = (() => {
      let seed = 918273
      return () => {
        seed = (seed * 16807) % 2147483647
        return (seed - 1) / 2147483646
      }
    })()

    const galaxyCount = isMobile ? 8500 : 16000
    const galaxyPositions = new Float32Array(galaxyCount * 3)
    const galaxyColors = new Float32Array(galaxyCount * 3)
    const galaxyScales = new Float32Array(galaxyCount)
    const inner = new THREE.Color('#ffd700')
    const middle = new THREE.Color('#e2e8ed')
    const outer = new THREE.Color('#0066ff')
    const color = new THREE.Color()
    const arms = 5

    for (let i = 0; i < galaxyCount; i++) {
      const radius = Math.pow(random(), 0.62) * 8.5
      const branch = ((i % arms) / arms) * Math.PI * 2
      const spin = radius * 0.68
      const spread = 0.18 + radius * 0.075
      const rx = (random() - 0.5) * spread
      const ry = (random() - 0.5) * spread * 0.42
      const rz = (random() - 0.5) * spread
      galaxyPositions[i * 3] = Math.cos(branch + spin) * radius + rx
      galaxyPositions[i * 3 + 1] = ry
      galaxyPositions[i * 3 + 2] = Math.sin(branch + spin) * radius + rz
      if (radius < 2.4) color.copy(inner).lerp(middle, radius / 2.4)
      else color.copy(middle).lerp(outer, Math.min((radius - 2.4) / 6.1, 1))
      color.multiplyScalar(0.55 + random() * 0.65)
      galaxyColors.set([color.r, color.g, color.b], i * 3)
      galaxyScales[i] = 0.5 + Math.pow(random(), 4) * 2.2
    }

    const galaxyGeometry = new THREE.BufferGeometry()
    galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(galaxyPositions, 3))
    galaxyGeometry.setAttribute('aColor', new THREE.BufferAttribute(galaxyColors, 3))
    galaxyGeometry.setAttribute('aScale', new THREE.BufferAttribute(galaxyScales, 1))
    const galaxy = new THREE.Points(galaxyGeometry, pointMaterial)
    galaxy.position.set(isMobile ? 0.8 : 4.4, isMobile ? -0.8 : 0.1, -8)
    galaxy.rotation.set(1.03, 0.06, -0.24)
    galaxy.scale.setScalar(isMobile ? 0.82 : 1)
    scene.add(galaxy)

    const starCount = isMobile ? 1200 : 2400
    const starPositions = new Float32Array(starCount * 3)
    const starColors = new Float32Array(starCount * 3)
    const starScales = new Float32Array(starCount)
    for (let i = 0; i < starCount; i++) {
      const theta = random() * Math.PI * 2
      const phi = Math.acos(2 * random() - 1)
      const radius = 22 + random() * 75
      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      starPositions[i * 3 + 1] = radius * Math.cos(phi)
      starPositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta) - 15
      color.set(random() > 0.94 ? '#ffd700' : '#e2e8ed').multiplyScalar(0.35 + random() * 0.8)
      starColors.set([color.r, color.g, color.b], i * 3)
      starScales[i] = 0.45 + Math.pow(random(), 5) * 2.8
    }
    const starGeometry = new THREE.BufferGeometry()
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    starGeometry.setAttribute('aColor', new THREE.BufferAttribute(starColors, 3))
    starGeometry.setAttribute('aScale', new THREE.BufferAttribute(starScales, 1))
    const stars = new THREE.Points(starGeometry, pointMaterial)
    scene.add(stars)

    const planetGroup = new THREE.Group()
    planetGroup.position.set(isMobile ? 1.3 : 4.6, isMobile ? -0.2 : 0.4, -1)
    planetGroup.scale.setScalar(isMobile ? 0.82 : 1)
    scene.add(planetGroup)

    const planetMaterial = new THREE.ShaderMaterial({
      vertexShader: planetVertex,
      fragmentShader: planetFragment,
      uniforms: { uTime: { value: 0 } },
    })
    const planetGeometry = new THREE.SphereGeometry(2.35, isMobile ? 64 : 96, isMobile ? 64 : 96)
    planetGroup.add(new THREE.Mesh(planetGeometry, planetMaterial))

    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: planetVertex,
      fragmentShader: atmosphereFragment,
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    })
    planetGroup.add(new THREE.Mesh(planetGeometry, atmosphereMaterial))

    const ringMaterial = new THREE.MeshBasicMaterial({ color: '#fa3b41', transparent: true, opacity: 0.56 })
    const ringGeometry = new THREE.TorusGeometry(3.45, 0.014, 8, 240)
    const ring = new THREE.Mesh(ringGeometry, ringMaterial)
    ring.rotation.set(1.22, 0.18, -0.42)
    planetGroup.add(ring)
    const outerRingMaterial = new THREE.MeshBasicMaterial({ color: '#e2e8ed', transparent: true, opacity: 0.18 })
    const outerRing = new THREE.Mesh(ringGeometry, outerRingMaterial)
    outerRing.scale.setScalar(1.18)
    outerRing.rotation.copy(ring.rotation)
    planetGroup.add(outerRing)

    let pointerX = 0
    let pointerY = 0
    let scroll = 0
    let currentScroll = 0
    let isVisible = true
    let frame = 0
    const clock = new THREE.Clock()

    const resize = () => {
      const { width, height } = container.getBoundingClientRect()
      if (!width || !height) return
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      backgroundMaterial.uniforms.uAspect.value = width / height
      renderer.setRenderTarget(backgroundTarget)
      renderer.render(backgroundScene, backgroundCamera)
      renderer.setRenderTarget(null)
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)
    resize()

    const onPointerMove = (event: PointerEvent) => {
      if (reducedMotion) return
      pointerX = (event.clientX / window.innerWidth - 0.5) * 2
      pointerY = (event.clientY / window.innerHeight - 0.5) * 2
    }
    const onScroll = () => {
      scroll = Math.min(Math.max(window.scrollY / window.innerHeight, 0), 1)
    }
    const onContextLost = (event: Event) => {
      event.preventDefault()
      container.classList.add('cosmic-scene--fallback')
    }
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting
    })
    visibilityObserver.observe(container)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    renderer.domElement.addEventListener('webglcontextlost', onContextLost)
    onScroll()

    const animate = () => {
      frame = requestAnimationFrame(animate)
      if (!isVisible || document.hidden) return
      const elapsed = reducedMotion ? 0 : clock.getElapsedTime()
      currentScroll += (scroll - currentScroll) * 0.055
      if (!reducedMotion) {
        galaxy.rotation.z = -0.24 + elapsed * 0.012
        stars.rotation.y = elapsed * 0.0025
        planetGroup.rotation.y = elapsed * 0.035 + pointerX * 0.055
        planetGroup.rotation.x = pointerY * 0.025
        camera.position.x += (pointerX * 0.16 - camera.position.x) * 0.035
        camera.position.y += (-pointerY * 0.12 - currentScroll * 1.5 - camera.position.y) * 0.035
      }
      camera.position.z = 13 + currentScroll * 3.2
      planetMaterial.uniforms.uTime.value = elapsed
      renderer.clear()
      renderer.render(backdropScene, backgroundCamera)
      renderer.clearDepth()
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('scroll', onScroll)
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost)
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points) object.geometry.dispose()
      })
      backgroundGeometry.dispose()
      backgroundTarget.dispose()
      backgroundMaterial.dispose()
      backdropMaterial.dispose()
      pointMaterial.dispose()
      planetMaterial.dispose()
      atmosphereMaterial.dispose()
      ringMaterial.dispose()
      outerRingMaterial.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [reducedMotion])

  return <div className="cosmic-scene" ref={containerRef} aria-hidden="true" />
}
