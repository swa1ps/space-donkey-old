import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import playerModel from '../../assets/player.gltf';

import { getVelocityAfterFriction } from '../utils/math';

const YMAX = 20;
const YMIN = -12;

const loader = new GLTFLoader();

export async function loadPlayerModel(): Promise<THREE.Group> {
  return new Promise((resolve, reject) => {
    loader.load(
      playerModel,
      (gltf) => {
        const head = gltf.scene.children[0];
        const eye_r = gltf.scene.children[1];
        const eye_l = gltf.scene.children[2];
        const pupil_l = gltf.scene.children[3];
        const pupil_r = gltf.scene.children[4];
        const helmet = gltf.scene.children[5];
        const glass = gltf.scene.children[6];
  
        glass.material = new THREE.MeshPhongMaterial({
          color: 0xFFFFFF,
          opacity: 0.5,
          transparent: true,
        });
        const group = new THREE.Group();
        group.add(head, eye_r, eye_l, pupil_l, pupil_r, helmet, glass);
        resolve(group);
      },
      undefined,
      (error) => {
        reject(error);
      }
    );
  });
}


export class Player {
  y: number;
  vy: number;
  fy: number;

  constructor() {
    this.y = 0;
    this.vy = 0;
    this.fy = 1.07;
  }

  draw() {
    this.vy = getVelocityAfterFriction(this.vy, this.fy);

    let y = this.y + this.vy * 0.9;
    y = y > YMAX ? YMAX : y;
    y = y < YMIN ? YMIN : y;
    this.y = y;
  }
}
