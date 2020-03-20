const RADIUS = 40;

export interface IPlayer {
  ctx: CanvasRenderingContext2D;
  draw: (x: number, y: number) => void;
}

export class Player implements IPlayer{
  ctx: CanvasRenderingContext2D

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  draw(x: number, y: number) {
    const ctx = this.ctx; 
    ctx.save();

    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.arc(x, y, RADIUS, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.restore();
  }
}
