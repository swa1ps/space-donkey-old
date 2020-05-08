import * as THREE from "three";
import { initScene, updateUniforms } from '../models/Scene';
import { loadPlayerModel } from '../models/Player';
import { loadMeteoriteModel, enemiesController } from '../models/Enemy';
import { Player } from '../models/Player';

const MAX_ASPECT = 2.165;

let optimizedResize = (function() {
  let callbacks = [],
      running = false;
  // fired on resize event
  function resize() {
      if (!running) {
          running = true;

          if (window.requestAnimationFrame) {
              window.requestAnimationFrame(runCallbacks);
          } else {
              setTimeout(runCallbacks, 66);
          }
      }
  }
  // run the actual callbacks
  function runCallbacks() {
      callbacks.forEach(function(callback) {
          callback();
      });
      running = false;
  }

  // adds callback to loop
  function addCallback(callback) {
      if (callback) {
          callbacks.push(callback);
      }
  }

  return {
      // public method to add additional callback
      add: function(callback) {
          if (!callbacks.length) {
              window.addEventListener('resize', resize);
          }
          addCallback(callback);
      }
  }
}());


export class DrawController {
  width: number;
  height: number;
  aspect = 0.48;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  playerModel: THREE.Group;
  meteorite: THREE.Mesh;
  player: Player

  constructor(player: Player) {
    // const aspect = window.innerWidth / window.innerHeight;
    this.aspect = MAX_ASPECT; //aspect < MAX_ASPECT ? aspect : MAX_ASPECT;
    this.setSize(window.innerWidth);
    this.player = player;

    optimizedResize.add(() => {
      this.setSize(window.innerWidth);
      if (this.renderer) {
        this.renderer.setSize(this.width, this.height);
        this.camera.updateProjectionMatrix();
      }
    });
  }

  setSize = (width: number) => {
    this.width = width;
    this.height = width / this.aspect;
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

    this.camera.position.z = 140;

    this.scene = new THREE.Scene();
    initScene(this.scene);

    this.scene.add(this.playerModel);
    this.renderer.setSize(this.width, this.height);
  }

  draw = () => {
    this.playerModel.position.y = -1 * this.player.y;
    updateUniforms();
    enemiesController(this.scene, this.playerModel.position.y, this.meteorite);
    this.renderer.render(this.scene, this.camera);
  }
}