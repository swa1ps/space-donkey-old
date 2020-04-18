import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { initScene } from '../models/Scene';
import { loadPlayerModel } from '../models/Player';
import { loadMeteoriteModel, enemiesController } from '../models/Enemy';
import { Player } from '../models/Player';

export class DrawController {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.Camera;
  controls: OrbitControls;
  geometry: THREE.Geometry;
  material: THREE.Material;
  mesh: THREE.Mesh;
  meteorite: THREE.Mesh;
  player: Player

  constructor(player: Player) {
    this.player = player;
  }

  init = async () => {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.shadowMap.enabled = true
    
    this.camera = new THREE.PerspectiveCamera(
        35,
        1, // window.innerWidth / window.innerHeight,
        0.1,
        5000
      );

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.camera.position.set(-68, 7, 0);
    this.controls.update();
    this.scene = new THREE.Scene();

    this.geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    this.material = new THREE.MeshNormalMaterial();
  
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.x = 0;
    this.mesh.position.z = -18;

    const axes = new THREE.AxesHelper();
    axes.material.depthTest = false;
    axes.renderOrder = 1;
    this.mesh.add(axes);

    initScene(this.scene);

    try {
      const playerModel = await loadPlayerModel();
      this.mesh.add(playerModel);
    } catch (error) {
      console.log(error);
    }

    try {
      this.meteorite = await loadMeteoriteModel();
    } catch (error) {
      console.log(error);
    }

    this.scene.add(this.mesh);
    this.renderer.setSize(600, 600);
    const webgl = document.getElementById('webgl');
    webgl.appendChild(this.renderer.domElement);
  }

  draw = () => {
    this.mesh.position.y = -1 * this.player.y2;
  
    enemiesController(this.scene, this.mesh, this.meteorite);
  
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}