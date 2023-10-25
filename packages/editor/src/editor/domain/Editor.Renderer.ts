import * as THREE from 'three';
import Editor from '../app';
import { IResizeService } from '../service/resize';

type Services = { ResizeService: IResizeService };
class EditorRenderer {
  public readonly renderer;
  #Editor: Editor;
  #Services: Services;

  constructor(editor: Editor, services: Services) {
    this.#Services = services;
    this.#Editor = editor;
    const { canvas } = editor;

    const renderer = (this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true }));
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio);
  }

  public init() {
    const editor = this.#Editor;
    const renderer = this.renderer;
    const { canvas, camera } = editor;

    editor.on('resize', () => {
      this.#Services.ResizeService.setResize(renderer, canvas, camera);
    });
  }

  public render() {
    const editor = this.#Editor;
    const { renderer, scene, camera } = editor;

    const animate = () => {
      renderer.render(scene, camera);
      editor.trigger('render', { type: 'render', target: editor });
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }
}

export default EditorRenderer;
