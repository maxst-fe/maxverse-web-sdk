import * as THREE from 'three';
import { PerspectiveCamera, Scene } from 'three';
import { getRootObject } from '../../utils/objectUtils';

export type GetClickObjectEventParams = {
  canvas: HTMLCanvasElement;
  camera: PerspectiveCamera;
  scene: Scene;
  isDragging: boolean;
  ignoreTargetName?: string[];
};

export interface IObjectClickService {
  setCanvasClickEvent(canvas: HTMLCanvasElement, callback: (e: MouseEvent) => void): void;

  /**
   * get click object target in scene
   * @param event
   * @param params
   */
  getClickObjectEvent(event: MouseEvent, params: GetClickObjectEventParams): any;

  removeCanvasClickEvent(canvas: HTMLCanvasElement, callback: (e: MouseEvent) => void): void;
}

class ObjectClickService implements IObjectClickService {
  removeCanvasClickEvent(canvas: HTMLCanvasElement, callback: (e: MouseEvent) => void): void {
    canvas.removeEventListener('mousedown', callback);
  }

  setCanvasClickEvent(canvas: HTMLCanvasElement, callback: (e: MouseEvent) => void) {
    canvas.addEventListener('mousedown', callback);
  }

  /**
   * get click object target in scene
   * @param event
   * @param params
   */
  getClickObjectEvent(event: MouseEvent, params: GetClickObjectEventParams) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { canvas, camera, scene, isDragging, ignoreTargetName = [] } = params;
    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();

    event.preventDefault();

    mouse.x = (event.offsetX / canvas.clientWidth) * 2 - 1;
    mouse.y = -(event.offsetY / canvas.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersections = raycaster.intersectObjects(scene.children);
    const getValidRootObject = this.#findObjectRoot(intersections, ignoreTargetName);

    return getValidRootObject;
  }

  #findObjectRoot(intersections: Array<THREE.Intersection<THREE.Object3D<THREE.Event>>>, ignoreTargetName: string[]) {
    for (let i = 0; i < intersections.length; i++) {
      const target = intersections[i].object;
      const rootObject = getRootObject(target);

      if (!rootObject) {
        continue;
      }

      if (
        !ignoreTargetName.includes(rootObject.name) &&
        !ignoreTargetName.includes(rootObject.constructor.name) &&
        rootObject?.type !== 'Scene'
      ) {
        return rootObject;
      }
    }

    return null;
  }
}

export default ObjectClickService;
