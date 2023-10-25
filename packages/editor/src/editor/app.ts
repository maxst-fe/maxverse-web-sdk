import * as THREE from 'three';

import EditorCamera from './domain/Editor.Camera';
import EditorEvent from './domain/Editor.Event';
import EditorRenderer from './domain/Editor.Renderer';
import EditorScene from './domain/Editor.Scene';

import Component from '@egjs/component';
import EditorControl from './domain/Editor.Control';
import EditorGeometry from './domain/Editor.Geometry';
import EditorLight from './domain/Editor.Light';
import EditorStorage from './domain/Editor.Storage';
import EditorUpload from './domain/Editor.Upload';
import { Events } from './type/events';

import { BasePluginType } from './plugin/plugin.type';
import { OrbitControlService, TransformControlService } from './service/control';
import ObjectClickService from './service/control/ObjectClickService';
import { GeometryService, GridService } from './service/geometry';
import { ObjectLoaderService } from './service/loader';
import { ResizeService } from './service/resize';
import { IndexedDBService } from './service/storage';
import FileUploadService from './service/upload/FileUploadService';

interface Props {
  canvas: HTMLCanvasElement;
}

class Editor extends Component<Events> {
  //core components
  public readonly EditorCamera: EditorCamera;
  public readonly EditorScene: EditorScene;
  public readonly EditorRenderer: EditorRenderer;
  public readonly EditorEvent: EditorEvent;
  public readonly EditorControl: EditorControl;
  public readonly EditorStorage: EditorStorage;
  public readonly EditorUpload: EditorUpload;
  public readonly EditorLight: EditorLight;
  public readonly EditorGeometry: EditorGeometry;

  //staff
  public readonly canvas: HTMLCanvasElement;
  public readonly camera: THREE.PerspectiveCamera;
  public readonly renderer: THREE.WebGLRenderer;
  public readonly scene: THREE.Scene;
  public readonly plugins: BasePluginType[] = [];

  constructor({ canvas }: Props) {
    super();
    this.canvas = canvas;

    // setting core
    const editorCamera = (this.EditorCamera = new EditorCamera(this));
    const editorScene = (this.EditorScene = new EditorScene(this));
    const editorRenderer = (this.EditorRenderer = new EditorRenderer(this, { ResizeService: new ResizeService() }));

    const scene = (this.scene = editorScene.scene);
    const camera = (this.camera = editorCamera.camera);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const renderer = (this.renderer = editorRenderer.renderer);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const editorEvent = (this.EditorEvent = new EditorEvent(this));

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const editorControl = (this.EditorControl = new EditorControl(this, {
      TransformControlService: new TransformControlService({ camera, canvas, scene }),
      OrbitControlService: new OrbitControlService({ camera, canvas }),
      ObjectClickService: new ObjectClickService(),
    }));

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const editorStorage = (this.EditorStorage = new EditorStorage(this, { IndexedDBService: new IndexedDBService() }));

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const editorUpload = (this.EditorUpload = new EditorUpload(this, {
      ObjectLoader: new ObjectLoaderService(),
      FileUploadService: new FileUploadService(),
    }));

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const editorLight = (this.EditorLight = new EditorLight(this));

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const editorGeometry = (this.EditorGeometry = new EditorGeometry(this, {
      GeometryService: new GeometryService(),
      GridService: new GridService(),
    }));
  }

  public async init() {
    this.EditorCamera.init();
    this.EditorScene.init();
    this.EditorRenderer.init();
    this.EditorEvent.init();
    this.EditorControl.init();
    this.EditorStorage.init();
    this.EditorUpload.init();
    this.EditorLight.init();
    this.EditorGeometry.init();

    this.trigger('ready', { type: 'ready', target: this });
    this.trigger('resize', { type: 'resize', target: this });
    this.EditorRenderer.render();
  }

  public async loadPLY(arrayBuffer: ArrayBuffer) {
    return this.EditorUpload.loadPLY(arrayBuffer);
  }

  /**
   * set object controller (transformControls) with translate, rotate, scale.
   * @param mode
   */
  public setTransformMode(mode: 'translate' | 'rotate' | 'scale') {
    return this.EditorControl.setTransformMode(mode);
  }

  /**
   * remove clicked object by transform controller.
   */
  public deleteObject() {
    return this.EditorControl.removeClickedObject();
  }

  /**
   * remove Editor
   */
  public remove() {
    this.trigger('remove', { type: 'remove', target: this });
    this.plugins.forEach(plugin => {
      plugin.remove();
    });
  }

  public plugin(plugins: BasePluginType[]) {
    plugins.forEach(plugin => {
      plugin.init();
      this.plugins.push(plugin);
    });
  }
}

export default Editor;
