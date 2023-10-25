import * as THREE from 'three';
import Editor from '../app';

class EditorCamera {
  public readonly camera;
  #Editor: Editor;
  constructor(editor: Editor) {
    this.#Editor = editor;
    const { canvas } = editor;

    this.camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  }

  public init() {
    const camera = this.camera;

    camera.position.set(0.07, 7.5, 9.13);
    camera.rotation.set(-0.7, 0.01, 0.01);
  }
}

export default EditorCamera;
