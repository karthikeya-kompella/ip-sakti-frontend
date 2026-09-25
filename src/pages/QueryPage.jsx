import { useState } from "react";
import ComparePage from "./ComparePage";
import { useSearchParams } from "react-router-dom";
import { JurisdictionSelector, QuestionInput, AnswerCard, CitationPanel, ErrorMessage, useRegimes } from "../components/ui";
import { query } from "../services/api";

function Single() {
  const [sp] = useSearchParams(), { label } = useRegimes();
  const [regime, setRegime] = useState(sp.get("regime") || ""), [q, setQ] = useState(""), [k, setK] = useState(5), [lang, setLang] = useState("auto");
  const [busy, setBusy] = useState(false), [err, setErr] = useState(""), [res, setRes] = useState(null), [open, setOpen] = useState(false);
  const go = async e => {
    e.preventDefault(); if (!regime) return setErr("Select a jurisdiction first.");
    setBusy(true); setErr(""); setRes(null);
    try { setRes(await query(q.trim(), regime, k, lang)); } catch (x) { setErr(x.message); } finally { setBusy(false); }
  };
  const cites = res?.citations || [];
  return (
    <div className="work">
      <section className="main">
        <h1>Ask IP-SAKTI</h1><p className="muted">Get source-grounded regulatory guidance for your selected jurisdiction.</p>
        <form onSubmit={go} className="glass pad">
          <label>Jurisdiction</label><JurisdictionSelector value={regime} onChange={setRegime} />
          <label htmlFor="rl">Response language</label><select id="rl" value={lang} onChange={e => setLang(e.target.value)}><option value="auto">Auto-detect</option><option value="en">English</option><option value="hi">Hindi</option><option value="te">Telugu</option></select>
          <QuestionInput value={q} onChange={setQ} k={k} onK={setK} busy={busy} />
        </form>
        <ErrorMessage m={err} />
        {res && <AnswerCard label={label(res.regime || regime)} answer={res.answer} count={cites.length} onCites={() => setOpen(true)} />}
      </section>
      <CitationPanel cites={cites} open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

export default function Portal() {
  const [sp, setSp] = useSearchParams(), mode = sp.get("mode") === "compare" ? "compare" : "single";
  const set = m => setSp(m === "compare" ? { mode: "compare" } : {});
  return (<div><div className="seg" role="group" aria-label="Query mode">
    {[["single", "Single jurisdiction"], ["compare", "Compare jurisdictions"]].map(([m, t]) => <button key={m} className={"reg" + (mode === m ? " on" : "")} aria-pressed={mode === m} onClick={() => set(m)}>{t}</button>)}
  </div>{mode === "compare" ? <ComparePage /> : <Single />}</div>);
}
