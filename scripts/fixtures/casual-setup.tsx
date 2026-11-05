// Dev-only controlled adapter, not a browser storage-policy change.
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Connect4Setup from "../../src/components/Connect4Setup";
import Connect4Game from "../../src/components/Connect4Game";
import TicTacToeSetup from "../../src/components/TicTacToeSetup";
import MatchGame from "../../src/components/MatchGame";
import "../../src/index.css";
import "../../src/design-system.css";
const denied = { getItem: () => null, setItem: () => { throw Error("Controlled quota denial"); } };
function Fixture(){const [game,setGame]=useState("connect4");const [mode,setMode]=useState("denied");return <HelmetProvider><label>Game <select aria-label="Test game" value={game} onChange={e=>setGame(e.target.value)}><option value="connect4">Connect 4</option><option value="tictactoe">Tic-Tac-Toe</option></select></label><label>Storage <select aria-label="Test storage" value={mode} onChange={e=>setMode(e.target.value)}><option value="denied">Denied write adapter</option><option value="malformed">Malformed handoff</option><option value="normal">Browser storage</option></select></label><MemoryRouter key={game+mode} initialEntries={[mode === "malformed" ? { pathname: "/"+game, state: { casualSetup: {} } } : "/"+game+"-setup"]}><Routes><Route path="/connect4-setup" element={<Connect4Setup setupStorage={mode==="denied"?denied:undefined}/>}/><Route path="/connect4" element={<Connect4Game/>}/><Route path="/tictactoe-setup" element={<TicTacToeSetup setupStorage={mode==="denied"?denied:undefined}/>}/><Route path="/tictactoe" element={<MatchGame onBackToHome={()=>{}}/>}/></Routes></MemoryRouter></HelmetProvider>}
createRoot(document.getElementById("root")!).render(<StrictMode><Fixture/></StrictMode>);
