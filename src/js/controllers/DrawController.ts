import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { initScene } from '../models/Scene';
import { loadPlayerModel } from '../models/Player';
import { loadMeteoriteModel, enemiesController } from '../models/Enemy';
import { Player } from '../models/Player';

const MAX_ASPECT = 2.165;
export class DrawController {
  width: number;
  height: number;
  aspect = 0.48;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  geometry: THREE.Geometry;
  material: THREE.Material;
  mesh: THREE.Mesh;
  meteorite: THREE.Mesh;
  player: Player

  constructor(player: Player) {
    const aspect = window.innerWidth / window.innerHeight;
    this.aspect = aspect < MAX_ASPECT ? aspect : MAX_ASPECT;
    this.width = window.innerWidth;
    this.height = window.innerWidth / this.aspect;
    this.player = player;
  }

  init = async () => {
    const canvas = document.getElementById('webgl') as HTMLCanvasElement;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.shadowMap.enabled = true
    console.log(this.aspect, this.width / this.height);
    this.camera = new THREE.PerspectiveCamera(
        35,
        this.aspect,
        0.1,
        5000
      );

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.camera.position.set(-80, 7, 0);
    this.controls.update();
    this.scene = new THREE.Scene();

    this.geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    this.material = new THREE.MeshNormalMaterial();
  
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.x = 70;
    this.mesh.position.z = -65;

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
    this.renderer.setSize(this.width, this.height);
  }

  draw = () => {
    this.mesh.position.y = -1 * this.player.y;
  
    enemiesController(this.scene, this.mesh, this.meteorite);
  
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}