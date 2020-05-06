import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { initScene, updateUniforms } from '../models/Scene';
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
  playerModel: THREE.Group;
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
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.camera = new THREE.PerspectiveCamera(
        35,
        this.aspect,
        0.1,
        5000
      );

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.camera.position.z = 140;
    this.controls.update();

    // TODO: remove
    window.cam = this.camera;

    this.scene = new THREE.Scene();
    initScene(this.scene);

    try {
      const playerModel = await loadPlayerModel();
      this.playerModel = playerModel;
    } catch (error) {
      console.log(error);
    }

    try {
      this.meteorite = await loadMeteoriteModel();
    } catch (error) {
      console.log(error);
    }
    this.scene.add(this.playerModel);
    this.renderer.setSize(this.width, this.height);
  }

  draw = () => {
    this.playerModel.position.y = -1 * this.player.y;
    updateUniforms();
    enemiesController(this.scene, this.playerModel.position.y, this.meteorite);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}