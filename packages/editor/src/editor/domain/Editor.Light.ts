import Editor from '../app';
import { basicHemisphereLight } from '../service/light';

class EditorLight {
  #Editor: Editor;
  constructor(editor: Editor) {
    this.#Editor = editor;
  }

  public init() {
    this.#setLight();
  }

  #setLight() {
    const { scene } = this.#Editor;
    scene.add(basicHemisphereLight());
  }
}

export default EditorLight;
