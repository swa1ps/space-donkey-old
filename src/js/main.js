import { findPitch } from 'pitchy';
import { exterpolate } from './math';

let analyserNode;
let audioContext;
let micStream;
let pitchElement;
let clarityElement;
let stopButton;
let startButton;
let canvas;
let ctx;
let pitchList = [];
const min = 100;
const max = 400;
const speed = 5;
let isStarted = false;

function draw() {
  ctx.clearRect(0, 0, 600, 600);
  if(isStarted){
    pitchList = pitchList
      .map(({x, y, z}) => ({ x: x - speed, y, z }))
      .filter(({ x }) => x > -20);
  }
  pitchList.forEach(({x, y ,z}) => {
    const val = Math.abs(exterpolate(min, max, y)) * 255;
    const k = z ? z : 0;
    const size = 10 * k;
    ctx.fillStyle = `rgb(255, ${val}, ${255 - val})`;
    ctx.fillRect(x, 600 - y, size, size);
  })
  }

setInterval(() => {
  if (isStarted) {
    let data = new Float32Array(analyserNode.fftSize);
    analyserNode.getFloatTimeDomainData(data);
    let [pitch, clarity] = findPitch(data, audioContext.sampleRate);
  
    pitchElement.textContent = String(pitch);
    clarityElement.textContent = String(clarity);
  
    if(isStarted && pitch > 100 && pitch < 500 && clarity > 0.85) {
      pitchList.push({
        x: 600,
        y: pitch,
        z: clarity
      });
    }
  }
}, 100);

function loop() {
  draw();
  window.requestAnimationFrame(loop);
}

document.addEventListener("DOMContentLoaded", () => {
  pitchElement = document.getElementById('pitch');
  clarityElement = document.getElementById('clarity');
  stopButton = document.getElementById('stop');
  startButton = document.getElementById('start');
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

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
      micStream = stream;
      let sourceNode = audioContext.createMediaStreamSource(stream);
      sourceNode.connect(analyserNode);
      loop();
    });
  }
});