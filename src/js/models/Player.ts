import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import playerModel from '../../assets/player2.gltf';
import { getVelocityAfterFriction } from '../utils/math';
let mixer: THREE.AnimationMixer;
let clock = new THREE.Clock();
let playerAnimations;
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
        console.log(gltf);
        const glass = model.children[0].children[9];
        glass.material = new THREE.MeshPhongMaterial({
          color: 0xFFFFFF,
          opacity: 0.3,
          transparent: true,
          skinning: true
        });

        group.add(model, glass);

        mixer = new THREE.AnimationMixer(group);

        playerAnimations = gltf.animations.reduce((acum, anim) => {
          anim.duration = 2.48;
          return {
            ...acum,
            [anim.name]: mixer.clipAction(anim)
          }
        }, {});
        playerAnimations['fly'].play();
        

        resolve(group);
      },
      undefined,
      (error) => {
        reject(error);
      }
    );
  });
}

function getMovingState(vy = 0): string {
  if (vy < 0) return 'moveUp';
  return vy > 0 ? 'moveDown' : 'fly';
}

export class Player {
  y: number;
  vy: number;
  fy: number;
  movingState = 'fly';

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

      const newMovingState = getMovingState(this.vy);
      if(newMovingState !== this.movingState) {
        // TODO: crossFade
        playerAnimations[this.movingState].stop();
        playerAnimations[newMovingState].play();
        this.movingState = newMovingState;
      }
    }
    let y = this.y + this.vy * 0.9;
    y = y > YMAX ? YMAX : y;
    y = y < YMIN ? YMIN : y;
    this.y = y;
  }
}
