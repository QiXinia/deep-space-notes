import * as THREE from 'three'
import { BODY_POSITIONS } from './createSolarSystem'

const positionCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 390, 690),
  new THREE.Vector3(-30, 250, 470),
  new THREE.Vector3(0, 105, 245),
  new THREE.Vector3(48, 58, 138),
  new THREE.Vector3(98, 13, 4),
  new THREE.Vector3(48, 30, 64),
  new THREE.Vector3(-10, 6, 18),
  new THREE.Vector3(-13, 3.5, 20),
], false, 'centripetal')

const targetCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-100, 0, 0),
  new THREE.Vector3(-40, 0, 0),
  new THREE.Vector3(25, 0, 0),
  new THREE.Vector3(48, 0, -18),
  BODY_POSITIONS.saturn.clone().add(new THREE.Vector3(-18, 0, 0)),
  new THREE.Vector3(16, 0, 4),
  BODY_POSITIONS.earth.clone().add(new THREE.Vector3(-7, 0, 0)),
  BODY_POSITIONS.earth.clone().add(new THREE.Vector3(7, 0, 0)),
], false, 'centripetal')

const chapterKeys = [
  [0, 0],
  [0.25, 2 / 7],
  [0.5, 4 / 7],
  [0.75, 6 / 7],
  [1, 1],
]

export function getCameraPose(progress: number, position: THREE.Vector3, target: THREE.Vector3) {
  const p = THREE.MathUtils.clamp(progress, 0, 1)
  let t = 1
  for (let i = 0; i < chapterKeys.length - 1; i++) {
    const [startP, startT] = chapterKeys[i]
    const [endP, endT] = chapterKeys[i + 1]
    if (p >= startP && p <= endP) {
      const local = THREE.MathUtils.smoothstep(p, startP, endP)
      t = THREE.MathUtils.lerp(startT, endT, local)
      break
    }
  }
  positionCurve.getPoint(t, position)
  targetCurve.getPoint(t, target)
}
