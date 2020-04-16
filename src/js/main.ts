import { Player } from './models/Player';
import { PitchChart } from './models/PitchChart';
import { extrapolate } from './utils/math';
import { listenMic, stopStream } from './utils/audio';
import { Game } from './models/Game';
import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import playerModel from '../assets/player.gltf';
import meteoriteModel from '../assets/meteorite.gltf';

var loader = new GLTFLoader();

let camera: THREE.Camera;
let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let geometry: THREE.Geometry;
let material: THREE.Material;
let mesh: THREE.Mesh;
let meteorite: THREE.Mesh;

let player: Player;
let pitchChart: PitchChart;
let analyserNode: AnalyserNode;
let audioContext: AudioContext;
let micStream: MediaStream;
let stopButton: HTMLButtonElement;
let startButton: HTMLButtonElement;
let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let listenMicRef = null;
let game = new Game();

function onPitchChanged(pitch: number, clarity: number): void {
  if(pitch > 100 && pitch < 500 && clarity > 0.95) {
    if (pitch < game.min) game.min = pitch;
    if (pitch > game.max) game.max = pitch;
    const pitchValue = Math.abs(extrapolate(game.min, game.max, pitch));
    player.vy = 0.5 - pitchValue;
    pitchChart.addPitch({
      x: game.width,
      y: game.height - pitchValue * game.height,
      z: clarity,
      color: pitchValue * 255
    });
  }
}

function draw() {
  ctx.clearRect(0, 0, game.width, game.height);
  pitchChart.draw();
  player.draw();
  mesh.position.y = -1 * player.y2;
  if (meteorite){
    meteorite.rotation.x -= 0.004;
    meteorite.rotation.z += 0.005;
  }
  controls.update();
  renderer.render(scene, camera);
}

function loop() {
  draw();
  window.requestAnimationFrame(loop);
}

function init() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.shadowMap.enabled = true
  
  camera = new THREE.PerspectiveCamera(
      35,
      1, // window.innerWidth / window.innerHeight,
      0.1,
      5000
    );

    controls = new OrbitControls(camera, renderer.domElement);
    // camera.position.z = 2;

    camera.position.set(-68, 7, 0);
    // camera.rotation.set(-1.9, -1.5, -1.9);
    // controls.update();
    scene = new THREE.Scene();

    geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    material = new THREE.MeshNormalMaterial();
  
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = 0;
    mesh.position.z = -18;

    const axes = new THREE.AxesHelper();
    axes.material.depthTest = false;
    axes.renderOrder = 1;
    mesh.add(axes);

    const light = new THREE.AmbientLight(0xffffff, 0.5);
    light.position.set(0, 30, 30);
    scene.add(light);
  
    const light1 = new THREE.PointLight(0xffffff, 0.5);
    light1.position.set(0, 30, 30);
    scene.add(light1);
    
    const light2 = new THREE.PointLight(0xffffff, 0.5);
    light2.position.set(0, -30, -30);
    
    scene.add(light2);
    
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

        mesh.add(head, eye_r, eye_l, pupil_l, pupil_r, helmet, glass);
      },
      undefined,
      (error) => {
        console.error(error);
      }
    );

    loader.load(
      meteoriteModel,
      (gltf) => {
        meteorite = gltf.scene.children[0];
        meteorite.scale.set(5,5,5)
        meteorite.material = new THREE.MeshPhongMaterial({
          color: 0xFFFFFF,
        });

        scene.add(meteorite);
      },
      undefined,
      (error) => {
        console.error(error);
      }
    );
    
    scene.add(mesh);
    renderer.setSize(600, 600);
    const webgl = document.getElementById('webgl');
    webgl.appendChild(renderer.domElement);
}

document.addEventListener("DOMContentLoaded", () => {
  stopButton = <HTMLButtonElement>document.getElementById('stop');
  startButton = <HTMLButtonElement>document.getElementById('start');
  canvas = <HTMLCanvasElement>document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  player = new Player(ctx);
  pitchChart = new PitchChart(ctx);

  stopButton.onclick = () => {
    console.log('stop');
    console.log(camera);
    game.isListen = false;
    clearInterval(listenMicRef);
    stopStream(micStream);
  }

  startButton.onclick = e => {
    audioContext = new AudioContext();
    analyserNode = audioContext.createAnalyser();
    game.isListen = true;

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      console.log('start');
      micStream = stream;
      let sourceNode = audioContext.createMediaStreamSource(stream);
      sourceNode.connect(analyserNode);

      listenMicRef = listenMic(game.listenInterval, analyserNode, audioContext, onPitchChanged);
      init();
      loop();
    });
  }
});