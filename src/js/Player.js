const RADIUS = 40;

export class Player {
  constructor(ctx) {
    this.ctx = ctx;
  }

  draw(x, y) {
    const ctx = this.ctx; 
    ctx.save();

    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.arc(x, y, RADIUS, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.restore();
  }
}
