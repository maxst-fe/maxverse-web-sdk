import Editor from '../app';
import { GRID_HELPER_GROUP } from '../constants/name';
import { IGeometryService, IGridService } from '../service/geometry';

type Services = { GridService: IGridService; GeometryService: IGeometryService };

class EditorGeometry {
  #Editor: Editor;
  #Services: Services;

  constructor(editor: Editor, services: Services) {
    this.#Editor = editor;
    this.#Services = services;
  }

  public init() {
    const { scene } = this.#Editor;

    this.#Services.GridService.setGrid(scene, { gridGroupName: GRID_HELPER_GROUP });
    // this.#Services.GeometryService.setCube(scene);
  }
}

export default EditorGeometry;
