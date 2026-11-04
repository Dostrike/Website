/** Original alternating-single-shot Sea Battle. Touching ships are allowed. */
export type SeaPlayer = 1 | 2;
export type SeaShipId = 0 | 1 | 2 | 3 | 4;
export type SeaAxis = "horizontal" | "vertical";
export type SeaPlacement = { ship: SeaShipId; start: number; axis: SeaAxis };
export type SeaFleet = SeaPlacement[];
export type SeaMark = "unknown" | "miss" | "hit" | "sunk";
export type SeaSunk = { ship: SeaShipId; length: number; cells: number[] };
/** The only information permitted as an input to the computer or hint worker. */
export type SeaKnowledge = { marks: SeaMark[]; sunk: SeaSunk[] };
export type SeaShot = {
  player: SeaPlayer;
  cell: number;
  result: "miss" | "hit" | "sunk";
  sunk: SeaShipId | null;
};
export type SeaState = {
  fleets: [SeaFleet, SeaFleet];
  history: SeaShot[];
  turn: SeaPlayer;
  winner: SeaPlayer | null;
};
export const SEA_SIZE = 10;
export const SEA_LENGTHS: readonly number[] = Object.freeze([5, 4, 3, 3, 2]);
export const SEA_SHIP_NAMES: readonly string[] = Object.freeze([
  "Flagship",
  "Cruiser",
  "Frigate",
  "Scout",
  "Patrol",
]);
export const validSeaCell = (cell: unknown): cell is number =>
  typeof cell === "number" && Number.isInteger(cell) && cell >= 0 && cell < 100;
const validShip = (ship: unknown): ship is SeaShipId =>
  typeof ship === "number" && Number.isInteger(ship) && ship >= 0 && ship < 5;
