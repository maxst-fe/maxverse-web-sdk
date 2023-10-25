import * as THREE from 'three';

export const getRootObject = (object: THREE.Object3D<THREE.Event>) => {
  let parent = object.parent;

  let target = object;

  while (parent) {
    if (parent.type === 'Scene') {
      return target;
    }

    if (!parent) {
      return null;
    }

    target = parent;
    parent = parent.parent;
  }
};
