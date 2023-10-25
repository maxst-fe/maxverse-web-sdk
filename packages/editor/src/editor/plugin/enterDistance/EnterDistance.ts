import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer';
import Editor from '../../app';
import { BasePluginType } from '../plugin.type';
import EnterDistanceService, { IEnterDistanceService } from './EnterDistanceService';

type LineType = Line2;

export const LineName = 'ENTER_DISTANCE_LINE';

class EnterDistance implements BasePluginType {
  #editor: Editor;
  #raycaster = new THREE.Raycaster();
  #mouse = new THREE.Vector2();
  #labelRenderer: CSS2DRenderer;

  //#Service
  #EnterDistanceService: IEnterDistanceService;

  //#state
  private _turnOn = false;
  private _isDrawingLineMode = false;
  private _line: LineType[] = []; //거리 측정한 선분
  private _textLabel: { [key: string]: CSS2DObject } = {};

  constructor(editor: Editor) {
    this.#editor = editor;

    const distanceService = (this.#EnterDistanceService = new EnterDistanceService());
    this.#labelRenderer = distanceService.setLabelRenderer();
  }

  public get line() {
    return this._line;
  }

  public get textLabel() {
    return this._textLabel;
  }

  public get turnOn() {
    return this._turnOn;
  }

  public get isDrawingLineMode() {
    return this._isDrawingLineMode;
  }

  public set isDrawingLineMode(value: boolean) {
    this._isDrawingLineMode = value;
  }

  public init() {
    console.log('Raycaster.line inited');
  }

  public turnOnOff(type: 'on' | 'off') {
    const { canvas } = this.#editor;

    if (type === 'on') {
      if (this._line.length) {
        this.#triggerLineDistance(this._line[0]);
        return;
      }
      this._turnOn = true;
      canvas.style.cursor = 'crosshair';
      this.#editor.EditorControl.turnOffObjectClickEvent();
      this.#setLineMakeEvent();
      this.#setLineMoveEvent();
      this.#setRenderLabelObject();
    } else {
      canvas.style.cursor = 'auto';
      this.#editor.EditorControl.turnOnObjectClickEvent();
      this.#removeLineMakeEvent();
      this.#removeLineMoveEvent();
    }
  }

  public remove() {
    const { canvas, scene } = this.#editor;
    this._turnOn = false;
    this.isDrawingLineMode = false;

    const targetLine = this.line[0];

    if (targetLine) {
      scene.remove(targetLine.userData.measurementLabel);
      targetLine.remove(targetLine.userData.measurementLabel);
      targetLine.removeFromParent();
    }

    canvas.removeEventListener('pointerdown', this._pointerDownCallback);
    canvas.removeEventListener('mousemove', this.#mouseMoveCallback);

    this._line = [];
  }

  #mouseMoveCallback = (event: MouseEvent) => {
    if (!this.isDrawingLineMode) {
      return;
    }
    const line = this.line[0];
    const { canvas, camera, scene } = this.#editor;
    const raycaster = this.#raycaster;
    const mouse = this.#mouse;
    event.preventDefault();

    const distanceService = this.#EnterDistanceService;
    distanceService.setupMouseCords(event, mouse, canvas);

    if (this._isDrawingLineMode) {
      const { points, targetObject } = distanceService.getIntersectsPoints(mouse, camera, scene, []);
      raycaster.setFromCamera(mouse, camera);

      if (targetObject) {
        distanceService.updateLineGeometry(line, points);
      }
    }
  };

  private _pointerDownCallback = (event: MouseEvent) => {
    const { scene, camera, canvas } = this.#editor;
    const mouse = this.#mouse;
    const drawingLine = this._isDrawingLineMode;
    const distanceService = this.#EnterDistanceService;

    distanceService.setupMouseCords(event, mouse, canvas);

    if (this._turnOn && !drawingLine) {
      const { points, targetObject } = distanceService.getIntersectsPoints(mouse, camera, scene, []);

      if (points.length > 0 && targetObject) {
        const line = distanceService.makeLineMesh([...points, ...points], { lineName: LineName });
        this._line.push(line);
        distanceService.addObjectAsChild(targetObject, line, { setChildMatrixFromParent: true });
        this.isDrawingLineMode = true;
      }
    } else {
      this.isDrawingLineMode = false;

      if (this._line.length) {
        this.#triggerLineDistance(this._line[0]);
      }
    }
  };

  #setLineMakeEvent() {
    const { canvas } = this.#editor;

    canvas.addEventListener('pointerdown', this._pointerDownCallback, { capture: false });
  }

  #setLineMoveEvent() {
    const { canvas } = this.#editor;

    canvas.addEventListener('mousemove', this.#mouseMoveCallback, { capture: false });
  }

  #triggerLineDistance(targetLine: LineType) {
    const distanceService = this.#EnterDistanceService;

    this.#editor.trigger('line_distance', {
      type: 'line_distance',
      target: targetLine,
      setLineDistance: (distance: number | 'delete') => {
        targetLine.userData.distance = distance;

        if (distance === 'delete') {
          this.remove();
          return;
        }

        if (targetLine.userData.measurementLabel) {
          targetLine.userData.measurementLabel.element.innerText = `${distance}m`;
        } else {
          const measurementLabel = distanceService.makeMeasurementLabel(`${distance}m`, targetLine);
          this._textLabel[measurementLabel.uuid] = measurementLabel;
          targetLine.userData.measurementLabel = measurementLabel;
          targetLine.add(measurementLabel);
        }
      },
    });
  }

  #setRenderLabelObject() {
    const { camera, scene } = this.#editor;

    this.#editor.on('render', () => {
      this.#labelRenderer.render(scene, camera);
    });
  }

  #removeLineMakeEvent() {
    const { canvas } = this.#editor;

    canvas.removeEventListener('pointerdown', this._pointerDownCallback);
  }

  #removeLineMoveEvent() {
    const { canvas } = this.#editor;

    canvas.removeEventListener('mousemove', this.#mouseMoveCallback);
  }
}

export default EnterDistance;
