/**
 * Cyberpunk Scene - Neon Grid Cityscape
 *
 * Vibrant neon panels, holographic elements, and animated lighting for a futuristic vibe.
 */

import * as THREE from 'three'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'

const FONT_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/fonts/helvetiker_regular.typeface.json'

let font = null
let root = null
let timer1Panel = null
let timer2Panel = null
let timer1Text = null
let timer2Text = null
let neonRings = []
let holoEmitter = null
let gridHelper = null
let animationTime = 0

const panelMaterials = {
  player1: null,
  player2: null
}

const disposables = []
const sceneLights = []

export default {
  name: 'cyberpunk',

  async init(scene, camera) {
    console.log('[Cyberpunk] Initializing neon arena...')

    font = await loadFont()

    root = new THREE.Group()
    scene.add(root)

    setupCamera(camera)
    setupLighting(scene)
    createEnvironment(scene)
    createTimerPanels()
    createHologram()
    createInitialText()

    console.log('[Cyberpunk] ✅ Scene initialized')
  },

  update(deltaTime, gameState) {
    animationTime += deltaTime

    // Pulse panel emissive intensity
    if (panelMaterials.player1) {
      const base = gameState.activePlayer === 1 ? 1.1 : 0.4
      panelMaterials.player1.emissiveIntensity = base + Math.sin(animationTime * 3) * 0.12
    }
    if (panelMaterials.player2) {
      const base = gameState.activePlayer === 2 ? 1.1 : 0.4
      panelMaterials.player2.emissiveIntensity = base + Math.cos(animationTime * 3) * 0.12
    }

    // Animate neon rings
    neonRings.forEach((ring, index) => {
      const t = animationTime * (0.6 + index * 0.2)
      ring.rotation.z = t
      ring.material.opacity = 0.4 + Math.sin(t * 2 + index) * 0.2
    })

    // Hologram emitter rise/fall
    if (holoEmitter) {
      holoEmitter.position.y = 0.5 + Math.sin(animationTime * 2) * 0.25
      holoEmitter.material.opacity = 0.45 + Math.sin(animationTime * 4) * 0.2
    }

    // Animate grid color shift
    if (gridHelper) {
      const color = new THREE.Color()
      color.setHSL(0.5 + Math.sin(animationTime) * 0.1, 0.9, 0.5)
      gridHelper.material.color = color
    }
  },

  setActivePlayer(player) {
    if (!panelMaterials.player1 || !panelMaterials.player2) return

    if (player === 1) {
      panelMaterials.player1.color.set('#38bdf8')
      panelMaterials.player2.color.set('#f472b6')
    } else if (player === 2) {
      panelMaterials.player1.color.set('#f472b6')
      panelMaterials.player2.color.set('#38bdf8')
    } else {
      panelMaterials.player1.color.set('#38bdf8')
      panelMaterials.player2.color.set('#f472b6')
    }
  },

  updateTimerDisplay(player, timeString) {
    if (!font) return

    const textMesh = createTimerText(timeString)

    if (player === 1 && timer1Panel) {
      if (timer1Text) disposeText(timer1Text)
      timer1Text = textMesh
      timer1Text.position.set(0, 0.01, 0.11)
      timer1Panel.add(timer1Text)
    } else if (player === 2 && timer2Panel) {
      if (timer2Text) disposeText(timer2Text)
      timer2Text = textMesh
      timer2Text.rotation.z = Math.PI
      timer2Text.position.set(0, 0.01, 0.11)
      timer2Panel.add(timer2Text)
    }
  },

  destroy() {
    console.log('[Cyberpunk] Cleaning up scene...')

    disposeText(timer1Text)
    disposeText(timer2Text)
    timer1Text = null
    timer2Text = null

    if (root && root.parent) {
      root.parent.remove(root)
    }

    clearSceneLights()

    neonRings = []
    holoEmitter = null
    gridHelper = null

    disposables.forEach(obj => {
      if (obj.geometry) obj.geometry.dispose()
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(mat => mat.dispose?.())
        } else {
          obj.material.dispose?.()
        }
      }
    })
    disposables.length = 0
    timer1Panel = null
    timer2Panel = null
    panelMaterials.player1 = null
    panelMaterials.player2 = null
    root = null
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
  camera.position.set(0, 2.2, 9)
  camera.lookAt(0, 0, 0)
}

function setupLighting(scene) {
  const ambient = new THREE.AmbientLight('#38bdf8', 0.35)
  scene.add(ambient)
  sceneLights.push(ambient)

  const blueSpot = new THREE.SpotLight('#38bdf8', 1.5, 25, Math.PI / 4, 0.7)
  blueSpot.position.set(-6, 8, 4)
  scene.add(blueSpot)
  sceneLights.push(blueSpot)

  const magentaSpot = new THREE.SpotLight('#f472b6', 1.5, 25, Math.PI / 4, 0.7)
  magentaSpot.position.set(6, 8, 4)
  scene.add(magentaSpot)
  sceneLights.push(magentaSpot)

  const rim = new THREE.DirectionalLight('#a855f7', 0.6)
  rim.position.set(0, 4, -6)
  scene.add(rim)
  sceneLights.push(rim)
}

