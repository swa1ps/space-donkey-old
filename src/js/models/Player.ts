import { getVelocityAfterFriction } from '../utils/math';

const RADIUS = 40;

export class Player{
  x: number;
  y: number;
  y2: number;
  vy: number;
  fy: number;
  ctx: CanvasRenderingContext2D

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.x = 30;
    this.y = 300;
    this.y2 = 0;
    this.vy = 0;
    this.fy = 1.03;
  }

  draw() {
    this.vy = getVelocityAfterFriction(this.vy, this.fy);
    let y = this.y + this.vy * 20;
    y = y > 600 ? 600 : y;
    y = y < 0 ? 0 : y;

    this.y = y;

    let y2 = this.y2 + this.vy * 0.1;
    y2 = y2 > 1 ? 1 : y2;
    y2 = y2 < -1 ? -1 : y2;

    this.y2 = y2;

    const ctx = this.ctx;
    ctx.save();

    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.arc(this.x, this.y, RADIUS, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.restore();
  }
}
