"use client";

import designTokens from "../../../cms/src/admin/design-tokens.json";

import { useEffect, useRef } from "react";

export default function MelonModel({ className, foreground = false }: { className?: string; foreground?: boolean }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let cancelled = false;
    let cleanup = () => {};
    const observer = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      try {
        const [THREE, { GLTFLoader }, { RectAreaLightUniformsLib }, { RoomEnvironment }] = await Promise.all([
          import("three"),
          import("three/addons/loaders/GLTFLoader.js"),
          import("three/addons/lights/RectAreaLightUniformsLib.js"),
          import("three/addons/environments/RoomEnvironment.js"),
        ]);
        if (cancelled) return;
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.1;
        const scene = new THREE.Scene();
        const environmentRoom = new RoomEnvironment();
        const environmentGenerator = new THREE.PMREMGenerator(renderer);
        const environment = environmentGenerator.fromScene(environmentRoom, 0.04);
        environmentRoom.dispose();
        environmentGenerator.dispose();
        scene.environment = environment.texture;
        scene.environmentIntensity = 0.2;
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 100);
        camera.position.z = 12;
        const pivot = new THREE.Group();
        scene.add(pivot);
        RectAreaLightUniformsLib.init();
        scene.add(new THREE.HemisphereLight(new THREE.Color(designTokens["color-fffaf3"]), new THREE.Color(designTokens["color-49316d"]), 0.5));
        const key = new THREE.RectAreaLight(new THREE.Color(designTokens["color-fffaf4"]), 3.8, 7, 6);
        key.position.set(-4, 5, 6);
        key.lookAt(0, -1, 0);
        scene.add(key);
        const fill = new THREE.DirectionalLight(new THREE.Color(designTokens["color-eee8ff"]), 0.2);
        fill.position.set(4, 0, 4);
        scene.add(fill);
        const bounce = new THREE.RectAreaLight(new THREE.Color(designTokens["color-9970ff"]), 0.45, 9, 4);
        bounce.position.set(0, -5, 3);
        bounce.lookAt(0, -1, 0);
        scene.add(bounce);
        const resources: { model?: import("three").Group } = {};
        let frame = 0;
        const baseHeight = () => window.innerWidth < 768 ? 280 : 430;
        let halfHeight = element.clientHeight / baseHeight() * 1.9;
        const clones: { group: import("three").Group; x: number; y: number; z: number }[] = [];
        const render = () => {
          cancelAnimationFrame(frame);
          frame = requestAnimationFrame(() => renderer.render(scene, camera));
        };
        const resize = new ResizeObserver(() => {
          const size = element.clientWidth;
          if (!size) return;
          const height = element.clientHeight;
          halfHeight = height / baseHeight() * 1.9;
          camera.left = -halfHeight * size / height;
          camera.right = halfHeight * size / height;
          camera.top = halfHeight;
          camera.bottom = -halfHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(size, height);
          positionClones();
          render();
        });
        const contextLost = (event: Event) => { event.preventDefault(); renderer.domElement.style.visibility = "hidden"; };
        cleanup = () => {
          cancelAnimationFrame(frame);
          resize.disconnect();
          renderer.domElement.removeEventListener("webglcontextlost", contextLost);
          resources.model?.traverse(object => {
            if (!(object instanceof THREE.Mesh)) return;
            object.geometry.dispose();
            for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
              for (const value of Object.values(material)) if (value instanceof THREE.Texture) value.dispose();
              material.dispose();
            }
          });
          environment.dispose();
          renderer.dispose();
          renderer.domElement.remove();
        };
        const gltf = await new GLTFLoader().loadAsync("/assets/cashback/melon.glb");
        const model = gltf.scene;
        resources.model = model;
        if (cancelled) { cleanup(); return; }
        const texturedMaterials = new Set<import("three").MeshStandardMaterial>();
        model.traverse(object => {
          if (!(object instanceof THREE.Mesh)) return;
          for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
            if (!(material instanceof THREE.MeshStandardMaterial) || texturedMaterials.has(material)) continue;
            texturedMaterials.add(material);
            material.roughness = 0.48;
            material.metalness = 0.12;
            material.onBeforeCompile = shader => {
              shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vCoinSurface;")
                .replace("#include <begin_vertex>", "#include <begin_vertex>\nvCoinSurface = position;");
              shader.fragmentShader = shader.fragmentShader.replace("#include <common>", `
                #include <common>
                varying vec3 vCoinSurface;
                float coinHash(vec3 p) {
                  p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
                  p *= 17.0;
                  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
                }
                float coinNoise(vec3 p) {
                  vec3 i = floor(p), f = fract(p);
                  f = f * f * (3.0 - 2.0 * f);
                  return mix(mix(mix(coinHash(i), coinHash(i + vec3(1,0,0)), f.x),
                    mix(coinHash(i + vec3(0,1,0)), coinHash(i + vec3(1,1,0)), f.x), f.y),
                    mix(mix(coinHash(i + vec3(0,0,1)), coinHash(i + vec3(1,0,1)), f.x),
                    mix(coinHash(i + vec3(0,1,1)), coinHash(i + vec3(1,1,1)), f.x), f.y), f.z);
                }
              `).replace("#include <roughnessmap_fragment>", `
                #include <roughnessmap_fragment>
                float coinGrain = coinNoise(vCoinSurface * 95.0);
                float coinWear = coinNoise(vCoinSurface * 9.0);
                roughnessFactor = clamp(roughnessFactor + (coinGrain - 0.5) * 0.11 + (coinWear - 0.5) * 0.06, 0.3, 0.7);
              `).replace("#include <normal_fragment_maps>", `
                #include <normal_fragment_maps>
                vec3 coinDx = normalize(dFdx(-vViewPosition));
                vec3 coinDy = normalize(dFdy(-vViewPosition));
                vec3 coinR1 = cross(coinDy, normal);
                vec3 coinR2 = cross(normal, coinDx);
                float coinDet = dot(coinDx, coinR1) * faceDirection;
                vec2 coinSlope = vec2(dFdx(coinGrain), dFdy(coinGrain)) * 0.03;
                normal = normalize(abs(coinDet) * normal - sign(coinDet) * (coinSlope.x * coinR1 + coinSlope.y * coinR2));
              `);
            };
            material.customProgramCacheKey = () => "coin-fine-grain-v2";
            material.needsUpdate = true;
          }
        });
        model.rotation.x = Math.PI / 2;
        model.updateMatrixWorld(true);
        const bounds = new THREE.Box3().setFromObject(model);
        model.position.sub(bounds.getCenter(new THREE.Vector3()));
        const size = bounds.getSize(new THREE.Vector3());
        model.scale.setScalar(1 / Math.max(size.x, size.y));
        // Keep the original centered inside its own group before cloning.
        const source = new THREE.Group();
        source.add(model);
        model.position.multiplyScalar(model.scale.x);
        // Outward rays originate at the phone screen, around (0.5, 0.79).
        // Farther coins are larger and tilt away along their travel direction.
        const layout = foreground ? [
          [0.61, 0.65, 0.6, 0.15, 0.3, 0.4],
        ] : [
          [0.27, 0.55, 2.05, 0.3, -0.55, -0.65],
          [0.76, 0.58, 1.2, 0.3, 0.55, 0.65],
          [0.19, 0.84, 1.35, -0.15, -0.6, -0.25],
          [0.83, 0.88, 2.3, -0.25, 0.6, 0.35],
        ];
        for (const [x, y, scale, rx, ry, rz] of layout) {
          const group = source.clone(true);
          group.scale.setScalar(scale);
          group.rotation.set(rx, ry, rz);
          group.position.set(x, y, 0);
          pivot.add(group);
          clones.push({ group, x, y, z: rz });
        }
        const positionClones = () => {
          const unit = 3.8 / baseHeight();
          clones.forEach((clone, index) => {
            const [x, y, scale] = layout[index];
            clone.x = (x - 0.5) * element.clientWidth * unit;
            clone.y = (0.5 - y) * element.clientHeight * unit;
            clone.group.position.set(clone.x, clone.y, 0);
            clone.group.scale.setScalar(scale * (window.innerWidth < 768 ? 0.55 : 1));
          });
        };
        positionClones();
        halfHeight = element.clientHeight / baseHeight() * 1.9;
        renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%";
        element.appendChild(renderer.domElement);
        renderer.domElement.addEventListener("webglcontextlost", contextLost);
        resize.observe(element);
        const aspect = element.clientWidth / element.clientHeight;
        camera.left = -halfHeight * aspect;
        camera.right = halfHeight * aspect;
        camera.top = halfHeight;
        camera.bottom = -halfHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(element.clientWidth, element.clientHeight);
        renderer.render(scene, camera);
      } catch {
        cleanup();
        // Leave the decoration empty when WebGL or loading is unavailable.
      }
    }, { rootMargin: "200px" });
    observer.observe(element);
    return () => { cancelled = true; observer.disconnect(); cleanup(); };
  }, [foreground]);

  return <div ref={host} className={className} aria-hidden="true" />;
}
