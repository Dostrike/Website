import {
  SEA_LENGTHS,
  seaRandom,
  seaShipCells,
  validSeaKnowledge,
} from "./seaBattleEngine";
import type { SeaKnowledge, SeaShipId } from "./seaBattleEngine";
export type SeaLevel = "easy" | "medium" | "hard";
export type SeaChoice = { cell: number; reason: string; examined: number };

/** Pure public-information opponent; no full-state or fleet-seed argument. */
export function chooseSeaShot(
  knowledge: SeaKnowledge,
  level: SeaLevel,
  decisionSeed: number,
): SeaChoice | null {
  if (
    !validSeaKnowledge(knowledge) ||
    !["easy", "medium", "hard"].includes(level)
  )
    throw Error("Invalid sea decision request");
  const random = seaRandom(decisionSeed);
  const unknown = knowledge.marks.flatMap((mark, cell) =>
    mark === "unknown" ? [cell] : [],
  );
  if (!unknown.length || knowledge.sunk.length === 5) return null;
  const pick = (cells: number[]) => cells[Math.floor(random() * cells.length)];
  const hits = knowledge.marks.flatMap((mark, cell) =>
    mark === "hit" ? [cell] : [],
  );
  if (level === "easy")
    return {
      cell: pick(unknown),
      reason: "Seeded choice among unused coordinates.",
      examined: 0,
    };
  if (level === "medium") {
    const neighbors = unknown.filter((cell) =>
      hits.some(
        (hit) =>
          Math.abs(Math.floor(hit / 10) - Math.floor(cell / 10)) +
            Math.abs((hit % 10) - (cell % 10)) ===
          1,
      ),
    );
    const checkerboard = unknown.filter(
      (cell) => (Math.floor(cell / 10) + (cell % 10)) % 2 === 0,
    );
    return {
      cell: pick(
        neighbors.length
          ? neighbors
          : checkerboard.length
            ? checkerboard
            : unknown,
      ),
      reason: neighbors.length
        ? "Try an unused neighbor of an unresolved hit; touching ships may be separate."
        : "Hunt unused checkerboard cells, then remaining coordinates.",
      examined: 0,
    };
  }
  const hunt = new Array<number>(100).fill(0),
    target = new Array<number>(100).fill(0);
  const sunk = new Set(knowledge.sunk.map((ship) => ship.ship));
  let examined = 0;
  SEA_LENGTHS.forEach((_, id) => {
    if (sunk.has(id as SeaShipId)) return;
    for (let start = 0; start < 100; start++)
      for (const axis of ["horizontal", "vertical"] as const) {
        examined++;
        const cells = seaShipCells({ ship: id as SeaShipId, start, axis });
        if (
          !cells ||
          cells.some((cell) => ["miss", "sunk"].includes(knowledge.marks[cell]))
        )
          continue;
        const covered = cells.filter(
          (cell) => knowledge.marks[cell] === "hit",
        ).length;
        for (const cell of cells)
          if (knowledge.marks[cell] === "unknown") {
            hunt[cell]++;
            // A larger hit count favors aligned continuations, without declaring a cluster one ship.
            if (covered) target[cell] += covered * covered;
          }
      }
  });
  const targetScore = Math.max(...unknown.map((cell) => target[cell]));
  const scores = targetScore > 0 ? target : hunt;
  const best = Math.max(...unknown.map((cell) => scores[cell]));
  return {
    cell: pick(unknown.filter((cell) => scores[cell] === best)),
    reason:
      targetScore > 0
        ? "Count individually compatible placements through observed hits; this is a heuristic, not a fleet probability."
        : "Count individually compatible remaining-ship placements; this is a heuristic, not a fleet probability.",
    examined,
  };
}
