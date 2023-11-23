import * as THREE from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';

export interface IObjectLoader {
  /**
   * 파일 로드
   * @param files
   * @param filesMap
   */
  objectLoadAsFolder(files: File[]): Promise<any>;

  plyLoad(arrayBuffer: ArrayBuffer): Promise<THREE.Points>;
}

class ObjectLoaderService implements IObjectLoader {
  public plyLoad(arrayBuffer: ArrayBuffer): Promise<THREE.Points> {
    const plyLoader = new PLYLoader();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return new Promise((resolve, _reject) => {
      const bufferGeometry = plyLoader.parse(arrayBuffer);

      bufferGeometry.computeVertexNormals();

      const material = new THREE.PointsMaterial({
        alphaTest: 0.5,
        sizeAttenuation: false,
        vertexColors: true,
        transparent: true,
      });
      const pointModel = new THREE.Points(bufferGeometry, material);

      pointModel.scale.set(0.1, 0.1, 0.1);

      pointModel.rotation.x = -1.5;

      resolve(pointModel);
    });
  }
  /**
   * mtl파일이 포함된 obj 파일 형식을 로드
   * @param files
   * @param filesMap
   */
  async objectLoadAsFolder(files: File[]) {
    const { type, textureImages, index3DFiles } = this.#getFileFormat(files);

    if (type === 'glb') {
      return await this.#glbLoad(index3DFiles);
    }

    if (type === 'mtl' || type === 'obj') {
      return await this.#mtlLoad(index3DFiles, textureImages);
    }

    if (type === 'ply') {
      return await this.#plyLoad(index3DFiles);
    }
  }

  async #plyLoad(index3DFiles: { [p: string]: File }): Promise<THREE.Points> {
    const plyLoader = new PLYLoader();
    const plyFile = index3DFiles['ply'];

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return new Promise((resolve, _reject) => {
      plyFile.arrayBuffer().then(res => {
        const bufferGeometry = plyLoader.parse(res);

        bufferGeometry.computeVertexNormals();

        const material = new THREE.PointsMaterial({
          alphaTest: 0.5,
          sizeAttenuation: false,
          vertexColors: true,
          transparent: true,
        });
        const coupleModel = new THREE.Points(bufferGeometry, material);

        coupleModel.rotation.x = -1.5;

        resolve(coupleModel);
      });
    });
  }

  async #mtlLoad(index3DFiles: { [p: string]: File }, textureImages: { [p: string]: File }) {
    const mtlString = await index3DFiles['mtl'].text();
    const objString = await index3DFiles['obj'].text();
    const mtlLoader = new MTLLoader();
    const objLoader = new OBJLoader();

    const materials = mtlLoader.parse(mtlString, '');

    mtlLoader.manager.setURLModifier(url => {
      url = url.replace(/^(\.?\/)/, ''); // remove './'

      const blob = textureImages[url];

      if (blob) {
        return URL.createObjectURL(blob);
      }

      return '/';
    });

    materials.preload();

    const object = objLoader.setMaterials(materials).parse(objString);

    return object;
  }

  async #glbLoad(index3DFiles: { [p: string]: File }): Promise<THREE.Group> {
    const gltfLoader = new GLTFLoader();
    const glbFile = index3DFiles['glb'];
    const dracoLoader = new DRACOLoader();

    dracoLoader.setDecoderPath('/public/draco/');
    gltfLoader.setDRACOLoader(dracoLoader);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return new Promise((resolve, _reject) => {
      glbFile.arrayBuffer().then(res => {
        gltfLoader.parse(res, '', gltf => {
          resolve(gltf.scene);
        });
      });
    });
  }

  #filterFiles(files: File[]) {
    const textureImages = {} as { [p: string]: File };
    const index3DFiles = {} as { [p: string]: File };

    files.forEach(file => {
      const splitName = file.name.split('.');
      const fileName = splitName[splitName.length - 1];

      if (fileName === 'jpg' || fileName === 'png' || fileName === 'jpeg') {
        textureImages[file.name] = file;
      }

      if (fileName === 'mtl') {
        index3DFiles['mtl'] = file;
      }

      if (fileName === 'obj') {
        index3DFiles['obj'] = file;
      }

      if (fileName === 'glb') {
        index3DFiles['glb'] = file;
      }

      if (fileName === 'ply') {
        index3DFiles['ply'] = file;
      }
    });

    return { textureImages, index3DFiles };
  }

  #getFileFormat(files: File[]) {
    const { index3DFiles, textureImages } = this.#filterFiles(files);

    return { type: Object.keys(index3DFiles)[0], textureImages, index3DFiles };
  }
}

export default ObjectLoaderService;
