// Dev-only dependency injection; never changes browser storage policy.
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import MemoryGame from "../../src/components/MemoryGame";
import "../../src/index.css";
import "../../src/design-system.css";
const denied = { getItem: () => { throw new Error("Controlled read denial"); }, setItem: () => { throw new Error("Controlled write denial"); } };
const quota = { getItem: () => null, setItem: () => { throw new Error("Controlled quota denial"); } };
function Fixture() {
 const [mode, setMode] = useState("denied");
 return <HelmetProvider><MemoryRouter><label>Test storage <select aria-label="Test storage" value={mode} onChange={e=>setMode(e.target.value)}><option value="denied">Controlled denied adapter</option><option value="quota">Controlled write denial</option><option value="normal">Browser storage</option></select></label><MemoryGame key={mode} recordStorage={mode === "denied" ? denied : mode === "quota" ? quota : undefined}/></MemoryRouter></HelmetProvider>;
}
createRoot(document.getElementById("root")!).render(<StrictMode><Fixture/></StrictMode>);
