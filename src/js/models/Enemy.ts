import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import meteoriteModel from '../../assets/meteorite.gltf';
import { interpolate } from '../utils/math';

const loader = new GLTFLoader();

export async function loadMeteoriteModel(loadingCallback): Promise<THREE.Mesh> {
  return new Promise((resolve, reject) => {
    loader.load(
      meteoriteModel,
      (gltf) => {
        const meteorite = gltf.scene.children[0] as THREE.Mesh;
        meteorite.material = new THREE.MeshPhongMaterial({
          color: 0xFFFFFF,
        });
        resolve(meteorite);
      },
      loadingCallback,
      (error) => {
        reject(error);
      }
    );
  });
}

export class Enemy {
  scene: THREE.Scene;
  mesh: THREE.Mesh;
  size: number;
  isDead = false;
  isHidden = false;
  rafId: number = null;

  constructor(mesh: THREE.Mesh, size: number = 1, scene: THREE.Scene) {
    this.scene = scene;
    this.mesh = mesh.clone();
    this.mesh.material = mesh.material.clone();
    this.mesh.scale.set(size, size, size);
  }

  agony = () => {
    this.mesh.material.opacity -= 0.1;
    if(this.mesh.material.opacity <= 0) {
      window.cancelAnimationFrame(this.rafId);
      this.isHidden = true;
    }
    window.requestAnimationFrame(this.agony)
  }

  kill = () => {
    this.isDead = true;
    this.mesh.material.transparent = true;
    this.mesh.material.color.setHex(0xFF0000);
    this.rafId = window.requestAnimationFrame(this.agony);
  }

  remove = () => {
    this.scene.remove(this.mesh);
  }
}

export let enemies:Enemy[] = [];

function createEnemyFrom(mesh: THREE.Mesh, y: number, scene: THREE.Scene): Enemy {
  const size = interpolate(2, 5, Math.random());
  const newEnemy = new Enemy(mesh, size, scene);
  newEnemy.mesh.position.x = 100;
  newEnemy.mesh.position.y = y;
  return newEnemy;
}

export function enemiesController(
  scene: THREE.Scene,
  y: number,
  meteorite: THREE.Mesh,
  enemyDeadCallback,
): void {
  enemies.forEach(enemy => {
    enemy.mesh.rotation.x -= 0.05;
    enemy.mesh.rotation.z += 0.01;
    enemy.mesh.rotation.y += 0.02;

    enemy.mesh.position.x -= 1.6;
  });

  enemies = enemies.filter(enemy => {
    if (!enemy.isHidden && enemy.mesh.position.x > -100) {
      return true;
    } else {
      scene.remove(enemy.mesh);
      if(enemy.mesh.position.x < -100){
        enemyDeadCallback()
      }
      return false;
    }
  });

  if (meteorite && !enemies.length) {
    const enemy = createEnemyFrom(meteorite, y, scene)
    enemies.push(enemy);
    scene.add(enemy.mesh);
  }
}

