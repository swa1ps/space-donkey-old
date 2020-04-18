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
    ctx.clearRect(0, 0, 600, 600);

    this.pitchList = getNewPitchList(this.pitchList, 5);

    ctx.save();
    ctx.beginPath();
    this.pitchList.forEach(({x, y , z, color}) => {
      const k = z ? z : 0;
      const size = 10 * k;
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

  constructor(startHandler, stopHandler) {
    const startButton = <HTMLButtonElement>document.getElementById('start');
    const stopButton = <HTMLButtonElement>document.getElementById('stop');
    const canvas = <HTMLCanvasElement>document.getElementById('canvas');
    this.ctx = canvas.getContext('2d');
    this.pitchChart = new PitchChart(this.ctx);

    startButton.onclick = startHandler;
    stopButton.onclick = stopHandler;
    console.log('init uiController');
  }

  drawPitchState() {
    // TODO: raf
    this.pitchChart.draw();
  }
}