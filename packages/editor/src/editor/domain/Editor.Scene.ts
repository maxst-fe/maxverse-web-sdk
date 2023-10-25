import * as THREE from 'three';
import Editor from '../app';

class EditorScene {
  public readonly scene;
  #Editor: Editor;

  constructor(editor: Editor) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const scene = (this.scene = this.#setScene());

    this.#Editor = editor;
  }

  public init() {
    console.log('Scene init');
  }

  #setScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#373737');

    return scene;
  }
}

export default EditorScene;
