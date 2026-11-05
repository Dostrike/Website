import lessons from "../data/connect4Lessons.json";
import "./Connect4Lessons.css";

export default function Connect4Lessons({
  scope,
}: {
  scope: "strategy" | "endgame";
}) {
  return (
    <section
      className="connect4-lessons"
      aria-label="Checked Connect 4 examples"
    >
      {lessons
        .filter((lesson) => lesson.scope === scope)
        .map((lesson) => (
          <figure key={lesson.id}>
            <table>
              <caption>{lesson.title}</caption>
              <thead>
                <tr>
                  <th scope="col">r/c</th>
                  {Array.from({ length: 7 }, (_, c) => (
                    <th scope="col" key={c}>
                      {c + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lesson.rows.map((row, r) => (
                  <tr key={r}>
                    <th scope="row">{r + 1}</th>
                    {Array.from(row, (cell, c) => (
                      <td
                        key={c}
                        className={
                          cell === "R"
                            ? "lesson-red"
                            : cell === "Y"
                              ? "lesson-yellow"
                              : ""
                        }
                        aria-label={`row ${r + 1} column ${c + 1}: ${cell === "R" ? "Red" : cell === "Y" ? "Yellow" : "empty"}`}
                      >
                        {cell === "." ? "·" : cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <figcaption>
              {lesson.moves.length % 2 === 0 ? "Red" : "Yellow"} to move. R =
              Red, Y = Yellow, · = empty. Columns run left to right; row 1 is
              the top. This read-only example is explained below.
            </figcaption>
          </figure>
        ))}
    </section>
  );
}
