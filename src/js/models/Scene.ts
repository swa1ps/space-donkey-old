import * as THREE from "three";

export function initScene(scene: THREE.Scene) {
  const light = new THREE.AmbientLight(0xffffff, 0.5);
  light.position.set(0, 30, 30);
  scene.add(light);

  const light1 = new THREE.PointLight(0xffffff, 0.5);
  light1.position.set(0, 30, 30);
  scene.add(light1);
  
  const light2 = new THREE.PointLight(0xffffff, 0.5);
  light2.position.set(0, -30, -30);
  
  scene.add(light2);
}