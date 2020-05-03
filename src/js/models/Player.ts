import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import playerModel from '../../assets/player.gltf';
let mixer: THREE.AnimationMixer;
let clock = new THREE.Clock();
import { getVelocityAfterFriction } from '../utils/math';

const YMAX = 50;
const YMIN = -18;

const loader = new GLTFLoader();

export async function loadPlayerModel(): Promise<THREE.Group> {
  return new Promise((resolve, reject) => {
    loader.load(
      playerModel,
      (gltf) => {
        const group = new THREE.Group();
        const model = gltf.scene;

        const glass = model.children[0].children[9];
        glass.material = new THREE.MeshPhongMaterial({
          color: 0xFFFFFF,
          opacity: 0.3,
          transparent: true,
          skinning: true
        });

        group.add(model, glass);

        mixer = new THREE.AnimationMixer(group);
        const flyAnimation = mixer.clipAction(gltf.animations[0]);
        flyAnimation.play();
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
    this.y = (YMIN + YMAX) / 2;
    this.vy = 0;
    this.fy = 1.07;
  }

  draw() {
    this.vy = getVelocityAfterFriction(this.vy, this.fy);
    if(mixer){
      const dt = clock.getDelta();
      mixer.update(dt);
    }
    let y = this.y + this.vy * 0.9;
    y = y > YMAX ? YMAX : y;
    y = y < YMIN ? YMIN : y;
    this.y = y;
  }
}
