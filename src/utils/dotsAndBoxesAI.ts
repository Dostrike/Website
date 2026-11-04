import { legalDotsEdges, playDots, dotsBoxEdges } from "./dotsAndBoxesEngine";
import type { DotsState, DotsPlayer } from "./dotsAndBoxesEngine";
export type DotsLevel = "easy" | "medium" | "hard";
export type DotsChoice = {
  edge: number | null;
  nodes: number;
  depth: number;
  exact: boolean;
  value: number | null;
  reason: string;
};
function createdThirds(s: DotsState, edge: number) {
  const next = playDots(s, edge);
  return next.boxes.reduce<number>(
    (sum, owner, box) =>
      sum +
      Number(
        !owner &&
          dotsBoxEdges(s.size, box).filter((e) => !!next.edges[e]).length === 3,
      ),
    0,
  );
}
function ordered(s: DotsState) {
  return legalDotsEdges(s)
    .map((edge) => ({
      edge,
      captures: playDots(s, edge).captured.length,
      thirds: createdThirds(s, edge),
    }))
    .sort(
      (a, b) =>
        b.captures - a.captures || a.thirds - b.thirds || a.edge - b.edge,
    );
}
export function chooseDotsMove(
  state: DotsState,
  level: DotsLevel,
  seed = 1,
  limits: { nodes?: number; ms?: number; depth?: number } = {},
): DotsChoice {
  if (!["easy", "medium", "hard"].includes(level))
    throw Error("Invalid Dots level");
  const moves = ordered(state);
  if (!moves.length)
    return {
      edge: null,
      nodes: 0,
      depth: 0,
      exact: true,
      value: null,
      reason: "The game has ended.",
    };
  if (level === "easy")
    return {
      edge: moves[(seed >>> 0) % moves.length].edge,
      nodes: 0,
      depth: 0,
      exact: false,
      value: null,
      reason: "A seeded legal choice; no strategy guarantee.",
    };
  const greedy = moves[0];
  if (level === "medium")
    return {
      edge: greedy.edge,
      nodes: 0,
      depth: 0,
      exact: false,
      value: null,
      reason: greedy.captures
        ? "Takes an immediate capture."
        : !greedy.thirds
          ? "Avoids leaving a third side where possible."
          : "Prefers fewer unclaimed three-sided boxes; no win guarantee.",
    };
  const maxNodes = limits.nodes ?? 60000,
    maxMs = limits.ms ?? 600,
    maxDepth = limits.depth ?? (moves.length <= 14 ? moves.length : 6);
  if (
    !Number.isInteger(maxNodes) ||
    maxNodes < 1 ||
    !Number.isFinite(maxMs) ||
    maxMs < 1 ||
    !Number.isInteger(maxDepth) ||
    maxDepth < 1
  )
    throw Error("Invalid search limits");
  const root: DotsPlayer = state.turn,
    start = Date.now();
  let nodes = 0;
  const evaluate = (s: DotsState) => {
    const score = (s.scores[root - 1] - s.scores[root === 1 ? 1 : 0]) * 1000;
    if (s.result !== null) return score;
    const threes = s.boxes.reduce<number>(
      (sum, owner, box) =>
        sum +
        Number(
          !owner &&
            dotsBoxEdges(s.size, box).filter((edge) => !!s.edges[edge])
              .length === 3,
        ),
      0,
    );
    return score + (s.turn === root ? 1 : -1) * threes * 40;
  };
  if (moves.length <= 10 && maxDepth >= moves.length) {
    // Past box ownership cannot affect future captures. Memoize future score
    // by drawn-edge set and mover, rather than expanding every move order.
    const futureCache = new Map<string, number>();
    const future = (s: DotsState): number => {
      nodes++;
      if (nodes > maxNodes || Date.now() - start >= maxMs)
        throw Error("budget");
      if (s.result !== null) return 0;
      const k = `${s.edges.map((v) => (v ? 1 : 0)).join("")}:${s.turn}`;
      const cached = futureCache.get(k);
      if (cached !== undefined) return cached;
      const maximize = s.turn === root;
      let best = maximize ? -Infinity : Infinity;
      for (const { edge } of ordered(s)) {
        const next = playDots(s, edge);
        const value = (maximize ? 1 : -1) * next.captured.length + future(next);
        best = maximize ? Math.max(best, value) : Math.min(best, value);
      }
      futureCache.set(k, best);
      return best;
    };
    try {
      let best = -Infinity,
        edge = greedy.edge;
      for (const move of moves) {
        const next = playDots(state, move.edge),
          value = next.captured.length + future(next);
        if (value > best) {
          best = value;
          edge = move.edge;
        }
      }
      return {
        edge,
        nodes,
        depth: moves.length,
        exact: true,
        value:
          (state.scores[root - 1] - state.scores[root === 1 ? 1 : 0] + best) *
          1000,
        reason:
          "Solved the remaining position by memoized future-score search.",
      };
    } catch (error) {
      if (!(error instanceof Error) || error.message !== "budget") throw error;
      return {
        edge: greedy.edge,
        nodes,
        depth: 0,
        exact: false,
        value: null,
        reason:
          "Endgame budget expired; using the legal capture/safety fallback.",
      };
    }
  }
  const exactCache = new Map<string, number>();
  const search = (
    s: DotsState,
    depth: number,
    alpha: number,
    beta: number,
  ): number => {
    nodes++;
    if (nodes > maxNodes || Date.now() - start >= maxMs) throw Error("budget");
    if (s.result !== null || depth === 0) return evaluate(s);
    const cacheKey = `${s.edges.map((owner) => (owner ? 1 : 0)).join("")}:${s.turn}:${s.scores.join(",")}:${depth}`;
    const cached = exactCache.get(cacheKey);
    if (cached !== undefined) return cached;
    const alphaStart = alpha,
      betaStart = beta;
    const maximize = s.turn === root;
    let best = maximize ? -Infinity : Infinity;
    for (const { edge } of ordered(s)) {
      const value = search(playDots(s, edge), depth - 1, alpha, beta);
      best = maximize ? Math.max(best, value) : Math.min(best, value);
      if (maximize) alpha = Math.max(alpha, best);
      else beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    // Fail-low/high values are bounds, not exact transpositions.
    if (best > alphaStart && best < betaStart) exactCache.set(cacheKey, best);
    return best;
  };
  let edge = greedy.edge,
    value: number | null = null,
    depth = 0;
  for (
    let current = 1;
    current <= Math.min(maxDepth, moves.length);
    current++
  ) {
    let candidate = greedy.edge,
      best = -Infinity,
      alpha = -Infinity;
    try {
      for (const move of moves) {
        const v = search(
          playDots(state, move.edge),
          current - 1,
          alpha,
          Infinity,
        );
        if (v > best) {
          best = v;
          candidate = move.edge;
        }
        alpha = Math.max(alpha, best);
      }
    } catch (error) {
      if (error instanceof Error && error.message === "budget") break;
      throw error;
    }
    edge = candidate;
    value = best;
    depth = current;
  }
  const exact = depth === moves.length;
  return {
    edge,
    nodes,
    depth,
    exact,
    value,
    reason: exact
      ? "Solved the remaining position with complete minimax bounds."
      : depth
        ? `Bounded search completed ${depth} plies; extra turns are evaluated for the actual mover.`
        : "Search budget expired; using the legal capture/safety fallback.",
  };
}
