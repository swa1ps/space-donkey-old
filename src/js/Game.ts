export class Game {
  width: number;
  height: number;
  speed: number;
  min: number;
  max: number;
  debug: boolean;
  isListen: boolean;
  listenInterval: number;

  constructor() {
    this.width = 600;
    this.height = 600;
    this.speed = 5;
    this.min = 180;
    this.max = 250;
    this.listenInterval = 100;
    this.isListen = false;
  }
}