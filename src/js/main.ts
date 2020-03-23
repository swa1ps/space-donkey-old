import { Player } from './Player';
import { PitchChart } from './PitchChart';
import { extrapolate } from './math';
import { listenMic, stopStream } from './audio';
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
      loop();
    });
  }
});