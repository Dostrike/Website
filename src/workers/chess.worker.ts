import { chooseChessMove } from "../utils/chessAI";
import type { ChessChoice, ChessLevel } from "../utils/chessAI";
import { CHESS_MAX_PLIES, validChessPly } from "../utils/chessEngine";
import type { ChessPosition } from "../utils/chessEngine";
export type ChessWorkerRequest = {
  requestId: number;
  positionKey: string;
  position: ChessPosition;
  level: ChessLevel;
  seed: number;
};
export type ChessWorkerReply = {
  requestId: number;
  positionKey: string;
  choice?: ChessChoice;
  error?: string;
};
export function validChessRequest(value: unknown): value is ChessWorkerRequest {
  if (
    !value ||
    typeof value !== "object" ||
    Object.keys(value).sort().join(",") !==
      "level,position,positionKey,requestId,seed"
  )
    return false;
  const p = value as ChessWorkerRequest;
  return (
    Number.isSafeInteger(p.requestId) &&
    p.requestId > 0 &&
    typeof p.positionKey === "string" &&
    p.positionKey.length > 0 &&
    p.positionKey.length <= 160000 &&
    !!p.position &&
    Object.keys(p.position).sort().join(",") === "initialFen,moves" &&
    typeof p.position.initialFen === "string" &&
    p.position.initialFen.length <= 160 &&
    Array.isArray(p.position.moves) &&
    p.position.moves.length <= CHESS_MAX_PLIES &&
    Array.from(p.position.moves).every(validChessPly) &&
    ["easy", "medium", "hard"].includes(p.level) &&
    Number.isInteger(p.seed) &&
    p.seed >= 0 &&
    p.seed <= 0xffffffff
  );
}
self.onmessage = (event: MessageEvent<unknown>) => {
  const p = event.data;
  if (!validChessRequest(p)) {
    self.postMessage({
      requestId: 0,
      positionKey: "",
      error: "Invalid Chess decision request.",
    } satisfies ChessWorkerReply);
    return;
  }
  try {
    self.postMessage({
      requestId: p.requestId,
      positionKey: p.positionKey,
      choice: chooseChessMove(p.position, p.level, p.seed),
    } satisfies ChessWorkerReply);
  } catch {
    self.postMessage({
      requestId: p.requestId,
      positionKey: p.positionKey,
      error: "Chess position could not be searched. Retry or return to setup.",
    } satisfies ChessWorkerReply);
  }
};