function createEnvironment(scene) {
  gridHelper = new THREE.GridHelper(40, 40, '#38bdf8', '#38bdf8')
  gridHelper.position.y = -4
  root.add(gridHelper)
  registerDisposable(gridHelper)

  const gridMaterial = gridHelper.material
  gridMaterial.transparent = true
  gridMaterial.opacity = 0.35

  const backdropGeometry = new THREE.PlaneGeometry(24, 14)
  const backdropMaterial = new THREE.MeshBasicMaterial({
    color: '#0f172a',
    transparent: true,
    opacity: 0.65
  })
  const backdrop = new THREE.Mesh(backdropGeometry, backdropMaterial)
  backdrop.position.set(0, 2, -6)
  registerDisposable(backdrop)
  root.add(backdrop)

  const skylineGeometry = new THREE.BoxGeometry(1, 4, 1)
  for (let i = -4; i <= 4; i += 2) {
    const tower = new THREE.Mesh(
      skylineGeometry.clone(),
      new THREE.MeshStandardMaterial({
        color: '#1f2937',
        emissive: i % 4 === 0 ? '#22d3ee' : '#f472b6',
        emissiveIntensity: 0.35,
        metalness: 0.6,
        roughness: 0.25
      })
    )
    tower.scale.y = 0.8 + Math.random() * 1.8
    tower.position.set(i * 1.1, tower.scale.y * 1.5 - 1, -5)
    registerDisposable(tower)
    root.add(tower)
  }
}

function createTimerPanels() {
  const panelGeometry = new THREE.BoxGeometry(4.2, 1.6, 0.2)

  const panelMaterial1 = new THREE.MeshStandardMaterial({
    color: '#38bdf8',
    emissive: '#0ea5e9',
    emissiveIntensity: 0.6,
    roughness: 0.2,
    metalness: 0.8
  })
  const panelMaterial2 = new THREE.MeshStandardMaterial({
    color: '#f472b6',
    emissive: '#ec4899',
    emissiveIntensity: 0.6,
    roughness: 0.2,
    metalness: 0.8
  })

  timer1Panel = new THREE.Mesh(panelGeometry, panelMaterial1)
  timer2Panel = new THREE.Mesh(panelGeometry, panelMaterial2)
  registerDisposable(timer1Panel)
  registerDisposable(timer2Panel)

  timer1Panel.position.set(0, -2.5, 0)
  timer2Panel.position.set(0, 2.5, 0)
  timer2Panel.rotation.z = Math.PI

  panelMaterials.player1 = panelMaterial1
  panelMaterials.player2 = panelMaterial2

  root.add(timer1Panel)
  root.add(timer2Panel)

  // Neon rings around panels
  const ringGeometry = new THREE.RingGeometry(2.5, 2.7, 64)
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: '#22d3ee',
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide
  })

  const ring1 = new THREE.Mesh(ringGeometry, ringMaterial.clone())
  const ring2 = new THREE.Mesh(ringGeometry, ringMaterial.clone())
  ring1.rotation.y = Math.PI / 2
  ring2.rotation.y = Math.PI / 2
  ring1.position.copy(timer1Panel.position)
  ring2.position.copy(timer2Panel.position)
  registerDisposable(ring1)
  registerDisposable(ring2)
  neonRings.push(ring1, ring2)
  root.add(ring1)
  root.add(ring2)
}

function createHologram() {
  const geometry = new THREE.ConeGeometry(0.8, 2.4, 32, 1, true)
  const material = new THREE.MeshBasicMaterial({
    color: '#22d3ee',
    transparent: true,
    opacity: 0.5,
    wireframe: true
  })
  const hologram = new THREE.Mesh(geometry, material)
  hologram.position.set(0, 0.5, 0)

  holoEmitter = hologram
  registerDisposable(hologram)
  root.add(hologram)

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#a855f7' })
  )
  core.position.set(0, 0.5, 0)
  registerDisposable(core)
  root.add(core)
}

function createInitialText() {
  const text1 = createTimerText('05:00')
  text1.position.set(0, 0.01, 0.11)
  timer1Panel?.add(text1)
  timer1Text = text1

  const text2 = createTimerText('05:00')
  text2.rotation.z = Math.PI
  text2.position.set(0, 0.01, 0.11)
  timer2Panel?.add(text2)
  timer2Text = text2
}

function createTimerText(timeString) {
  const geometry = new TextGeometry(timeString, {
    font,
    size: 0.9,
    height: 0.1,
    curveSegments: 10
  })
  geometry.computeBoundingBox()
  geometry.center()

  const material = new THREE.MeshStandardMaterial({
    color: '#e0f2fe',
    emissive: '#38bdf8',
    emissiveIntensity: 0.9,
    metalness: 0.7,
    roughness: 0.2
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

function clearSceneLights() {
  sceneLights.forEach(light => {
    light.parent?.remove(light)
    if (light.target) {
      light.target.parent?.remove(light.target)
    }
  })
  sceneLights.length = 0
}
