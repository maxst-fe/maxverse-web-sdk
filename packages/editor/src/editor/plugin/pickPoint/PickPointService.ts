import * as THREE from 'three';
import { Points } from 'three';
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import PickPoint from './PickPoint';

class PickPointService {
  #PickPoint: PickPoint;
  constructor(PickPoint: PickPoint) {
    this.#PickPoint = PickPoint;
  }

  public setLabelRenderer(width: number, height: number): CSS2DRenderer {
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(width, height);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    labelRenderer.domElement.style.pointerEvents = 'none';

    console.log(labelRenderer);

    document.body.querySelector('#canvas-wrapper')?.appendChild(labelRenderer.domElement);

    return labelRenderer;
  }

  public makeSphere() {
    const sphereGeometry = new THREE.SphereGeometry(0.1, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

    sphere.name = this.#PickPoint.SPHERE_NAME;
    sphere.visible = false;

    return sphere;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public makeMeasurementLabel(innerText: string, _object: THREE.Object3D): CSS2DObject {
    const measurementDiv = document.createElement('div') as HTMLDivElement;
    measurementDiv.className = 'measurementLabel';
    measurementDiv.style.color = 'white';
    measurementDiv.innerText = innerText;
    const measurementLabel = new CSS2DObject(measurementDiv);

    return measurementLabel;
  }

  public findPointObject(scene: THREE.Scene) {
    for (let i = 0; i < scene.children.length; i++) {
      const target = scene.children[i];

      if (target instanceof Points) {
        return target;
      }
    }

    return null;
  }
}

export default PickPointService;
