// Dev-only interactive regression fixture, not imported by the production app.
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Connect4Game from "../../src/components/Connect4Game";
import "../../src/index.css";
import "../../src/design-system.css";
function Fixture() {
  const [timing, setTiming] = useState("delayed");
  return (
    <HelmetProvider>
      <MemoryRouter>
        <div className={`app fixture-${timing}`}>
          <style>
            {
              ".fixture-delayed .c4-board-wrapper { --c4-drop-duration:450ms !important; } .fixture-instant .c4-board-wrapper { --c4-drop-duration:0ms !important; }"
            }
          </style>
          <aside aria-label="Local test controls" style={{ padding: 16 }}>
            <p>
              Dev-only test. This selects the commit delay without changing the
              device motion preference.
            </p>
            <label>
              Drop timing{" "}
              <select
                aria-label="Drop timing"
                value={timing}
                onChange={(event) => setTiming(event.target.value)}
              >
                <option value="delayed">450ms pending move</option>
                <option value="instant">0ms pending move</option>
                <option value="native">Device preference</option>
              </select>
            </label>
          </aside>
          <Connect4Game />
        </div>
      </MemoryRouter>
    </HelmetProvider>
  );
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
