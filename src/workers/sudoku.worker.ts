import { generateSudoku, type SudokuLevel } from "../utils/sudokuEngine";
self.onmessage = (e: MessageEvent<{ seed: string; level: SudokuLevel }>) => {
  try {
    self.postMessage({ puzzle: generateSudoku(e.data.seed, e.data.level) });
  } catch {
    self.postMessage({
      error: "Puzzle generation failed. Please try another board.",
    });
  }
};
