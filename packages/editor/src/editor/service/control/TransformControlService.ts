import * as THREE from 'three';
import { PerspectiveCamera, Scene } from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

export interface ITransformControlService {
  readonly controller: TransformControls;
  setTransformController(): void;
  attachObjectToControl(isDragging: boolean, clickedObject: THREE.Object3D<THREE.Event> | null | undefined): void;
}

class TransformControlService implements ITransformControlService {
  #scene: Scene;
  #canvas: HTMLCanvasElement;
  #camera: PerspectiveCamera;

  #transformControls: TransformControls;

  constructor({ camera, canvas, scene }: { camera: PerspectiveCamera; canvas: HTMLCanvasElement; scene: Scene }) {
    this.#camera = camera;
    this.#canvas = canvas;
    this.#scene = scene;

    this.#transformControls = new TransformControls(camera, canvas);
    this.#transformControls.setMode('translate');

    this.setTransformController();
  }

  get controller() {
    return this.#transformControls;
  }

  setTransformController() {
    this.#initTransformControl();
  }

  attachObjectToControl(isDragging: boolean, clickedObject: THREE.Object3D<THREE.Event> | null | undefined) {
    const transformControls = this.#transformControls;

    if (clickedObject) {
      transformControls.attach(clickedObject);
    }

    if (!clickedObject && !isDragging) {
      transformControls.detach();
    }
  }

  #initTransformControl() {
    const scene = this.#scene;
    const transformControls = this.#transformControls;

    scene.add(transformControls);
  }
}

export default TransformControlService;
