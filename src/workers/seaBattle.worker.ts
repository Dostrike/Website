import { chooseSeaShot } from "../utils/seaBattleAI";
import type { SeaChoice, SeaLevel } from "../utils/seaBattleAI";
import { validSeaKnowledge } from "../utils/seaBattleEngine";
import type { SeaKnowledge } from "../utils/seaBattleEngine";
export type SeaWorkerRequest = {
  requestId: number;
  positionKey: string;
  knowledge: SeaKnowledge;
  level: SeaLevel;
  seed: number;
};
export type SeaWorkerReply = {
  requestId: number;
  positionKey: string;
  choice?: SeaChoice | null;
  error?: string;
};
export function validSeaRequest(value: unknown): value is SeaWorkerRequest {
  if (
    !value ||
    typeof value !== "object" ||
    Object.keys(value).sort().join(",") !==
      "knowledge,level,positionKey,requestId,seed"
  )
    return false;
  const p = value as SeaWorkerRequest;
  return (
    Number.isSafeInteger(p.requestId) &&
    p.requestId > 0 &&
    typeof p.positionKey === "string" &&
    p.positionKey.length > 0 &&
    p.positionKey.length <= 4096 &&
    validSeaKnowledge(p.knowledge) &&
    ["easy", "medium", "hard"].includes(p.level) &&
    Number.isInteger(p.seed) &&
    p.seed >= 0 &&
    p.seed <= 0xffffffff
  );
}
self.onmessage = (event: MessageEvent<unknown>) => {
  const p = event.data;
  if (!validSeaRequest(p)) {
    self.postMessage({
      requestId: 0,
      positionKey: "",
      error: "Invalid public-information decision request.",
    } satisfies SeaWorkerReply);
    return;
  }
  try {
    self.postMessage({
      requestId: p.requestId,
      positionKey: p.positionKey,
      choice: chooseSeaShot(p.knowledge, p.level, p.seed),
    } satisfies SeaWorkerReply);
  } catch {
    self.postMessage({
      requestId: p.requestId,
      positionKey: p.positionKey,
      error: "Computer choice failed; retry or return to setup.",
    } satisfies SeaWorkerReply);
  }
};
