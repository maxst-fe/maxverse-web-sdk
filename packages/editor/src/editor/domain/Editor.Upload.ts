import { Scene } from 'three';
import Editor from '../app';
import { IObjectLoader } from '../service/loader';
import { IFileUploadService } from '../service/upload';

type Services = {
  ObjectLoader: IObjectLoader;
  FileUploadService: IFileUploadService;
};

class EditorUpload {
  public readonly scene: Scene;
  #Editor: Editor;
  #Services: Services;

  constructor(editor: Editor, services: Services) {
    this.#Editor = editor;
    this.#Services = services;
    this.scene = editor.scene;
  }

  public init() {
    this.#setDragDropUploadEvent();
    this.#setDragOverEvent();
  }

  public async loadPLY(arrayBuffer: ArrayBuffer) {
    const ply = await this.#Services.ObjectLoader.plyLoad(arrayBuffer);

    this.scene.add(ply);

    return ply;
  }

  #setDragDropUploadEvent() {
    const { scene } = this.#Editor;
    const editor = this.#Editor;
    const fileUploadService = this.#Services.FileUploadService;

    document.addEventListener('drop', async event => {
      event.preventDefault();

      if (!event.dataTransfer || !event.dataTransfer.items) {
        return;
      }

      try {
        fileUploadService.checkValidFile(event);

        editor.EditorEvent.eventTrigger('load_start', {
          type: 'folder_drop',
          target: editor,
          loadStartData: event.dataTransfer.items,
        });

        editor.trigger('load_start', { type: 'folder_drop', target: editor, loadStartData: event.dataTransfer.items });

        const { files } = await fileUploadService.getFilesFromItemList(event.dataTransfer.items);
        const object = await this.#fileLoad(files);
        scene.add(object);

        editor.trigger('load', { type: 'folder_drop', target: editor, id: object.uuid, loadData: files });
        editor.EditorStorage.save(files, object.uuid);
      } catch (e) {
        console.log(e);
      }
    });
  }

  async #fileLoad(files: File[]) {
    const objectGroup = await this.#Services.ObjectLoader.objectLoadAsFolder(files);

    if (!objectGroup) {
      this.#Editor.trigger('load_fail', { type: 'folder_drop', target: this.#Editor });

      throw 'load_fail';
    }

    if (objectGroup.children.length) {
      return objectGroup.children[0];
    }

    return objectGroup;
  }

  #setDragOverEvent() {
    document.addEventListener('dragover', event => {
      event.preventDefault();

      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'copy';
      }
    });
  }
}

export default EditorUpload;
