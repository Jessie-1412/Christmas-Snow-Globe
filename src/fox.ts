import * as THREE from 'three/webgpu';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { smoothFox } from './smooth-fox';

/** PixelMannen mesh (CC0), tomkranis animation and glTF conversion (CC BY 4.0).
 * The supplied red-fox coat is adapted to winter ivory. Full credits: /credits.html.
 */
export async function createArcticFox() {
  const gltf = await new GLTFLoader().loadAsync(`${import.meta.env.BASE_URL}fox.glb`);
  const fox = gltf.scene;
  fox.name = 'Winter fox — animated licensed asset';
  const bounds = new THREE.Box3().setFromObject(fox);
  const size = bounds.getSize(new THREE.Vector3());
  const scale = .90 / Math.max(size.x, size.z);
  fox.scale.setScalar(scale);
  fox.position.set(-.48, .075 - bounds.min.y * scale, .66);
  fox.rotation.y = .60;
  fox.traverse(obj => {
    if (!(obj instanceof THREE.Mesh)) return;
    obj.castShadow = true;
    obj.receiveShadow = true;
    const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
    for (const material of materials) {
      const mat = material as THREE.MeshStandardMaterial;
      if (mat.map) {
        const canvas = document.createElement('canvas');
        canvas.width = 1024; canvas.height = 1024;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(mat.map.image as CanvasImageSource, 0, 0, 1024, 1024);
        const pixels = ctx.getImageData(0, 0, 1024, 1024);
        for (let i = 0; i < pixels.data.length; i += 4) {
          const r = pixels.data[i], g = pixels.data[i + 1], b = pixels.data[i + 2];
          // Preserve the charcoal eyes and nose, lighten the orange coat and brown socks.
          if (r > g * 1.25 && r > b * 1.8) {
            const value = r > 130 ? 235 : 204;
            pixels.data[i] = value + 5; pixels.data[i + 1] = value + 5; pixels.data[i + 2] = value + 3;
          }
        }
        ctx.putImageData(pixels, 0, 0);
        const texture = new THREE.CanvasTexture(canvas);
        texture.flipY = false; texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 2;
        mat.map = texture;
      }
      mat.roughness = .84;
      mat.metalness = 0;
      mat.needsUpdate = true;
    }
    // Smooth shared position normals without merging skin/UV seams.
    const originalGeometry = obj.geometry;
    obj.geometry = smoothFox(originalGeometry);
    originalGeometry.dispose();
    const geo = obj.geometry;
    geo.computeVertexNormals();
    const pos = geo.getAttribute('position'), normal = geo.getAttribute('normal');
    const sums = new Map<string, THREE.Vector3>();
    const key = (i: number) => `${pos.getX(i).toFixed(3)},${pos.getY(i).toFixed(3)},${pos.getZ(i).toFixed(3)}`;
    for (let i = 0; i < pos.count; i++) {
      const k = key(i), n = new THREE.Vector3().fromBufferAttribute(normal, i);
      sums.set(k, (sums.get(k) || new THREE.Vector3()).add(n));
    }
    for (let i = 0; i < pos.count; i++) {
      const n = sums.get(key(i))!.clone().normalize(); normal.setXYZ(i, n.x, n.y, n.z);
    }
    normal.needsUpdate = true;
  });
  const mixer = new THREE.AnimationMixer(fox);
  const idle = gltf.animations.find(clip => clip.name === 'Survey');
  if (idle) mixer.clipAction(idle).setEffectiveTimeScale(.55).play();
  return { group: fox, update: (dt: number, _elapsed: number) => mixer.update(dt) };
}
