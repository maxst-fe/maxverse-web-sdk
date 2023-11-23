import * as THREE from 'three';
import { WebGLRenderer } from 'three';

export interface IResizeService {
  setResize(renderer: THREE.WebGLRenderer, canvas: HTMLCanvasElement, camera: THREE.PerspectiveCamera): void;
}
class ResizeService implements IResizeService {
  public setResize(renderer: WebGLRenderer, canvas: HTMLCanvasElement, camera: THREE.PerspectiveCamera): void {
    const width = canvas.clientWidth || 1;
    const height = canvas.clientHeight || 1;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height, false);
  }
}

export default ResizeService;
