import { findPitch } from 'pitchy';
import { extrapolate } from './math';
import { Player } from './Player';

let player;
let analyserNode;
let audioContext;
let micStream;
let pitchElement;
let clarityElement;
let minmaxElement;
let stopButton;
let startButton;
let canvas;
let ctx;
let pitchList = [];
let min = 180;
let max = 250;
let speed = 5;
let isStarted = false;
let width = 600;
let height = 600;
let recInterval = 100;
let velocity = 0;
let friction = 10;
let y = 300;

function draw() {
  ctx.clearRect(0, 0, width, height);

  ctx.beginPath();
  ctx.moveTo(0, height/2);
  ctx.lineTo(width, height/2);
  ctx.stroke();

  if (velocity !== 0) {
    velocity = velocity < 0 ? velocity + friction : velocity - friction;
  }

  y = y + velocity * 0.05;
  if (y > height) {
    y = height;
  }
  if (y < 0) {
    y = 0;
  }

  player.draw(50, y);

  if(isStarted){
    pitchList = pitchList
      .map(({x, y, z, color}) => ({ x: x - speed, y, z, color }))
      .filter(({ x }) => x > -20);
  }
  ctx.beginPath();
  pitchList.forEach(({x, y , z, color}) => {
    const k = z ? z : 0;
    const size = 10 * k;
    ctx.fillStyle = `rgb(255, ${color}, ${255 - color})`;
    ctx.strokeStyle = `rgb(255, ${color}, ${255 - color})`;
    ctx.fillRect(x, height - y, size, size);
    ctx.lineTo(x, height - y);
  });
  ctx.stroke();
}

setInterval(() => {
  if (isStarted) {
    let data = new Float32Array(analyserNode.fftSize);
    analyserNode.getFloatTimeDomainData(data);
    let [pitch, clarity] = findPitch(data, audioContext.sampleRate);

    pitchElement.textContent = String(pitch);
    clarityElement.textContent = String(clarity);

    const pitchValue = Math.abs(extrapolate(min, max, pitch));

    if(isStarted && pitch > 100 && pitch < 500 && clarity > 0.95) {
      velocity = (min + max) / 2 - pitchValue * height;
      pitchList.push({
        x: 600,
        y: pitchValue * height,
        z: clarity,
        color: pitchValue * 255
      });
      if (pitch < min) min = pitch;
      if (pitch > max) max = pitch;

      minmaxElement.textContent = `pitch: ${Math.round(min)} - ${Math.round(max)}, avg: ${Math.round(min + max) / 2}`;
    }
  }
}, recInterval);

function loop() {
  draw();
  window.requestAnimationFrame(loop);
}

document.addEventListener("DOMContentLoaded", () => {
  pitchElement = document.getElementById('pitch');
  clarityElement = document.getElementById('clarity');
  stopButton = document.getElementById('stop');
  startButton = document.getElementById('start');
  minmaxElement = document.getElementById('minmax');
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  player = new Player(ctx, 6);

  stopButton.onclick = () => {
    console.log('stop');
    isStarted = false;
    micStream.getAudioTracks().forEach(track => {
      track.stop();
    });
  }

  startButton.onclick = e => {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyserNode = audioContext.createAnalyser();
    isStarted = true;

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      console.log('start');
      minmaxElement.textContent = `pitch: ${min} - ${max}`;
      micStream = stream;
      let sourceNode = audioContext.createMediaStreamSource(stream);
      sourceNode.connect(analyserNode);
      loop();
    });
  }
});