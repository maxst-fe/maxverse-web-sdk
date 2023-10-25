import { PerspectiveCamera } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface IOrbitControlService {
  readonly orbitControls: OrbitControls;
}

class OrbitControlService implements IOrbitControlService {
  #orbitControls: OrbitControls;

  constructor({ camera, canvas }: { camera: PerspectiveCamera; canvas: HTMLCanvasElement }) {
    const orbitControls = (this.#orbitControls = new OrbitControls(camera, canvas));

    orbitControls.minDistance = 1;
    orbitControls.maxDistance = 50;
    orbitControls.enablePan = true;

    this.#init();
  }

  get orbitControls() {
    return this.#orbitControls;
  }

  #init() {
    // console.log('init');
  }
}

export default OrbitControlService;
