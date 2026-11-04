export type SlideRecords = {
  rounds: number;
  targets: number;
  assistedTargets: number;
  unassistedTargets: number;
  bestScore: number;
  bestTile: number;
  lastDaily: string | null;
  streak: number;
  bestStreak: number;
  recent: { id: string; target: boolean; assisted: boolean }[];
};
const key = "dostrike-slide-merge-records-v1";
export const emptySlideRecords = (): SlideRecords => ({
  rounds: 0,
  targets: 0,
  assistedTargets: 0,
  unassistedTargets: 0,
  bestScore: 0,
  bestTile: 0,
  lastDaily: null,
  streak: 0,
  bestStreak: 0,
  recent: [],
});
export function readSlideRecords(): SlideRecords {
  const r = emptySlideRecords();
  try {
    const v = JSON.parse(localStorage.getItem(key) || "null");
    for (const k of [
      "rounds",
      "targets",
      "assistedTargets",
      "unassistedTargets",
      "bestScore",
      "bestTile",
      "streak",
      "bestStreak",
    ] as const)
      if (Number.isSafeInteger(v?.[k]) && v[k] >= 0) r[k] = v[k];
    if (
      typeof v?.lastDaily === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(v.lastDaily)
    )
      r.lastDaily = v.lastDaily;
    if (Array.isArray(v?.recent))
      r.recent = v.recent
        .filter((x: unknown) => {
          const e = x as SlideRecords["recent"][number];
          return (
            e &&
            typeof e.id === "string" &&
            e.id.length <= 100 &&
            typeof e.target === "boolean" &&
            typeof e.assisted === "boolean"
          );
        })
        .slice(-128);
  } catch {
    /* Optional storage. */
  }
  return r;
}
const previous = (day: string) => {
  const [y, m, d] = day.split("-").map(Number),
    v = new Date(Date.UTC(y, m - 1, d - 1));
  return `${v.getUTCFullYear()}-${String(v.getUTCMonth() + 1).padStart(2, "0")}-${String(v.getUTCDate()).padStart(2, "0")}`;
};
export const slideStreak = (r: SlideRecords, day: string) =>
  r.lastDaily === day || r.lastDaily === previous(day) ? r.streak : 0;
export function recordSlideProgress(
  r: SlideRecords,
  event: {
    id: string;
    played: boolean;
    target: boolean;
    assisted: boolean;
    score: number;
    tile: number;
    day: string | null;
    today: string;
  },
): SlideRecords {
  if (!event.played) return r;
  const old = r.recent.find((e) => e.id === event.id),
    target = !!old?.target || event.target,
    assisted = !!old?.assisted || event.assisted;
  const next = {
    ...r,
    rounds: r.rounds + (old ? 0 : 1),
    targets: r.targets + (target && !old?.target ? 1 : 0),
    bestScore: Math.max(r.bestScore, event.score),
    bestTile: Math.max(r.bestTile, event.tile),
    recent: [
      ...r.recent.filter((e) => e.id !== event.id),
      { id: event.id, target, assisted },
    ].slice(-128),
  };
  if (old?.target) {
    if (assisted && !old.assisted) {
      next.unassistedTargets = Math.max(0, next.unassistedTargets - 1);
      next.assistedTargets++;
    }
  } else if (target) {
    if (assisted) next.assistedTargets++;
    else next.unassistedTargets++;
  }
  if (target && event.day === event.today && r.lastDaily !== event.today) {
    next.lastDaily = event.today;
    next.streak = r.lastDaily === previous(event.today) ? r.streak + 1 : 1;
    next.bestStreak = Math.max(r.bestStreak, next.streak);
  }
  return next;
}
export function writeSlideRecords(r: SlideRecords) {
  try {
    localStorage.setItem(key, JSON.stringify(r));
  } catch {
    /* Optional storage. */
  }
}
