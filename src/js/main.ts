import { Player } from './Player';
import { PitchChart, Pitch } from './PitchChart';
import { extrapolate } from './math';
import { listenMic } from './audio';
import { Game } from './Game';

let player: Player;
let pitchChart: PitchChart;
let analyserNode: AnalyserNode;
let audioContext: AudioContext;
let micStream: MediaStream;
let stopButton: HTMLButtonElement;
let startButton: HTMLButtonElement;
let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let pitchList:Pitch[] = [];
let listenMicRef = null;
let vy = 0;
let fy = 1.03;
let game = new Game();

function getVelocityAfterFriction(velocity: number, friction: number): number {
  return velocity > -0.01 && velocity < 0.01 ? 0 : velocity / friction;
}

function getNewPitchList(pitchList: Pitch[], speed: number): Pitch[]{
  return pitchList
    .map(({x, y, z, color}) => ({ x: x - speed, y, z, color }))
    .filter(({ x }) => x > -20);
}

function onPitchChanged(pitch: number, clarity: number): void {
  if(pitch > 100 && pitch < 500 && clarity > 0.95) {
    if (pitch < game.min) game.min = pitch;
    if (pitch > game.max) game.max = pitch;
    const pitchValue = Math.abs(extrapolate(game.min, game.max, pitch));
    vy = 0.5 - pitchValue;
    pitchList.push({
      x: game.width,
      y: game.height - pitchValue * game.height,
      z: clarity,
      color: pitchValue * 255
    });
  }
}

function draw() {
  ctx.clearRect(0, 0, game.width, game.height);

  vy = getVelocityAfterFriction(vy, fy);

  if(game.isListen){
    pitchList = getNewPitchList(pitchList, game.speed);
  }

  pitchChart.draw(pitchList);
  player.updatePosition(vy, game.height);
  player.draw();
}

function loop() {
  draw();
  window.requestAnimationFrame(loop);
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
    micStream.getAudioTracks().forEach(track => {
      track.stop();
    });
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
      loop();
    });
  }
});