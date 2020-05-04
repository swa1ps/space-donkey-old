import { extrapolate } from '../utils/math';

export type Pitch = {
  x: number;
  y: number;
  z: number;
  color: number;
}

function getNewPitchList(pitchList: Pitch[] = [], speed: number): Pitch[]{
  return pitchList
    .map(({x, y, z, color}) => ({ x: x - speed, y, z, color }))
    .filter(({ x }) => x > -20);
}

export class PitchChart {
  ctx: CanvasRenderingContext2D;
  pitchList: Pitch[] = [];

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  addPitch(pitch: Pitch) {
    this.pitchList.push(pitch);
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 200, 100);
    this.pitchList = getNewPitchList(this.pitchList, 5);

    ctx.save();
    ctx.beginPath();
    this.pitchList.forEach(({x, y , z, color}) => {
      const k = z ? z : 0;
      const size = 4 * k;
      ctx.fillStyle = `rgb(255, ${color}, ${255 - color})`;
      ctx.strokeStyle = `rgb(255, ${color}, ${255 - color})`;
      ctx.fillRect(x, y, size, size);
      ctx.lineTo(x, y);
    });

    ctx.stroke();
    ctx.restore();
  }
}


export class UIController {
  ctx: CanvasRenderingContext2D;
  pitchChart: PitchChart;

  constructor(startHandler: Function, stopHandler: Function) {
    const canvas = <HTMLCanvasElement>document.getElementById('canvas');
    this.ctx = canvas.getContext('2d');
    this.pitchChart = new PitchChart(this.ctx);

    document.onkeyup = e => {
      switch (e.code) {
        case 'Escape':
          stopHandler();
          break;
        case 'Enter':
          startHandler();
          break;
      }
    }
  }

  drawPitchVelocity = (v, minPitch, maxPitch) => {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.fillStyle = 'green';
    this.ctx.rect(195,50,5,50 * v);
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.fillStyle = 'yellow';
    const range = maxPitch - minPitch;
    const exRange = extrapolate(100, 1000, 100 + range);

    const rectHeight = 100 * exRange;
    this.ctx.rect(0, 50 - rectHeight/2,5, rectHeight);
    this.ctx.fill();
    this.ctx.restore();
  }

  drawPitchState(v, minPitch, maxPitch) {
    this.pitchChart.draw();
    this.drawPitchVelocity(v, minPitch, maxPitch);
  }
}