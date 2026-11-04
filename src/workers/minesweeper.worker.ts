import {
  generateMineBoard,
  type MineSettings,
} from "../utils/minesweeperEngine";
self.onmessage = (
  e: MessageEvent<{ settings: MineSettings; seed: string; first: number }>,
) => {
  try {
    self.postMessage({
      board: generateMineBoard(e.data.settings, e.data.seed, e.data.first),
    });
  } catch (error) {
    self.postMessage({
      error:
        error instanceof Error
          ? error.message
          : "Unable to generate this board.",
    });
  }
};
