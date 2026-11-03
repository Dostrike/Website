import {
  chooseMancalaMove,
  type MancalaDifficulty,
  type MancalaState,
} from "../utils/mancalaEngine";
self.onmessage = (
  event: MessageEvent<{ game: MancalaState; difficulty: MancalaDifficulty }>,
) =>
  self.postMessage({
    move: chooseMancalaMove(event.data.game, event.data.difficulty),
  });
