import { AudioController } from './AudioController';
import { UIController } from './UIController';
import { DrawController } from './DrawController';
import { enemiesController } from '../models/Enemy';
import { extrapolate } from '../utils/math';
import { Player, loadPlayerModel } from '../models/Player';
import { enemies, loadMeteoriteModel } from '../models/Enemy';
import * as THREE from "three";


export class GameController {
  isStart = false;
  audioController: AudioController;
  uiController: UIController;
  drawController: DrawController;
  player: Player;
  minPitch = 180;
  maxPitch = 250;
  score = 0;
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
      this.uiController.updateProgressBar('player', xhr.loaded)
    });

    const enemyModel = await loadMeteoriteModel((xhr) => {
      this.uiController.updateProgressBar('meteorite', xhr.loaded)
    });
    this.uiController.startButton.innerText = 'Play';
    this.uiController.startButton.disabled = false;
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

  detectCollisions = () => {
    const playerCollider = new THREE.Box3().setFromObject(this.drawController.playerModel.children[2]);
    enemies.forEach(enemy => {
    const enemyCollider = new THREE.Box3().setFromObject(enemy);
      const collision = playerCollider.intersectsBox(enemyCollider);
      if(collision) {
        console.log('hit');
        this.updateScore(0);
      }
    })
  }

  incScore = (value = 1) => {
    this.score += value;
    this.updateScore(this.score);
  }

  updateScore = (value: number) => {
    this.score = value;
    this.uiController.updateScore(value);
  }

  draw = () => {
    const { scene, playerModel, meteorite } = this.drawController;
    this.uiController.drawPitchState(this.player.vy, this.minPitch, this.maxPitch);

    enemiesController(scene, playerModel.position.y, meteorite, this.incScore);
    this.player.draw();
    this.drawController.draw();
    this.detectCollisions()
  }

  loop = () => {
    this.draw();
    this.rafId = window.requestAnimationFrame(this.loop);
  }
}