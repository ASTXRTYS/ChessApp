/**
 * Three.js Mobile Optimizer
 *
 * Implements device-aware optimizations:
 * - Level of Detail (LOD) system
 * - Device tier detection (high/medium/low)
 * - Responsive geometry and texture scaling
 * - Performance monitoring and adaptive quality
 */

import * as THREE from 'three';

export class MobileOptimizer {
  constructor() {
    this.isMobile = this.detectMobile();
    this.isTablet = this.detectTablet();
    this.deviceTier = this.detectDeviceTier();
    this.pixelRatio = this.getOptimalPixelRatio();
    this.performanceLevel = 'auto';

    console.log('[MobileOptimizer] Device:', {
      isMobile: this.isMobile,
      isTablet: this.isTablet,
      tier: this.deviceTier,
      pixelRatio: this.pixelRatio
    });
  }

  /**
   * Detect if device is mobile
   */
  detectMobile() {
    const ua = navigator.userAgent.toLowerCase();
    return /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua);
  }

  /**
   * Detect if device is tablet
   */
  detectTablet() {
    const ua = navigator.userAgent.toLowerCase();
    return /ipad|android(?!.*mobile)|tablet/i.test(ua);
  }

  /**
   * Detect device performance tier
   */
  detectDeviceTier() {
    const mem = navigator.deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;
    const connection = navigator.connection;

    // High-end: 8GB+ RAM, 8+ cores
    if (mem >= 8 && cores >= 8) {
      return 'high';
    }

    // Medium: 4-8GB RAM, 4-8 cores
    if (mem >= 4 && cores >= 4) {
      return 'medium';
    }

    // Low-end: < 4GB RAM or slow connection
    if (connection && connection.effectiveType === '2g') {
      return 'low';
    }

    return 'low';
  }

  /**
   * Get optimal pixel ratio for device
   */
  getOptimalPixelRatio() {
    const dpr = window.devicePixelRatio || 1;

    // Cap pixel ratio based on device tier
    switch (this.deviceTier) {
      case 'high':
        return Math.min(dpr, 2); // Max 2x
      case 'medium':
        return Math.min(dpr, 1.5); // Max 1.5x
      case 'low':
        return 1; // Always 1x on low-end
      default:
        return Math.min(dpr, 2);
    }
  }

  /**
   * Get optimal settings for current device
   */
  getOptimalSettings() {
    const baseSettings = {
      high: {
        pixelRatio: this.pixelRatio,
        cylinderSegments: 64,
        textSize: 1.2,
        textHeight: 0.25,
        particleCount: 1000,
        shadowMapSize: 1024,
        antialias: true,
        enableShadows: true,
        enableParticles: true,
        fov: 50
      },
      medium: {
        pixelRatio: this.pixelRatio,
        cylinderSegments: 32,
        textSize: 1.0,
        textHeight: 0.2,
        particleCount: 500,
        shadowMapSize: 512,
        antialias: true,
        enableShadows: true,
        enableParticles: true,
        fov: 50
      },
      low: {
        pixelRatio: 1,
        cylinderSegments: 16,
        textSize: 0.9,
        textHeight: 0.15,
        particleCount: 100,
        shadowMapSize: 256,
        antialias: false,
        enableShadows: false,
        enableParticles: false,
        fov: 55 // Slightly wider for smaller screens
      }
    };

    return baseSettings[this.deviceTier];
  }

  /**
   * Create LOD mesh with multiple detail levels
   */
  createLODMesh(createGeometry, material) {
    const lod = new THREE.LOD();
    const settings = this.getOptimalSettings();

    // High detail (close distance)
    const highGeo = createGeometry(settings.cylinderSegments);
    const highMesh = new THREE.Mesh(highGeo, material);
    lod.addLevel(highMesh, 0);

    // Medium detail (mid distance)
    const medGeo = createGeometry(Math.floor(settings.cylinderSegments / 2));
    const medMesh = new THREE.Mesh(medGeo, material);
    lod.addLevel(medMesh, 50);

    // Low detail (far distance)
    const lowGeo = createGeometry(Math.floor(settings.cylinderSegments / 4));
    const lowMesh = new THREE.Mesh(lowGeo, material);
    lod.addLevel(lowMesh, 100);

    return lod;
  }

  /**
   * Create optimized cylinder geometry
   */
  createOptimizedCylinder() {
    const settings = this.getOptimalSettings();
    return new THREE.CylinderGeometry(
      2.5, // radiusTop
      2.5, // radiusBottom
      0.6, // height
      settings.cylinderSegments, // radialSegments
      1, // heightSegments
      false // openEnded
    );
  }

  /**
   * Create optimized particle system
   */
  createOptimizedParticles() {
    const settings = this.getOptimalSettings();

    if (!settings.enableParticles) {
      // Return empty object for low-end devices
      return new THREE.Object3D();
    }

    const particleCount = settings.particleCount;
    const positions = [];
    const colors = [];
    const sizes = [];

    for (let i = 0; i < particleCount; i++) {
      const radius = 8 + Math.random() * 4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      positions.push(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta) - 1,
        radius * Math.cos(phi)
      );

      const color = new THREE.Color();
      color.setHSL(0.6 + Math.random() * 0.1, 0.8, 0.5);
      colors.push(color.r, color.g, color.b);

      sizes.push(Math.random() * 0.15 + 0.05);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    return new THREE.Points(geometry, material);
  }

  /**
   * Adjust scene for viewport size
   */
  adjustSceneForViewport(scene, camera, objects) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / height;

    // Update camera aspect ratio
    camera.aspect = aspect;
    camera.updateProjectionMatrix();

    // Mobile portrait: Scale down, zoom out
    if (width < 768) {
      const scale = 0.7;

      if (objects.timer1Mesh) {
        objects.timer1Mesh.scale.set(scale, scale, scale);
      }
      if (objects.timer2Mesh) {
        objects.timer2Mesh.scale.set(scale, scale, scale);
      }

      // Zoom out camera
      camera.position.z = 12;

      // Hide particles on mobile for performance
      if (objects.particles) {
        objects.particles.visible = false;
      }

      // Adjust text size
      if (objects.timer1Text) {
        objects.timer1Text.scale.set(0.8, 0.8, 0.8);
      }
      if (objects.timer2Text) {
        objects.timer2Text.scale.set(0.8, 0.8, 0.8);
      }

    } else if (width < 1024) {
      // Tablet: Medium scaling
      const scale = 0.85;

      if (objects.timer1Mesh) {
        objects.timer1Mesh.scale.set(scale, scale, scale);
      }
      if (objects.timer2Mesh) {
        objects.timer2Mesh.scale.set(scale, scale, scale);
      }

      camera.position.z = 11;

      if (objects.particles) {
        objects.particles.visible = true;
      }

    } else {
      // Desktop: Full size
      if (objects.timer1Mesh) {
        objects.timer1Mesh.scale.set(1, 1, 1);
      }
      if (objects.timer2Mesh) {
        objects.timer2Mesh.scale.set(1, 1, 1);
      }

      camera.position.z = 10;

      if (objects.particles) {
        objects.particles.visible = true;
      }

      if (objects.timer1Text) {
        objects.timer1Text.scale.set(1, 1, 1);
      }
      if (objects.timer2Text) {
        objects.timer2Text.scale.set(1, 1, 1);
      }
    }
  }

  /**
   * Monitor frame rate and adjust quality
   */
  createPerformanceMonitor() {
    let frames = 0;
    let lastTime = performance.now();
    let fps = 60;

    return {
      update: () => {
        frames++;
        const now = performance.now();

        if (now >= lastTime + 1000) {
          fps = Math.round((frames * 1000) / (now - lastTime));
          frames = 0;
          lastTime = now;

          // Adaptive quality: If FPS drops below 50, reduce quality
          if (fps < 50 && this.performanceLevel !== 'low') {
            console.warn('[MobileOptimizer] Low FPS detected, reducing quality');
            this.performanceLevel = 'low';
            return { fps, shouldReduceQuality: true };
          }

          // If FPS is stable above 55, can increase quality
          if (fps > 55 && this.performanceLevel === 'low') {
            console.log('[MobileOptimizer] FPS stable, restoring quality');
            this.performanceLevel = 'auto';
            return { fps, shouldIncreaseQuality: true };
          }
        }

        return { fps, shouldReduceQuality: false, shouldIncreaseQuality: false };
      },

      getFPS: () => fps
    };
  }

  /**
   * Get recommended renderer settings
   */
  getRendererSettings() {
    const settings = this.getOptimalSettings();

    return {
      antialias: settings.antialias,
      alpha: true,
      powerPreference: this.deviceTier === 'high' ? 'high-performance' : 'default',
      stencil: false,
      depth: true,
      logarithmicDepthBuffer: false
    };
  }

  /**
   * Optimize renderer after creation
   */
  optimizeRenderer(renderer) {
    const settings = this.getOptimalSettings();

    // Set pixel ratio
    renderer.setPixelRatio(settings.pixelRatio);

    // Shadow map settings
    if (settings.enableShadows) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    } else {
      renderer.shadowMap.enabled = false;
    }

    // Tone mapping
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    // Output encoding
    renderer.outputEncoding = THREE.sRGBEncoding;

    console.log('[MobileOptimizer] Renderer optimized for', this.deviceTier, 'tier');
  }

  /**
   * Check if device supports WebGL 2
   */
  supportsWebGL2() {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl2') || canvas.getContext('experimental-webgl2'));
    } catch (e) {
      return false;
    }
  }

  /**
   * Get device info summary
   */
  getDeviceInfo() {
    return {
      isMobile: this.isMobile,
      isTablet: this.isTablet,
      deviceTier: this.deviceTier,
      pixelRatio: this.pixelRatio,
      webgl2: this.supportsWebGL2(),
      memory: navigator.deviceMemory,
      cores: navigator.hardwareConcurrency,
      settings: this.getOptimalSettings()
    };
  }
}

// Export singleton instance
export const mobileOptimizer = new MobileOptimizer();
