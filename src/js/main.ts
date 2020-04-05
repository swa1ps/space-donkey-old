import { Player } from './models/Player';
import { PitchChart } from './models/PitchChart';
import { extrapolate } from './utils/math';
import { listenMic, stopStream } from './utils/audio';
import { Game } from './models/Game';
import * as THREE from "three";

let camera, scene, renderer;
let geometry, material, mesh;

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
  mesh.rotation.x += 0.01;
  mesh.rotation.y += 0.02;

  mesh.position.y = -1 * player.y2;

  renderer.render(scene, camera);
}

function loop() {
  draw();
  window.requestAnimationFrame(loop);
}

function init() {
    camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      10
    );
    camera.position.z = 2;
  
    scene = new THREE.Scene();
  
    geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    material = new THREE.MeshNormalMaterial();
  
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = -1.5;

    scene.add(mesh);
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true
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