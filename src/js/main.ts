import { Player } from './Player';
import { PitchChart, Pitch } from './PitchChart';
import { extrapolate } from './math';
import { listenMic } from './audio';

let player: Player;
let pitchChart: PitchChart;
let analyserNode: AnalyserNode;
let audioContext: AudioContext;
let micStream: MediaStream;
let pitchElement: HTMLDivElement;
let clarityElement: HTMLDivElement;
let minmaxElement: HTMLDivElement;
let stopButton: HTMLButtonElement;
let startButton: HTMLButtonElement;
let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let pitchList:Pitch[] = [];
let min = 180;
let max = 250;
let speed = 5;
let isStarted = false;
let width = 600;
let height = 600;
let recInterval = 100;
let listenMicRef = null;
let vy = 0;
let fy = 1.03;
let y = 300;

function getVelocityAfterFriction(velocity: number, friction: number): number {
  return velocity > -0.01 && velocity < 0.01 ? 0 : velocity / friction;
}

function getNewPitchList(pitchList: Pitch[], speed: number): Pitch[]{
  return pitchList
    .map(({x, y, z, color}) => ({ x: x - speed, y, z, color }))
    .filter(({ x }) => x > -20);
}

function getNewPosition(y: number, velocity: number, height:number): number {
  y = y + velocity * 20;
  y = y > height ? height : y;
  y = y < 0 ? 0 : y;

  return y;
}

function onPitchChanged(pitch: number, clarity: number): void {
  pitchElement.textContent = String(pitch);
  clarityElement.textContent = String(clarity);

  if(pitch > 100 && pitch < 500 && clarity > 0.95) {
    if (pitch < min) min = pitch;
    if (pitch > max) max = pitch;
    const pitchValue = Math.abs(extrapolate(min, max, pitch));
    vy = 0.5 - pitchValue;
    pitchList.push({
      x: 600,
      y: height - pitchValue * height,
      z: clarity,
      color: pitchValue * 255
    });

    minmaxElement.textContent = `pitch: ${Math.round(min)} - ${Math.round(max)}, avg: ${Math.round(min + max) / 2}`;
  }
}

function draw() {
  ctx.clearRect(0, 0, width, height);

  vy = getVelocityAfterFriction(vy, fy);

  y = getNewPosition(y, vy, height);

  if(isStarted){
    pitchList = getNewPitchList(pitchList, speed);
  }

  pitchChart.draw(pitchList);
  player.draw(50, y);
}

function loop() {
  draw();
  window.requestAnimationFrame(loop);
}

document.addEventListener("DOMContentLoaded", () => {
  pitchElement = <HTMLDivElement>document.getElementById('pitch');
  clarityElement = <HTMLDivElement>document.getElementById('clarity');
  stopButton = <HTMLButtonElement>document.getElementById('stop');
  startButton = <HTMLButtonElement>document.getElementById('start');
  minmaxElement = <HTMLDivElement>document.getElementById('minmax');
  canvas = <HTMLCanvasElement>document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  player = new Player(ctx);
  pitchChart = new PitchChart(ctx);

  stopButton.onclick = () => {
    console.log('stop');
    isStarted = false;
    clearInterval(listenMicRef);
    micStream.getAudioTracks().forEach(track => {
      track.stop();
    });
  }

  startButton.onclick = e => {
    audioContext = new AudioContext();
    analyserNode = audioContext.createAnalyser();
    isStarted = true;

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      console.log('start');
      minmaxElement.textContent = `pitch: ${min} - ${max}`;
      micStream = stream;
      let sourceNode = audioContext.createMediaStreamSource(stream);
      sourceNode.connect(analyserNode);

      listenMicRef = listenMic(recInterval, analyserNode, audioContext, onPitchChanged);
      loop();
    });
  }
});