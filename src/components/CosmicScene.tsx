import { useEffect, useRef, useState, type RefObject } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { createGalaxy } from '@/scene/createGalaxy'
import { BODY_POSITIONS, createSolarSystem } from '@/scene/createSolarSystem'
import { getCameraPose } from '@/scene/cameraPath'

interface CosmicSceneProps {
  journeyRef: RefObject<HTMLElement | null>
  onChapterChange: (chapter: number) => void
}

export function CosmicScene({ journeyRef, onChapterChange }: CosmicSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    const journey = journeyRef.current
    if (!container || !journey) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' })
    } catch {
      container.classList.add('cosmic-world--fallback')
      queueMicrotask(() => setReady(true))
      return
    }

    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const pixelRatio = Math.min(window.devicePixelRatio, isMobile ? 1.2 : 1.5)
    renderer.setPixelRatio(pixelRatio)
    renderer.setClearColor(0x010205, 1)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.08
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.domElement.setAttribute('aria-hidden', 'true')
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(isMobile ? 52 : 45, 1, 0.1, 4000)
    const manager = new THREE.LoadingManager()
    manager.onLoad = () => setReady(true)
    manager.onError = () => setReady(true)
    const loader = new THREE.TextureLoader(manager)
    loader.setCrossOrigin('anonymous')

    const galaxy = createGalaxy(isMobile, pixelRatio)
    scene.add(galaxy.group)
    const solar = createSolarSystem(loader, isMobile)
    scene.add(solar.group)

    const skyMap = loader.load('/textures/2k_stars_milky_way.jpg')
    skyMap.colorSpace = THREE.SRGBColorSpace
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(1550, 40, 24),
      new THREE.MeshBasicMaterial({
        map: skyMap,
        color: '#78829a',
        side: THREE.BackSide,
        transparent: true,
        opacity: 0.32,
        depthWrite: false,
      }),
    )
    sky.rotation.set(0.5, -1.2, 0.2)
    scene.add(sky)

    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.52, 0.55, 0.8)
    composer.addPass(bloom)
    composer.addPass(new OutputPass())

    let targetProgress = 0
    let currentProgress = 0
    let visible = true
    let frame = 0
    let activeChapter = -1
    let pointerX = 0
    let pointerY = 0
    const position = new THREE.Vector3()
    const target = new THREE.Vector3()
    const offset = new THREE.Vector3()
    const origin = new THREE.Vector3()
    let lastFrameTime = performance.now()
    let elapsedTime = 0

    const updateProgress = () => {
      const rect = journey.getBoundingClientRect()
      const distance = Math.max(journey.offsetHeight - window.innerHeight, 1)
      targetProgress = THREE.MathUtils.clamp(-rect.top / distance, 0, 1)
      const chapter = Math.min(4, Math.max(0, Math.round(targetProgress * 4)))
      if (chapter !== activeChapter) {
        activeChapter = chapter
        onChapterChange(chapter)
      }
    }

    const resize = () => {
      const { width, height } = container.getBoundingClientRect()
      if (!width || !height) return
      renderer.setSize(width, height, false)
      composer.setSize(width, height)
      camera.aspect = width / height
      camera.fov = camera.aspect < 0.75 ? 52 : 45
      camera.updateProjectionMatrix()
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)
    resize()

    const onPointerMove = (event: PointerEvent) => {
      if (reducedMotion || event.pointerType === 'touch') return
      pointerX = (event.clientX / window.innerWidth - 0.5) * 2
      pointerY = (event.clientY / window.innerHeight - 0.5) * 2
    }
    const onContextLost = (event: Event) => {
      event.preventDefault()
      container.classList.add('cosmic-world--fallback')
    }
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })
    visibilityObserver.observe(journey)
    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress, { passive: true })
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    renderer.domElement.addEventListener('webglcontextlost', onContextLost)
    updateProgress()

    const animate = () => {
      frame = requestAnimationFrame(animate)
      if (!visible || document.hidden) return
      const now = performance.now()
      const delta = Math.min((now - lastFrameTime) / 1000, 1)
      lastFrameTime = now
      if (!reducedMotion) elapsedTime += delta
      const time = reducedMotion ? 0 : elapsedTime
      currentProgress = reducedMotion ? targetProgress : THREE.MathUtils.damp(currentProgress, targetProgress, 7, delta)
      getCameraPose(currentProgress, position, target)
      offset.copy(position).sub(target)
      if (camera.aspect < 0.75) {
        const learningFocus = THREE.MathUtils.smoothstep(currentProgress, 0.75, 1)
        offset.multiplyScalar(1.28 + learningFocus * 0.37)
      }
      camera.position.copy(target).add(offset)
      camera.position.x += pointerX * 0.65
      camera.position.y -= pointerY * 0.35
      if (camera.aspect < 0.75) {
        const galaxyFocus = 1 - THREE.MathUtils.smoothstep(currentProgress, 0, 0.18)
        const solarFocus = 1 - THREE.MathUtils.smoothstep(Math.abs(currentProgress - 0.25), 0, 0.15)
        const saturnFocus = 1 - THREE.MathUtils.smoothstep(Math.abs(currentProgress - 0.5), 0, 0.16)
        const earthFocus = THREE.MathUtils.smoothstep(currentProgress, 0.62, 0.74)
        target.lerp(origin, galaxyFocus)
        target.lerp(origin, solarFocus)
        target.lerp(BODY_POSITIONS.saturn, saturnFocus)
        target.lerp(BODY_POSITIONS.earth, earthFocus)
        target.y -= 52 * (1 - THREE.MathUtils.smoothstep(currentProgress, 0.04, 0.24))
        const earthLift = THREE.MathUtils.lerp(8, 6, THREE.MathUtils.smoothstep(currentProgress, 0.75, 1))
        target.y -= 24 * solarFocus + 9 * saturnFocus + earthLift * earthFocus
      }
      camera.lookAt(target)

      const galaxyFade = THREE.MathUtils.smoothstep(currentProgress, 0.08, 0.25)
      galaxy.galaxyMaterial.uniforms.uOpacity.value = 0.72 - galaxyFade * 0.69
      galaxy.cloudMaterial.uniforms.uOpacity.value = 1 - galaxyFade
      galaxy.coreMaterial.opacity = 0.24 * (1 - galaxyFade)
      galaxy.starMaterial.uniforms.uOpacity.value = 0.82
      galaxy.update(time)
      solar.update(time)
      sky.rotation.y = -1.2 + time * 0.0005

      if (isMobile || reducedMotion) renderer.render(scene, camera)
      else composer.render()
    }
    animate()

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
      window.removeEventListener('pointermove', onPointerMove)
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost)
      const geometries = new Set<THREE.BufferGeometry>()
      const materials = new Set<THREE.Material>()
      const textures = new Set<THREE.Texture>()
      scene.traverse((object) => {
        if ('geometry' in object && object.geometry instanceof THREE.BufferGeometry) geometries.add(object.geometry)
        if ('material' in object) {
          const list = Array.isArray(object.material) ? object.material : [object.material]
          list.forEach((material) => {
            if (!(material instanceof THREE.Material)) return
            materials.add(material)
            Object.values(material).forEach((value) => { if (value instanceof THREE.Texture) textures.add(value) })
          })
        }
      })
      geometries.forEach((geometry) => geometry.dispose())
      materials.forEach((material) => material.dispose())
      textures.forEach((texture) => texture.dispose())
      composer.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [journeyRef, onChapterChange, reducedMotion])

  return (
    <div className={`cosmic-world ${ready ? 'is-ready' : ''}`} ref={containerRef} aria-hidden="true">
      {!ready && <div className="cosmic-world__loading"><i /><span>正在连接深空</span></div>}
    </div>
  )
}
