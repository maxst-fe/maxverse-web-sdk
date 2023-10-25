import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import Editor from '../app';
import { IGNORE_CLICK_TARGET } from '../constants/name';
import { IObjectClickService, IOrbitControlService, ITransformControlService } from '../service/control';

export type Services = {
  TransformControlService: ITransformControlService;
  ObjectClickService: IObjectClickService;
  OrbitControlService: IOrbitControlService;
};

const ignoreClickTargetName: string[] = [IGNORE_CLICK_TARGET.GRID_HELPER_GROUP, IGNORE_CLICK_TARGET.TRANSFORM_CONTROLS];
const ignoreTransformTarget: string[] = ['Line2'];

class EditorControl {
  #Editor: Editor;
  #Services: Services;
  //state
  #isObjectDragging = false;
  #orbitControlOnOff = true;

  // prev transform state
  #prevMatrix: THREE.Matrix4;

  constructor(editor: Editor, services: Services) {
    this.#Editor = editor;
    this.#Services = services;

    this.#prevMatrix = new THREE.Matrix4();
  }

  private set isObjectDragging(value: boolean) {
    this.#isObjectDragging = value;
  }

  private set orbitControlOnOff(onOff: boolean) {
    this.#orbitControlOnOff = onOff;
    this.#Services.OrbitControlService.orbitControls.enabled = onOff;
  }

  #canvasClickEventCallback = (e: MouseEvent) => {
    const validObj = this.#getClickedValidObject(e);

    if (!validObj) {
      !this.#isObjectDragging && this.detachTransform();
      return;
    }
    // this.#Editor.trigger("object_click", {
    //   type: "object_click",
    //   target: validObj,
    // });
    this.attachTransform(validObj);
  };

  public get transformController() {
    return this.#Services.TransformControlService.controller;
  }

  public init() {
    this.turnOnObjectClickEvent();
    this.#Services.TransformControlService.controller.name = IGNORE_CLICK_TARGET.TRANSFORM_CONTROLS;
  }

  public turnOffObjectClickEvent() {
    const transformControl = this.#Services.TransformControlService;
    const { canvas } = this.#Editor;
    transformControl.controller.detach();

    this.#Services.ObjectClickService.removeCanvasClickEvent(canvas, this.#canvasClickEventCallback);
  }

  public turnOnObjectClickEvent() {
    this.#setCanvasClickEvent();
    this.#setTransformControllerEvent();
  }

  public attachTransform(validObj: THREE.Object3D<THREE.Event>) {
    const transformControl = this.#Services.TransformControlService;
    const isObjectDragging = this.#isObjectDragging;

    const target = ignoreTransformTarget.find(target => validObj.type === target);
    if (target) {
      return;
    }

    transformControl.attachObjectToControl(isObjectDragging, validObj);
  }

  public detachTransform() {
    const transformControl = this.#Services.TransformControlService;
    transformControl.controller.detach();
  }

  public setTransformMode(mode: 'translate' | 'rotate' | 'scale') {
    const transformControl = this.#Services.TransformControlService;
    if (!transformControl) {
      throw 'error';
    }

    transformControl.controller.setMode(mode);
  }

  public removeClickedObject() {
    const targetObject = this.#Services.TransformControlService.controller.object;
    if (!targetObject) {
      return;
    }

    targetObject.removeFromParent();
    this.#Services.TransformControlService.controller.detach();
  }

  #getClickedValidObject(e: MouseEvent) {
    const objectClick = this.#Services.ObjectClickService;
    const { camera, canvas, scene } = this.#Editor;
    const isObjectDragging = this.#isObjectDragging;

    const validObj = objectClick.getClickObjectEvent(e, {
      scene,
      camera,
      canvas,
      isDragging: isObjectDragging,
      ignoreTargetName: ignoreClickTargetName,
    });

    return validObj;
  }

  #setCanvasClickEvent() {
    const { canvas } = this.#Editor;
    const objectClick = this.#Services.ObjectClickService;

    objectClick.setCanvasClickEvent(canvas, this.#canvasClickEventCallback);
  }

  #setTransformControllerEvent() {
    const transformControl = this.#Services.TransformControlService;

    /**
     * @description transform event triggers only when the transform changes
     */
    transformControl.controller.addEventListener('change', () => {
      const currentMatrix = this.transformController.object?.matrixWorld.clone();

      if (!currentMatrix) {
        return;
      }

      if (!currentMatrix?.equals(this.#prevMatrix)) {
        this.#Editor.trigger('chaging_transform', {
          type: 'chaging_transform',
          target: this.transformController.object!,
        });
        this.#prevMatrix.copy(currentMatrix);
      }
    });

    transformControl.controller.addEventListener('dragging-changed', event => {
      this.isObjectDragging = event.value;
      this.orbitControlOnOff = !event.value;
    });

    transformControl.controller.addEventListener('mouseUp', e => {
      const target = e.target as TransformControls;

      if (!target.object) {
        return;
      }

      this.#Editor.EditorStorage.patch({ transform: target.object?.matrixWorld }, target.object.uuid);
    });
  }
}

export default EditorControl;
