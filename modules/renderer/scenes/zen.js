/**
 * Zen Scene - Serene Minimalist Environment
 *
 * Focuses on calm visuals: floating stone pads, water ripples, and lanterns.
 * Timer text hovers gently above illuminated pedestals.
 */

import * as THREE from 'three'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'

const FONT_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/fonts/helvetiker_regular.typeface.json'

let font = null
let root = null
let timer1Anchor = null
let timer2Anchor = null
let timer1Text = null
let timer2Text = null
let pedestal1 = null
let pedestal2 = null
let lanternGroup = null
let waterMaterial = null
let rippleRing = null
let animationTime = 0

const disposables = []
const sceneLights = []

export default {
  name: 'zen',

  async init(scene, camera) {
    console.log('[Zen] Initializing tranquil scene...')

    font = await loadFont()

    root = new THREE.Group()
    scene.add(root)

    setupCamera(camera)
    setupLighting(scene)
    createEnvironment(scene)
    createTimerPads()
    createLanterns()
    createInitialText()

    console.log('[Zen] ✅ Scene initialized')
  },

  update(deltaTime, gameState) {
    animationTime += deltaTime

    // Soft bobbing motion for timer anchors
    if (timer1Anchor && timer2Anchor) {
      timer1Anchor.position.x = Math.sin(animationTime * 0.5) * 0.12
      timer1Anchor.position.y = -2.5 + Math.cos(animationTime * 0.6) * 0.08

      timer2Anchor.position.x = Math.sin(animationTime * 0.5 + Math.PI) * 0.12
      timer2Anchor.position.y = 2.5 + Math.cos(animationTime * 0.6 + Math.PI) * 0.08
    }

    // Animate lanterns
    if (lanternGroup) {
      lanternGroup.children.forEach((lantern, index) => {
        const phase = animationTime * 0.8 + index
        lantern.position.y = 2 + Math.sin(phase) * 0.2
        if (lantern.light) {
          lantern.light.intensity = 1.4 + Math.sin(phase * 1.4) * 0.15
        }
      })
    }

    // Animate water subtle shimmer
    if (waterMaterial) {
      waterMaterial.uniforms.time.value = animationTime
    }

    // Ripple ring pulsates on active player
    if (rippleRing) {
      rippleRing.scale.setScalar(1 + Math.sin(animationTime * 0.9) * 0.05 + 0.05)
      rippleRing.material.opacity = 0.35 + Math.sin(animationTime * 1.2) * 0.1
    }

    // Adjust pedestal glow based on active player
    if (gameState.activePlayer === 1 && pedestal1) {
      pedestal1.material.emissiveIntensity = 0.6
    } else if (pedestal1) {
      pedestal1.material.emissiveIntensity = 0.2
    }

    if (gameState.activePlayer === 2 && pedestal2) {
      pedestal2.material.emissiveIntensity = 0.6
    } else if (pedestal2) {
      pedestal2.material.emissiveIntensity = 0.2
    }
  },

  setActivePlayer(player) {
    if (!pedestal1 || !pedestal2) return

    if (player === 1) {
      pedestal1.material.color.set('#6ee7b7')
      pedestal2.material.color.set('#38bdf8')
    } else if (player === 2) {
      pedestal1.material.color.set('#38bdf8')
      pedestal2.material.color.set('#6ee7b7')
    } else {
      pedestal1.material.color.set('#6ee7b7')
      pedestal2.material.color.set('#38bdf8')
    }
  },

  updateTimerDisplay(player, timeString) {
    if (!font) return

    const textMesh = createTimerText(timeString)

    if (player === 1 && timer1Anchor) {
      if (timer1Text) disposeText(timer1Text)
      timer1Text = textMesh
      timer1Text.position.set(-1.4, 0.25, 0.3)
      timer1Anchor.add(timer1Text)
    } else if (player === 2 && timer2Anchor) {
      if (timer2Text) disposeText(timer2Text)
      timer2Text = textMesh
      timer2Text.position.set(-1.4, 0.25, 0.3)
      timer2Text.rotation.z = Math.PI
      timer2Anchor.add(timer2Text)
    }
  },

  destroy() {
    console.log('[Zen] Cleaning up scene...')

    if (root && root.parent) {
      root.parent.remove(root)
    }

    clearSceneLights()

    disposeText(timer1Text)
    disposeText(timer2Text)
    timer1Text = null
    timer2Text = null

    lanternGroup?.children.forEach(lantern => {
      if (lantern.light) {
        lantern.light.dispose?.()
      }
    })

    disposables.forEach((item) => {
      if (item.geometry) item.geometry.dispose()
      if (item.material) {
        if (Array.isArray(item.material)) {
          item.material.forEach(mat => mat.dispose?.())
        } else {
          item.material.dispose?.()
        }
      }
    })

    disposables.length = 0
    root = null
    timer1Anchor = null
    timer2Anchor = null
    pedestal1 = null
    pedestal2 = null
    lanternGroup = null
    waterMaterial = null
    rippleRing = null
    animationTime = 0
  }
}

