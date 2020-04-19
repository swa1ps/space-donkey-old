import { AudioController } from './AudioController';
import { UIController } from './UIController';
import { DrawController } from './DrawController';
import { extrapolate } from '../utils/math';
import { Player } from '../models/Player';


export class GameController {
  isStart = false;
  enemies: [];
  audioController: AudioController;
  uiController: UIController;
  drawController: DrawController;
  player: Player;
  minPitch = 180;
  maxPitch = 250;
  rafId: number = null;

  constructor() {
    console.log('init game controller');
    this.uiController = new UIController(this.start, this.stop);
    this.player = new Player();
    this.drawController = new DrawController(this.player);
  }

  onPitchChanged = (pitch: number, clarity: number) => {
    if(pitch > 50 && pitch < 1500 && clarity > 0.95) {
      if (pitch < this.minPitch) this.minPitch = pitch;
      if (pitch > this.maxPitch) this.maxPitch = pitch;
      const pitchValue = Math.abs(extrapolate(this.minPitch, this.maxPitch, pitch));
      console.log({pitchValue});
      this.player.vy = (0.5 - pitchValue) * 1.6;
      this.uiController.pitchChart.addPitch({
        x: 200,
        y: 100 - pitchValue * 100,
        z: clarity,
        color: pitchValue * 255
      });
    }
  }

  start = async () => {
    this.audioController = new AudioController();
    try {
      await this.audioController.startListen(this.onPitchChanged);
      await this.drawController.init();
      // init()
      this.isStart = true;
      this.loop();
      console.log(this.audioController, this.isStart);
    } catch (error) {
      console.log('start error', error)
    }
  }

  stop = () => {
    this.audioController.stopListen();
    this.audioController = null;
    this.isStart = false;
    window.cancelAnimationFrame(this.rafId);
    console.log(this.audioController, this.isStart);
  }

  draw = () => {
    this.uiController.drawPitchState();
    this.player.draw();
    this.drawController.draw();
  }

  loop = () => {
    this.draw();
    this.rafId = window.requestAnimationFrame(this.loop);
  }
}