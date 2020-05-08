import '../css/main.css';
import { GameController } from './controllers/GameController';

async function init() {
  const gameController = new GameController();
  await gameController.loadAssets();
}

document.addEventListener("DOMContentLoaded", init);