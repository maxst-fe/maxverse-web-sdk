import * as THREE from "three";

export interface IGridService {
  setGrid(scene: THREE.Scene, option: { gridGroupName: string }): void;
}

class GridService implements IGridService {
  public setGrid(scene: THREE.Scene, { gridGroupName = "" } = {}) {
    const gridGroup = new THREE.Group();
    const grid = this.#makeGrid();

    gridGroup.name = gridGroupName;
    gridGroup.add(grid);

    scene.add(gridGroup);
  }

  #makeGrid(size = 30, divisions = 30, color1 = 0x888888, color2 = "") {
    const grid = new THREE.GridHelper(size, divisions, color1, color2);
    grid.name = "GridHelper";
    grid.material.color.setHex(color1);
    grid.material.vertexColors = false;

    return grid;
  }
}

export default GridService;
