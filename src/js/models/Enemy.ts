import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import meteoriteModel from '../../assets/meteorite.gltf';
import { interpolate } from '../utils/math';

const loader = new GLTFLoader();
let enemies = [];

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

function createEnemyFrom(mesh: THREE.Mesh, y: number) {
  const size = interpolate(2, 5, Math.random());
  const newEnemy = mesh.clone();
  newEnemy.position.x = 100;
  newEnemy.position.y = y;
  console.log(newEnemy.position);
  newEnemy.scale.set(size, size, size);
  return newEnemy;
}

export function enemiesController(
  scene: THREE.Scene,
  y: number,
  meteorite: THREE.Mesh,
): void {
  enemies.forEach(enemy => {
    enemy.rotation.x -= 0.05;
    enemy.rotation.z += 0.01;
    enemy.rotation.y += 0.02;

    enemy.position.x -= 0.6;
  });

  enemies = enemies.filter(enemy => {
    if (enemy.position.x > -80) {
      return true;
    } else {
      scene.remove(enemy);
      return false;
    }
  });

  if (meteorite && !enemies.length) {
    const enemy = createEnemyFrom(meteorite, y)
    enemies.push(enemy);
    scene.add(enemy);
  }
}