import { newColourRound } from "../utils/colourSortSession";
self.onmessage = (
  event: MessageEvent<{
    seed: string;
    colours: number;
    id: string;
    day: string | null;
  }>,
) => {
  try {
    const p = event.data;
    self.postMessage({ round: newColourRound(p.seed, p.colours, p.id, p.day) });
  } catch (error) {
    self.postMessage({
      error:
        error instanceof Error
          ? error.message
          : "Could not verify a puzzle. Try again.",
    });
  }
};
