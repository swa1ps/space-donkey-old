
export class PitchChart {
  constructor(ctx,) {
    this.ctx = ctx;
  }

  draw(pitchList) {
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
