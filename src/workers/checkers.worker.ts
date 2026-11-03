import { chooseCheckers, type CheckersState } from "../utils/checkersEngine";
self.onmessage = (
  event: MessageEvent<{
    game: CheckersState;
    difficulty: "easy" | "medium" | "hard";
  }>,
) => {
  self.postMessage({
    move: chooseCheckers(event.data.game, event.data.difficulty),
  });
};
