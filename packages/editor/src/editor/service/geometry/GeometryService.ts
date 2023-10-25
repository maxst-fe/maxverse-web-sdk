import * as THREE from 'three';

export interface IGeometryService {
  setCube(scene: THREE.Scene): void;
}

class GeometryService implements IGeometryService {
  setCube(scene: THREE.Scene): void {
    const cube = this.#basicCube();

    scene.add(cube);
  }

  #basicCube({ width = 1, height = 1, depth = 1, color = 0x00ff00 } = {}) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({ color });
    const cube = new THREE.Mesh(geometry, material);

    return cube;
  }
}

export default GeometryService;
