/** Independent unit-edge Dots and Boxes. size counts boxes, not dots. */
export type DotsPlayer = 1 | 2;
export type DotsOwner = 0 | DotsPlayer;
export type DotsState = {
  size: number;
  edges: DotsOwner[];
  boxes: DotsOwner[];
  turn: DotsPlayer;
  scores: [number, number];
  history: number[];
  captured: number[];
  result: DotsPlayer | "draw" | null;
};
export type DotsPoint = { row: number; column: number };
export type DotsEdge = {
  id: number;
  orientation: "horizontal" | "vertical";
  from: DotsPoint;
  to: DotsPoint;
};
const validSize = (size: number) => [2, 3, 4].includes(size);
export function dotsEdgeCount(size: number) {
  if (!validSize(size)) throw Error("Invalid Dots and Boxes size");
  return 2 * size * (size + 1);
}
export function dotsEdge(size: number, id: number): DotsEdge | null {
  const total = dotsEdgeCount(size),
    horizontal = total / 2;
  if (!Number.isInteger(id) || id < 0 || id >= total) return null;
  if (id < horizontal) {
    const row = Math.floor(id / size),
      column = id % size;
    return {
      id,
      orientation: "horizontal",
      from: { row, column },
      to: { row, column: column + 1 },
    };
  }
  const row = Math.floor((id - horizontal) / (size + 1)),
    column = (id - horizontal) % (size + 1);
  return {
    id,
    orientation: "vertical",
    from: { row, column },
    to: { row: row + 1, column },
  };
}
export function dotsEdgeBetween(
  size: number,
  a: DotsPoint,
  b: DotsPoint,
): number | null {
  dotsEdgeCount(size);
  if (
    ![a.row, a.column, b.row, b.column].every(
      (v) => Number.isInteger(v) && v >= 0 && v <= size,
    )
  )
    return null;
  if (a.row === b.row && Math.abs(a.column - b.column) === 1)
    return a.row * size + Math.min(a.column, b.column);
  if (a.column === b.column && Math.abs(a.row - b.row) === 1)
    return size * (size + 1) + Math.min(a.row, b.row) * (size + 1) + a.column;
  return null;
}
export function dotsBoxEdges(size: number, box: number): number[] {
  dotsEdgeCount(size);
  if (!Number.isInteger(box) || box < 0 || box >= size * size)
    throw Error("Invalid box");
  const r = Math.floor(box / size),
    c = box % size,
    h = size * (size + 1);
  return [
    r * size + c,
    (r + 1) * size + c,
    h + r * (size + 1) + c,
    h + r * (size + 1) + c + 1,
  ];
}
export function completedDotsBoxes(
  size: number,
  edges: readonly unknown[],
): number[] {
  if (edges.length !== dotsEdgeCount(size)) throw Error("Invalid edge array");
  return Array.from({ length: size * size }, (_, box) => box).filter((box) =>
    dotsBoxEdges(size, box).every((edge) => !!edges[edge]),
  );
}
export function newDots(size: number): DotsState {
  return {
    size,
    edges: Array(dotsEdgeCount(size)).fill(0),
    boxes: Array(size * size).fill(0),
    turn: 1,
    scores: [0, 0],
    history: [],
    captured: [],
    result: null,
  };
}
export function legalDotsEdges(state: DotsState): number[] {
  return state.result !== null
    ? []
    : state.edges.flatMap((owner, id) => (owner ? [] : [id]));
}
export function playDots(state: DotsState, edge: number): DotsState {
  if (
    state.result !== null ||
    !Number.isInteger(edge) ||
    edge < 0 ||
    edge >= state.edges.length ||
    state.edges[edge]
  )
    return state;
  const edges = state.edges.slice(),
    boxes = state.boxes.slice(),
    scores: [number, number] = [...state.scores];
  edges[edge] = state.turn;
  const captured = completedDotsBoxes(state.size, edges).filter(
    (box) => !boxes[box],
  );
  for (const box of captured) boxes[box] = state.turn;
  scores[state.turn - 1] += captured.length;
  const done = boxes.every(Boolean),
    result = done
      ? scores[0] === scores[1]
        ? "draw"
        : scores[0] > scores[1]
          ? 1
          : 2
      : null;
  return {
    ...state,
    edges,
    boxes,
    scores,
    captured,
    result,
    history: [...state.history, edge],
    turn: captured.length ? state.turn : state.turn === 1 ? 2 : 1,
  };
}
export function replayDots(
  size: number,
  history: readonly number[],
): DotsState {
  if (!Array.isArray(history) || history.length > dotsEdgeCount(size))
    throw Error("Invalid Dots history");
  let state = newDots(size);
  for (const edge of history) {
    const next = playDots(state, edge);
    if (next === state) throw Error("Illegal Dots history");
    state = next;
  }
  return state;
}
export function undoDots(state: DotsState, floor = 0): DotsState {
  if (!Number.isInteger(floor) || floor < 0 || floor > state.history.length)
    throw Error("Invalid undo floor");
  return state.history.length > floor
    ? replayDots(state.size, state.history.slice(0, -1))
    : state;
}
export function dotsDaily(seed: string): DotsState {
  if (typeof seed !== "string" || !seed || seed.length > 200)
    throw Error("Invalid daily seed");
  let rng = 2166136261;
  for (const c of seed) rng = Math.imul(rng ^ c.charCodeAt(0), 16777619) >>> 0;
  let state = newDots(3);
  for (let i = 0; i < 8; i++) {
    const candidates = legalDotsEdges(state).filter(
      (edge) => !playDots(state, edge).captured.length,
    );
    if (!candidates.length) throw Error("No valid noncapturing daily opening");
    rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0;
    state = playDots(
      state,
      candidates[Math.floor((rng / 4294967296) * candidates.length)],
    );
  }
  return state;
}