async function loadFont() {
  if (font) return font
  const loader = new FontLoader()
  return new Promise((resolve, reject) => {
    loader.load(FONT_URL, (loaded) => {
      font = loaded
      resolve(font)
    }, undefined, reject)
  })
}

function setupCamera(camera) {
  camera.position.set(0, 2.5, 9)
  camera.lookAt(0, 0, 0)
}

function setupLighting(scene) {
  const ambient = new THREE.AmbientLight('#d8f3dc', 0.5)
  scene.add(ambient)
  sceneLights.push(ambient)

  const directional = new THREE.DirectionalLight('#c4f1f9', 0.8)
  directional.position.set(3, 5, 4)
  scene.add(directional)
  sceneLights.push(directional)

  const fill = new THREE.DirectionalLight('#f0fdf4', 0.4)
  fill.position.set(-3, 4, -2)
  scene.add(fill)
  sceneLights.push(fill)
}

function createEnvironment(scene) {
  const geometry = new THREE.CircleGeometry(12, 64)
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      color1: { value: new THREE.Color('#0f172a') },
      color2: { value: new THREE.Color('#134e4a') }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec3 pos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 color1;
      uniform vec3 color2;
      varying vec2 vUv;
      void main() {
        float wave = sin((vUv.x + vUv.y) * 12.0 + time * 0.8) * 0.03;
        vec3 color = mix(color1, color2, vUv.y + wave);
        gl_FragColor = vec4(color, 0.92);
      }
    `,
    transparent: true
  })

  const water = new THREE.Mesh(geometry, material)
  water.rotation.x = -Math.PI / 2
  water.position.y = -3
  waterMaterial = material

  registerDisposable(water)
  root.add(water)

  // Border stones
  const stoneGeometry = new THREE.RingGeometry(10.5, 11.5, 64)
  const stoneMaterial = new THREE.MeshStandardMaterial({
    color: '#2f3e46',
    roughness: 0.9,
    metalness: 0.1
  })
  const ring = new THREE.Mesh(stoneGeometry, stoneMaterial)
  ring.rotation.x = -Math.PI / 2
  ring.position.y = -2.95
  registerDisposable(ring)
  root.add(ring)

  rippleRing = ring
}

function createTimerPads() {
  timer1Anchor = new THREE.Group()
  timer2Anchor = new THREE.Group()
  timer1Anchor.position.set(0, -2.5, 0)
  timer2Anchor.position.set(0, 2.5, 0)

  root.add(timer1Anchor)
  root.add(timer2Anchor)

  const pedestalGeometry = new THREE.CylinderGeometry(0.9, 0.95, 0.4, 32)
  const pedestalMaterial1 = new THREE.MeshStandardMaterial({
    color: '#6ee7b7',
    roughness: 0.4,
    metalness: 0.1,
    emissive: new THREE.Color('#6ee7b7'),
    emissiveIntensity: 0.2
  })
  const pedestalMaterial2 = pedestalMaterial1.clone()
  pedestalMaterial2.color = new THREE.Color('#38bdf8')
  pedestalMaterial2.emissive = new THREE.Color('#38bdf8')

  pedestal1 = new THREE.Mesh(pedestalGeometry, pedestalMaterial1)
  pedestal2 = new THREE.Mesh(pedestalGeometry, pedestalMaterial2)
  registerDisposable(pedestal1)
  registerDisposable(pedestal2)

  pedestal1.position.y = -0.2
  pedestal2.position.y = -0.2
  timer1Anchor.add(pedestal1)
  timer2Anchor.add(pedestal2)

  const haloGeometry = new THREE.TorusGeometry(1.1, 0.04, 16, 64)
  const haloMaterial = new THREE.MeshBasicMaterial({
    color: '#b5f5ec',
    transparent: true,
    opacity: 0.25
  })

  const halo1 = new THREE.Mesh(haloGeometry, haloMaterial)
  const halo2 = halo1.clone()
  halo1.rotation.x = Math.PI / 2
  halo2.rotation.x = Math.PI / 2
  halo1.position.y = -0.35
  halo2.position.y = -0.35
  registerDisposable(halo1)
  registerDisposable(halo2)
  timer1Anchor.add(halo1)
  timer2Anchor.add(halo2)
}

function createLanterns() {
  lanternGroup = new THREE.Group()
  root.add(lanternGroup)

  const lanternPositions = [
    new THREE.Vector3(-3, 2, -2),
    new THREE.Vector3(3, 2, -2),
    new THREE.Vector3(-2.5, 2, 2.5),
    new THREE.Vector3(2.5, 2, 2.5)
  ]

  lanternPositions.forEach((pos, index) => {
    const lantern = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 16, 16),
      new THREE.MeshBasicMaterial({
        color: index % 2 === 0 ? '#bef264' : '#a5f3fc',
        transparent: true,
        opacity: 0.7
      })
    )
    lantern.position.copy(pos)
    registerDisposable(lantern)

    const light = new THREE.PointLight(lantern.material.color, 1.2, 8)
    light.position.copy(pos)
    lantern.light = light
    lanternGroup.add(light)
    lanternGroup.add(lantern)
  })
}

function createInitialText() {
  if (timer1Anchor) {
    const text1 = createTimerText('05:00')
    text1.position.set(-1.4, 0.25, 0.3)
    timer1Anchor.add(text1)
    timer1Text = text1
  }

  if (timer2Anchor) {
    const text2 = createTimerText('05:00')
    text2.position.set(-1.4, 0.25, 0.3)
    text2.rotation.z = Math.PI
    timer2Anchor.add(text2)
    timer2Text = text2
  }
}

function createTimerText(timeString) {
  const geometry = new TextGeometry(timeString, {
    font,
    size: 0.8,
    height: 0.1,
    curveSegments: 8
  })
  geometry.computeBoundingBox()
  geometry.center()

  const material = new THREE.MeshStandardMaterial({
    color: '#f0fdf4',
    emissive: '#bbf7d0',
    emissiveIntensity: 0.5,
    roughness: 0.3,
    metalness: 0.1
  })

  return new THREE.Mesh(geometry, material)
}

function disposeText(mesh) {
  if (!mesh) return
  mesh.parent?.remove(mesh)
  mesh.geometry?.dispose()
  if (mesh.material) {
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach(mat => mat.dispose?.())
    } else {
      mesh.material.dispose?.()
    }
  }
}

function registerDisposable(object) {
  disposables.push(object)
}

// Ensure lights are removed from scene on teardown
function clearSceneLights() {
  sceneLights.forEach(light => {
    light.parent?.remove(light)
    if (light.target) {
      light.target.parent?.remove(light.target)
    }
  })
  sceneLights.length = 0
}
