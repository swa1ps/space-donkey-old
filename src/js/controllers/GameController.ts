import { AudioController } from './AudioController';
import { UIController } from './UIController';
import { DrawController } from './DrawController';
import { extrapolate } from '../utils/math';
import { Player, loadPlayerModel } from '../models/Player';
import { loadMeteoriteModel } from '../models/Enemy';


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
    this.player = new Player();
    this.drawController = new DrawController(this.player);
    this.uiController = new UIController(this.start, this.stop);
  }

  loadAssets = async () => {
    console.log(this.uiController)
    const playerModel = await loadPlayerModel((xhr) => {
      this.uiController.updateProgressBar('player', xhr.loaded / xhr.total * 100)
    });

    const enemyModel = await loadMeteoriteModel((xhr) => {
      this.uiController.updateProgressBar('meteorite', xhr.loaded / xhr.total * 100)
    });
    this.drawController.playerModel = playerModel;
    this.drawController.meteorite = enemyModel;
  }

  onPitchChanged = (pitch: number, clarity: number) => {
    if(pitch > 50 && pitch < 1500 && clarity > 0.95) {
      if (pitch < this.minPitch) this.minPitch = pitch;
      if (pitch > this.maxPitch) this.maxPitch = pitch;
      const pitchValue = Math.abs(extrapolate(this.minPitch, this.maxPitch, pitch));
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
    if (this.isStart) return;
    this.audioController = new AudioController();
    try {
      await this.audioController.startListen(this.onPitchChanged);
      await this.drawController.init();
      this.isStart = true;
      this.loop();
    } catch (error) {
      console.log('start error', error)
    }
  }

  stop = () => {
    if (!this.isStart) return;
    this.audioController.stopListen();
    this.audioController = null;
    this.isStart = false;
    window.cancelAnimationFrame(this.rafId);
  }

  draw = () => {
    this.uiController.drawPitchState(this.player.vy, this.minPitch, this.maxPitch);
    this.player.draw();
    this.drawController.draw();
  }

  loop = () => {
    this.draw();
    this.rafId = window.requestAnimationFrame(this.loop);
  }
}