export function seaCoordinate(cell: number): string {
  if (!validSeaCell(cell)) throw Error("Invalid sea coordinate");
  return `${String.fromCharCode(65 + Math.floor(cell / 10))}${(cell % 10) + 1}`;
}
export function seaShipCells(placement: SeaPlacement): number[] | null {
  if (
    !placement ||
    !validShip(placement.ship) ||
    !validSeaCell(placement.start) ||
    !["horizontal", "vertical"].includes(placement.axis)
  )
    return null;
  const length = SEA_LENGTHS[placement.ship];
  const row = Math.floor(placement.start / 10),
    column = placement.start % 10;
  if ((placement.axis === "horizontal" ? column : row) + length > 10)
    return null;
  return Array.from(
    { length },
    (_, i) => placement.start + i * (placement.axis === "horizontal" ? 1 : 10),
  );
}
/** Validate partial setup without inventing any adjacency exclusion. */
export function validSeaFleet(
  fleet: unknown,
  complete = true,
): fleet is SeaFleet {
  if (
    !Array.isArray(fleet) ||
    fleet.length > 5 ||
    (complete && fleet.length !== 5)
  )
    return false;
  const ships = new Set<number>(),
    occupied = new Set<number>();
  for (const placement of fleet) {
    const cells = seaShipCells(placement);
    if (
      !cells ||
      ships.has(placement.ship) ||
      cells.some((cell) => occupied.has(cell))
    )
      return false;
    ships.add(placement.ship);
    cells.forEach((cell) => occupied.add(cell));
  }
  return true;
}
export function placeSeaShip(
  fleet: SeaFleet,
  placement: SeaPlacement,
): SeaFleet | null {
  if (!validSeaFleet(fleet, false) || !seaShipCells(placement)) return null;
  const next = [
    ...fleet.filter((p) => p.ship !== placement.ship),
    { ...placement },
  ].sort((a, b) => a.ship - b.ship);
  return validSeaFleet(next, false) ? next : null;
}
export function seaRandom(seed: number): () => number {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff)
    throw Error("Invalid sea seed");
  let value = seed >>> 0;
  return () => {
    value = (value + 0x6d2b79f5) >>> 0;
    let mixed = Math.imul(value ^ (value >>> 15), value | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}
export function generateSeaFleet(seed: number): SeaFleet {
  const random = seaRandom(seed);
  let examined = 0;
  const visit = (fleet: SeaFleet): SeaFleet | null => {
    if (fleet.length === 5) return fleet;
    const ship = fleet.length as SeaShipId;
    const choices: SeaPlacement[] = [];
    for (let start = 0; start < 100; start++)
      for (const axis of ["horizontal", "vertical"] as const) {
        const placement = { ship, start, axis };
        if (seaShipCells(placement)) choices.push(placement);
      }
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }
    for (const placement of choices) {
      if (++examined > 20000) return null;
      const next = placeSeaShip(fleet, placement);
      if (next) {
        const result = visit(next);
        if (result) return result;
      }
    }
    return null;
  };
  const result = visit([]);
  if (!result)
    throw Error("Fleet generation limit reached; choose another seed");
  return result;
}
export function newSea(fleetA: SeaFleet, fleetB: SeaFleet): SeaState {
  if (!validSeaFleet(fleetA) || !validSeaFleet(fleetB))
    throw Error("A complete legal fleet is required for each side");
  const copy = (fleet: SeaFleet) =>
    fleet
      .map(({ ship, start, axis }) => ({ ship, start, axis }))
      .sort((a, b) => a.ship - b.ship);
  return {
    fleets: [copy(fleetA), copy(fleetB)],
    history: [],
    turn: 1,
    winner: null,
  };
}
/** Does not expose the identity of an unsunk hit or any unhit ship cell. */
export function seaKnowledge(state: SeaState, player: SeaPlayer): SeaKnowledge {
  if (player !== 1 && player !== 2) throw Error("Invalid sea player");
  const shots = state.history.filter((shot) => shot.player === player);
  const fired = new Set(shots.map((shot) => shot.cell));
  const marks: SeaMark[] = Array.from({ length: 100 }, () => "unknown");
  shots.forEach((shot) => {
    marks[shot.cell] = shot.result === "miss" ? "miss" : "hit";
  });
  const sunk: SeaSunk[] = [];
  for (const placement of state.fleets[player === 1 ? 1 : 0]) {
    const cells = seaShipCells(placement)!;
    if (cells.every((cell) => fired.has(cell))) {
      cells.forEach((cell) => {
        marks[cell] = "sunk";
      });
      sunk.push({ ship: placement.ship, length: cells.length, cells });
    }
  }
  return { marks, sunk: sunk.sort((a, b) => a.ship - b.ship) };
}
export function playSea(
  state: SeaState,
  player: SeaPlayer,
  cell: number,
): SeaState | null {
  if (
    state.winner ||
    player !== state.turn ||
    !validSeaCell(cell) ||
    state.history.some((shot) => shot.player === player && shot.cell === cell)
  )
    return null;
  const target = state.fleets[player === 1 ? 1 : 0];
  const occupied = target.find((placement) =>
    seaShipCells(placement)!.includes(cell),
  );
  const fired = new Set(
    state.history
      .filter((shot) => shot.player === player)
      .map((shot) => shot.cell),
  );
  fired.add(cell);
  const sunk =
    occupied && seaShipCells(occupied)!.every((c) => fired.has(c))
      ? occupied.ship
      : null;
  const shot: SeaShot = {
    player,
    cell,
    result: sunk !== null ? "sunk" : occupied ? "hit" : "miss",
    sunk,
  };
  const winner = target.every((placement) =>
    seaShipCells(placement)!.every((c) => fired.has(c)),
  )
    ? player
    : null;
  return {
    fleets: state.fleets,
    history: [...state.history, shot],
    turn: winner ?? (player === 1 ? 2 : 1),
    winner,
  };
}
export function replaySea(
  fleetA: SeaFleet,
  fleetB: SeaFleet,
  shots: readonly { player: SeaPlayer; cell: number }[],
): SeaState | null {
  let state = newSea(fleetA, fleetB);
  for (const shot of shots) {
    if (!shot || typeof shot !== "object") return null;
    const next = playSea(state, shot.player, shot.cell);
    if (!next) return null;
    state = next;
  }
  return state;
}
/** Structural/geometry checks on the public worker payload, not hidden fleets. */
export function validSeaKnowledge(value: unknown): value is SeaKnowledge {
  if (!value || typeof value !== "object") return false;
  if (Object.keys(value).sort().join(",") !== "marks,sunk") return false;
  const { marks, sunk } = value as SeaKnowledge;
  if (
    !Array.isArray(marks) ||
    marks.length !== 100 ||
    !Array.from(marks).every((mark) =>
      ["unknown", "miss", "hit", "sunk"].includes(mark),
    ) ||
    !Array.isArray(sunk) ||
    sunk.length > 5
  )
    return false;
  const ships = new Set<number>(),
    cells = new Set<number>();
  for (const item of sunk) {
    if (
      !item ||
      Object.keys(item).sort().join(",") !== "cells,length,ship" ||
      !validShip(item.ship) ||
      ships.has(item.ship) ||
      item.length !== SEA_LENGTHS[item.ship] ||
      !Array.isArray(item.cells) ||
      item.cells.length !== item.length ||
      !item.cells.every(validSeaCell)
    )
      return false;
    const sorted = [...item.cells].sort((a, b) => a - b);
    const horizontal = seaShipCells({
      ship: item.ship,
      start: sorted[0],
      axis: "horizontal",
    });
    const vertical = seaShipCells({
      ship: item.ship,
      start: sorted[0],
      axis: "vertical",
    });
    if (
      ![horizontal, vertical].some(
        (line) => line && line.every((cell, i) => cell === sorted[i]),
      ) ||
      sorted.some((cell) => cells.has(cell) || marks[cell] !== "sunk")
    )
      return false;
    sorted.forEach((cell) => cells.add(cell));
    ships.add(item.ship);
  }
  return marks.every((mark, cell) => mark !== "sunk" || cells.has(cell));
}
