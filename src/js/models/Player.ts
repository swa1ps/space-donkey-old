import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import playerModel from '../../assets/player.gltf';

import { getVelocityAfterFriction } from '../utils/math';
const RADIUS = 40;

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


export class Player{
  x: number;
  y: number;
  y2: number;
  vy: number;
  fy: number;
  ctx: CanvasRenderingContext2D

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.x = 30;
    this.y = 300;
    this.y2 = 0;
    this.vy = 0;
    this.fy = 1.07;
  }

  draw() {
    this.vy = getVelocityAfterFriction(this.vy, this.fy);
    let y = this.y + this.vy * 20;
    y = y > 600 ? 600 : y;
    y = y < 0 ? 0 : y;

    this.y = y;

    let y2 = this.y2 + this.vy * 0.9;
    y2 = y2 > 20 ? 20 : y2;
    y2 = y2 < -12 ? -12 : y2;
    this.y2 = y2;

    const ctx = this.ctx;
    ctx.save();

    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.arc(this.x, this.y, RADIUS, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.restore();
  }
}
