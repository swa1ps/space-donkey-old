import { GameController } from './controllers/GameController';

function init() {
  const gameController = new GameController();
}

document.addEventListener("DOMContentLoaded", init);