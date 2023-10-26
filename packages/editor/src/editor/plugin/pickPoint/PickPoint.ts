import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import Editor from '../../app';
import { BasePluginType } from '../plugin.type';
import PickPointService from './PickPointService';

class PickPoint implements BasePluginType {
  SPHERE_NAME = 'POINT_SPHERE';
  #Editor: Editor;
  //staff
  #sphere: THREE.Mesh;
  #labelRenderer: CSS2DRenderer;

  //state
  #generatedPoints: THREE.Mesh[] = [];
  #isTransformDragging = false;

  //service
  #PickPointService: PickPointService;

  public get generatedPoints() {
    return this.#generatedPoints;
  }

  constructor(editor: Editor) {
    this.#Editor = editor;

    const pickPointService = (this.#PickPointService = new PickPointService(this));
    this.#labelRenderer = pickPointService.setLabelRenderer(editor.canvas.clientWidth, editor.canvas.clientHeight);

    const sphere = (this.#sphere = pickPointService.makeSphere());
    this.#Editor.scene.add(sphere);
  }

  init(): Promise<void> | void {
    const { scene, camera } = this.#Editor;
    this.#Editor.on('render', () => {
      this.#labelRenderer.render(scene, camera);
    });

    this.#Editor.on('resize', () => {
      const { canvas } = this.#Editor;
      this.#labelRenderer.setSize(canvas.clientWidth, canvas.clientHeight);
    });

    return undefined;
  }

  remove(): Promise<void> | void {
    const canvas = this.#Editor.canvas;

    canvas.removeEventListener('mousedown', this.#mousedownCallback);
    this.#isTransformDragging = false;
    this.#generatedPoints.forEach(point => {
      point.remove();
    });
    this.#generatedPoints = [];
  }

  turnOnOff(type: 'on' | 'off') {
    const canvas = this.#Editor.canvas;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const mouseDownCallback = (_event: THREE.Event & { type: 'mouseDown' } & { target: TransformControls }) => {
      this.#isTransformDragging = true;
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const mouseUpCallback = (_event: THREE.Event & { type: 'mouseUp' } & { target: TransformControls }) => {
      this.#isTransformDragging = false;
    };

    if (type === 'on') {
      this.#Editor.EditorControl.transformController.addEventListener('mouseDown', mouseDownCallback);
      this.#Editor.EditorControl.transformController.addEventListener('mouseUp', mouseUpCallback);
      canvas.addEventListener('mousedown', this.#mousedownCallback);

      this.#Editor.EditorControl.turnOffObjectClickEvent();
    }

    if (type === 'off') {
      const canvas = this.#Editor.canvas;
      this.#Editor.EditorControl.transformController.removeEventListener('mouseDown', mouseDownCallback);
      this.#Editor.EditorControl.transformController.removeEventListener('mouseUp', mouseUpCallback);
      canvas.removeEventListener('mousedown', this.#mousedownCallback);

      this.#Editor.EditorControl.turnOnObjectClickEvent();
    }
  }

  pointGenerate() {
    const service = this.#PickPointService;
    const sphere = this.#sphere;
    if (!sphere.visible) {
      throw 'take a point first';
    }
    this.#generatedPoints.push(sphere);

    const mapPointLabel = service.makeMeasurementLabel('mapPoint', sphere);
    sphere.add(mapPointLabel);

    const newSphere = (this.#sphere = this.#PickPointService.makeSphere());
    this.#Editor.scene.add(newSphere);

    this.#Editor.EditorControl.detachTransform();
  }

  /**
   * @description wrapping transform of attach/detach
   */
  attachTransformToPoint(pointMaterial: THREE.Object3D<THREE.Event>) {
    this.#Editor.EditorControl.attachTransform(pointMaterial);
  }

  detachTransformFromPoint() {
    this.#Editor.EditorControl.detachTransform();
  }

  removeGeneratedPoint(id: string | number, compare: 'id' | 'uuid' = 'id') {
    this.#generatedPoints.forEach(point => {
      if (id === point[compare]) {
        this.#Editor.EditorControl.transformController.detach();
        point.clear();
        point.removeFromParent();
        point.remove();
      }
    });
  }

  generatePointsFromPosition(positions: Array<{ uuid: string; x: number; y: number; z: number }>) {
    if (positions.length === 0) {
      return;
    }

    const pickPointService = this.#PickPointService;

    positions.forEach(position => {
      const sphere = pickPointService.makeSphere(true);
      const mapPointLabel = pickPointService.makeMeasurementLabel('mapPoint', sphere);

      sphere.uuid = position.uuid;
      sphere.add(mapPointLabel);

      sphere.position.setX(position.x);
      sphere.position.setY(position.y);
      sphere.position.setZ(position.z);

      this.#Editor.scene.add(sphere);
      this.#generatedPoints.push(sphere);

      this.#Editor.trigger('point_initialize', {
        type: 'point_initialize',
        target: sphere,
        id: sphere.id,
        uuid: sphere.uuid,
      });
    });
  }

  #mousedownCallback = (event: MouseEvent) => {
    if (this.#isTransformDragging) {
      return;
    }

    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    const { canvas, camera, scene } = this.#Editor;

    const pointMaterial = this.#PickPointService.findPointObject(scene);

    if (!pointMaterial) {
      return;
    }

    mouse.x = (event.offsetX / canvas.clientWidth) * 2 - 1;
    mouse.y = -(event.offsetY / canvas.clientHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const points = this.#generatedPoints;

    const intersection = raycaster.intersectObjects([...points, pointMaterial], false);

    this.#Editor.EditorControl.detachTransform();

    /**
     * @description
     */
    if (!intersection[0]) {
      this.#Editor.trigger('point_unclick', {
        type: 'point_unclick',
      });
    }

    if (intersection[0]) {
      if (intersection[0].object.name === this.SPHERE_NAME) {
        this.#Editor.trigger('object_click', {
          type: 'object_click',
          target: intersection[0].object,
        });
        this.#Editor.EditorControl.attachTransform(intersection[0].object);

        return;
      }

      const spheres = this.#sphere;

      spheres.position.copy(intersection[0].point);
      spheres.scale.set(1, 1, 1);
      spheres.visible = true;

      this.#Editor.EditorControl.attachTransform(spheres);

      this.#Editor.trigger('point_enter', {
        type: 'point_enter',
        target: spheres,
        id: spheres.id,
      });
    }
  };
}

export default PickPoint;
