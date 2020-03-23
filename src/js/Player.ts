const RADIUS = 40;

export class Player{
  x: number;
  y: number;
  vy: number;
  fy: number;
  ctx: CanvasRenderingContext2D

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.x = 30;
    this.y = 300;
    this.vy = 0;
    this.fy = 1.03;
  }

  updatePosition(vy: number, height: number){
    let y = this.y + vy * 20;
    y = y > height ? height : y;
    y = y < 0 ? 0 : y;
  
    this.y = y;
  }

  draw() {
    const ctx = this.ctx; 
    ctx.save();

    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.arc(this.x, this.y, RADIUS, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.restore();
  }
}
