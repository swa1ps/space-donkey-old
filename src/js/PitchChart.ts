
export type PitchList = {
  x: number;
  y: number;
  z: number;
  color: number;
}

export interface IPitchChart {
  ctx: CanvasRenderingContext2D;
  draw: (pitchList: PitchList[]) => void;
}

export class PitchChart implements IPitchChart{
  ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  draw(pitchList: PitchList[]) {
    const ctx = this.ctx; 
    ctx.save();
    ctx.beginPath();
    pitchList.forEach(({x, y , z, color}) => {
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
