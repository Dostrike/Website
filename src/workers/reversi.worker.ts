import {
  chooseReversiMove,
  type ReversiDifficulty,
  type ReversiState,
} from "../utils/reversiEngine";
self.onmessage = (
  event: MessageEvent<{ game: ReversiState; difficulty: ReversiDifficulty }>,
) => {
  self.postMessage({
    move: chooseReversiMove(event.data.game, event.data.difficulty),
  });
};
