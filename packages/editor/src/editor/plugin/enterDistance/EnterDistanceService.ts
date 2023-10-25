import * as THREE from 'three';
import { Object3D, Vector3 } from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial, LineMaterialParameters } from 'three/examples/jsm/lines/LineMaterial.js';
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { getRootObject } from '../../utils/objectUtils';

export interface IEnterDistanceService {
  setupMouseCords(event: MouseEvent, mouse: THREE.Vector2, canvas: HTMLCanvasElement): void;
  getIntersectsPoints(
    mouse: THREE.Vector2,
    camera: THREE.PerspectiveCamera,
    scene: THREE.Scene,
    ignoreTargetName: string[]
  ): { targetObject: THREE.Object3D | null; points: number[] };

  makeLineMesh(
    points: number[] | Float32Array,
    options?: {
      lineMaterial?: LineMaterialParameters;
      lineName: string;
    }
  ): Line2;

  addObjectAsChild(
    objectParent: THREE.Object3D,
    objectChildren: THREE.Object3D,
    options?: { setChildMatrixFromParent: boolean }
  ): void;

  updateLineGeometry(targetLine: Line2, points: number[]): void;

  setLabelRenderer(): CSS2DRenderer;

  makeMeasurementLabel(innerText: string, targetLine: Line2): CSS2DObject;
}

class EnterDistanceService implements IEnterDistanceService {
  makeMeasurementLabel(innerText: string, targetLine: Line2): CSS2DObject {
    const measurementDiv = document.createElement('div') as HTMLDivElement;
    measurementDiv.className = 'measurementLabel';
    measurementDiv.style.color = 'white';
    measurementDiv.innerText = innerText;
    const measurementLabel = new CSS2DObject(measurementDiv);

    const linePosition = targetLine.geometry.attributes.instanceStart.array;

    const pointA = [linePosition[0], linePosition[1], linePosition[2]];
    const pointB = [linePosition[3], linePosition[4], linePosition[5]];

    measurementLabel.position.copy(
      new Vector3((pointA[0] + pointB[0]) / 2, (pointA[1] + pointB[1]) / 2, (pointA[2] + pointB[2]) / 2)
    );

    return measurementLabel;
  }
  makeLineMesh(
    points: Float32Array | number[],
    options?: {
      lineMaterial?: LineMaterialParameters;
      lineName?: string;
    }
  ): Line2 {
    const geometry = new LineGeometry();
    geometry.setPositions(points);

    const matLine = new LineMaterial({
      color: 0xffffff,
      linewidth: 0.01, // in world units with size attenuation, pixels otherwise
      depthTest: false,
      ...options?.lineMaterial,
    });

    const line = new Line2(geometry, matLine);
    line.scale.set(1, 1, 1);

    if (options?.lineName) {
      line.name = options.lineName;
    }

    return line;
  }
  setupMouseCords(event: MouseEvent, mouse: THREE.Vector2, canvas: HTMLCanvasElement) {
    mouse.x = (event.offsetX / canvas.clientWidth) * 2 - 1;
    mouse.y = -(event.offsetY / canvas.clientHeight) * 2 + 1;
  }

  getIntersectsPoints(
    mouse: THREE.Vector2,
    camera: THREE.PerspectiveCamera,
    scene: THREE.Scene,
    ignoreTargetName: string[]
  ) {
    const points: number[] = [];
    const raycaster = new THREE.Raycaster();
    let targetObject = null;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children, false);

    for (let i = 0; i < intersects.length; i++) {
      const target = intersects[i];
      if (this.#checkValidObject(target, ignoreTargetName)) {
        points.push(...target.point);
        targetObject = target.object;
        break;
      }
    }

    return { points, targetObject };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  #checkValidObject(target: THREE.Intersection<THREE.Object3D<THREE.Event>>, _ignoreTargetName: string[]) {
    return (
      target.object.type !== 'LineSegments' &&
      target.object.type !== 'GridHelper' &&
      target.object.type !== 'Line2' &&
      target.object.type !== 'Line' &&
      target.object.type !== 'TransformControlsPlane' &&
      getRootObject(target.object)?.constructor.name !== 'TransformControls'
    );
  }

  addObjectAsChild(
    objectParent: Object3D,
    objectChildren: Object3D,
    options?: { setChildMatrixFromParent: boolean }
  ): void {
    if (options?.setChildMatrixFromParent) {
      const worldPosition = new THREE.Vector3();
      objectChildren.getWorldPosition(worldPosition);
      const lineWorldMatrix = objectChildren.matrixWorld.clone();
      const inverseTargetMatrix = objectParent.matrixWorld.invert();
      objectChildren.applyMatrix4(inverseTargetMatrix.multiply(lineWorldMatrix));

      objectParent.updateMatrixWorld(true);
      objectChildren.updateMatrixWorld(true);
    }

    objectParent.add(objectChildren);
  }

  updateLineGeometry(targetLine: Line2, points: number[]): void {
    const positions = targetLine.geometry.attributes.instanceStart?.array;
    if (!positions) {
      return;
    }

    positions[3] = points[0];
    positions[4] = points[1];
    positions[5] = points[2];
    targetLine.geometry.setPositions([...positions]);

    targetLine.geometry.attributes.instanceStart.needsUpdate = true;
  }

  setLabelRenderer(): CSS2DRenderer {
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    labelRenderer.domElement.style.pointerEvents = 'none';

    document.body.appendChild(labelRenderer.domElement);

    return labelRenderer;
  }
}

export default EnterDistanceService;
