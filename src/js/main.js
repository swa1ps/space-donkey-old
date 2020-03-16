import { findPitch } from 'pitchy';
import { exterpolate } from './math';

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
const speed = 10;
let isStarted = false;

function draw() {
  console.log(pitchList.length);
  ctx.clearRect(0, 0, 600, 600);

  pitchList.forEach(point => {
    const val = Math.abs(exterpolate(min, max, point.y)) * 255;

    ctx.fillStyle = `rgb(255, ${val}, ${255 - val})`;
    ctx.fillRect(point.x, 600 - point.y, 10, 10);
  })
}

function loop(analyserNode, sampleRate) {
  let data = new Float32Array(analyserNode.fftSize);
  analyserNode.getFloatTimeDomainData(data);
  let [pitch, clarity] = findPitch(data, sampleRate);

  pitchElement.textContent = String(pitch);
  clarityElement.textContent = String(clarity);

  pitchList = pitchList
    .map(({x, y}) => ({ x: x - speed, y }))
    .filter(({ x }) => x > -20);

  if(isStarted) {
    pitchList.push({
      x: 600,
      y: pitch
    });
  }
  draw();

  window.requestAnimationFrame(() => loop(analyserNode, sampleRate));
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
    let audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let analyserNode = audioContext.createAnalyser();
    isStarted = true;

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      console.log('start');
      micStream = stream;
      let sourceNode = audioContext.createMediaStreamSource(stream);
      sourceNode.connect(analyserNode);
      loop(analyserNode, audioContext.sampleRate);
    });
  }
});