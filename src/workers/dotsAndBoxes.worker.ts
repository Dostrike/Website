import { chooseDotsMove } from "../utils/dotsAndBoxesAI";
import type { DotsLevel, DotsChoice } from "../utils/dotsAndBoxesAI";
import type { DotsState } from "../utils/dotsAndBoxesEngine";
export type DotsWorkerRequest = {
  requestId: number;
  positionKey: string;
  state: DotsState;
  level: DotsLevel;
  seed: number;
};
export type DotsWorkerReply = {
  requestId: number;
  positionKey: string;
  choice?: DotsChoice;
  error?: string;
};
self.onmessage = (event: MessageEvent<DotsWorkerRequest>) => {
  const p = event.data;
  try {
    self.postMessage({
      requestId: p.requestId,
      positionKey: p.positionKey,
      choice: chooseDotsMove(p.state, p.level, p.seed),
    } satisfies DotsWorkerReply);
  } catch (error) {
    self.postMessage({
      requestId: p.requestId,
      positionKey: p.positionKey,
      error: error instanceof Error ? error.message : "Computer search failed.",
    } satisfies DotsWorkerReply);
  }
};
