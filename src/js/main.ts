import { GameController } from './controllers/GameController';

function init() {
  const gameController = new GameController();
  console.log("init main", gameController.isStart);
}

document.addEventListener("DOMContentLoaded", init);