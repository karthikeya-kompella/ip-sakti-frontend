import { useState } from "react";
import ComparePage from "./ComparePage";
import { useSearchParams } from "react-router-dom";

import {
  JurisdictionSelector,
  QuestionInput,
  AnswerCard,
  CitationPanel,
  ErrorMessage,
  useRegimes,
} from "../components/ui";

import { query } from "../services/api";


/* ============================================================
   SINGLE JURISDICTION QUERY
============================================================ */

function Single() {

  const [sp] = useSearchParams();

  const { label } = useRegimes();

  const [regime, setRegime] = useState(
    sp.get("regime") || ""
  );

  const [q, setQ] = useState("");

  const [k, setK] = useState(5);

  const [lang, setLang] = useState("auto");

  const [busy, setBusy] = useState(false);

  const [err, setErr] = useState("");

  const [res, setRes] = useState(null);

  const [open, setOpen] = useState(false);

  const [listening, setListening] = useState(false);


  /* ==========================================================
     VOICE INPUT
  ========================================================== */

  const startVoiceInput = () => {

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    // Browser does not support speech recognition
    if (!SpeechRecognition) {

      setErr(
        "Voice input is not supported in this browser. Please use Google Chrome or Microsoft Edge."
      );

      return;
    }

    const recognition = new SpeechRecognition();

    /* --------------------------------------------------------
       Select language based on response language
    -------------------------------------------------------- */

    const voiceLanguages = {
      en: "en-IN",
      hi: "hi-IN",
      te: "te-IN",
    };

    recognition.lang =
      voiceLanguages[lang] || "en-IN";

    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.maxAlternatives = 1;


    /* --------------------------------------------------------
       START
    -------------------------------------------------------- */

    recognition.onstart = () => {

      console.log("🎤 Voice recognition started");

      setListening(true);

      setErr("");

    };


    /* --------------------------------------------------------
       RESULT
    -------------------------------------------------------- */

    recognition.onresult = (event) => {

      const transcript =
        event.results[0][0].transcript;

      console.log(
        "🎤 Transcript:",
        transcript
      );

      // Put recognized speech into question box
      setQ(transcript);

    };


    /* --------------------------------------------------------
       END
    -------------------------------------------------------- */

    recognition.onend = () => {

      console.log(
        "🎤 Voice recognition ended"
      );

      setListening(false);

    };


    /* --------------------------------------------------------
       ERROR
    -------------------------------------------------------- */

    recognition.onerror = (event) => {

      console.error(
        "🎤 Speech recognition error:",
        event.error
      );

      setListening(false);

      if (event.error === "not-allowed") {

        setErr(
          "Microphone permission was denied. Please allow microphone access in your browser."
        );

      } else if (event.error === "no-speech") {

        setErr(
          "No speech was detected. Please try speaking again."
        );

      } else {

        setErr(
          "Voice input failed. Please try again."
        );

      }

    };


    /* --------------------------------------------------------
       START RECOGNITION
    -------------------------------------------------------- */

    recognition.start();

  };


  /* ==========================================================
     SUBMIT QUERY
  ========================================================== */

  const go = async (e) => {

    e.preventDefault();

    if (!regime) {

      setErr(
        "Select a jurisdiction first."
      );

      return;
    }

    if (!q.trim()) {

      setErr(
        "Please enter a question first."
      );

      return;
    }

    setBusy(true);

    setErr("");

    setRes(null);

    try {

      const result = await query(
        q.trim(),
        regime,
        k,
        lang
      );

      setRes(result);

    } catch (x) {

      setErr(
        x.message || "Something went wrong."
      );

    } finally {

      setBusy(false);

    }

  };


  const cites = res?.citations || [];


  /* ==========================================================
     UI
  ========================================================== */

  return (

    <div className="work">

      <section className="main">

        <h1>
          Ask IP-SAKTI
        </h1>

        <p className="muted">
          Get source-grounded regulatory guidance
          for your selected jurisdiction.
        </p>


        {/* ==================================================
            QUERY FORM
        ================================================== */}

        <form
          onSubmit={go}
          className="glass pad"
        >

          {/* ----------------------------------------------
              JURISDICTION
          ---------------------------------------------- */}

          <label>
            Jurisdiction
          </label>

          <JurisdictionSelector
            value={regime}
            onChange={setRegime}
          />


          {/* ----------------------------------------------
              RESPONSE LANGUAGE
          ---------------------------------------------- */}

          <label htmlFor="rl">
            Response language
          </label>

          <select
            id="rl"
            value={lang}
            onChange={(e) =>
              setLang(e.target.value)
            }
          >

            <option value="auto">
              Auto-detect
            </option>

            <option value="en">
              English
            </option>

            <option value="hi">
              Hindi
            </option>

            <option value="te">
              Telugu
            </option>

          </select>


          {/* ----------------------------------------------
              QUESTION INPUT
          ---------------------------------------------- */}

          <QuestionInput
            value={q}
            onChange={setQ}
            k={k}
            onK={setK}
            busy={busy}
          />


          {/* ----------------------------------------------
              VOICE INPUT BUTTON
          ---------------------------------------------- */}

          <button
            type="button"
            className="btn"
            onClick={startVoiceInput}
            disabled={busy || listening}
            style={{
              marginTop: "10px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >

            {listening ? (
              <>
                🔴 Listening...
              </>
            ) : (
              <>
                🎤 Speak
              </>
            )}

          </button>


          {/* ----------------------------------------------
              VOICE STATUS
          ---------------------------------------------- */}

          {listening && (
            <p
              className="muted"
              style={{
                marginTop: "8px",
              }}
            >
              Speak your question now...
            </p>
          )}

        </form>


        {/* ==================================================
            ERROR
        ================================================== */}

        <ErrorMessage m={err} />


        {/* ==================================================
            ANSWER
        ================================================== */}

        {res && (

          <AnswerCard
            label={label(
              res.regime || regime
            )}
            answer={res.answer}
            count={cites.length}
            onCites={() => setOpen(true)}
          />

        )}

      </section>


      {/* ====================================================
          CITATIONS
      ==================================================== */}

      <CitationPanel
        cites={cites}
        open={open}
        onClose={() => setOpen(false)}
      />

    </div>

  );
}


/* ============================================================
   QUERY PORTAL
============================================================ */

export default function Portal() {

  const [sp, setSp] =
    useSearchParams();

  const mode =
    sp.get("mode") === "compare"
      ? "compare"
      : "single";


  const set = (m) => {

    setSp(
      m === "compare"
        ? { mode: "compare" }
        : {}
    );

  };


  return (

    <div>

      {/* ======================================================
          QUERY MODE SWITCH
      ====================================================== */}

      <div
        className="seg"
        role="group"
        aria-label="Query mode"
      >

        {[
          ["single", "Single jurisdiction"],
          ["compare", "Compare jurisdictions"],
        ].map(([m, t]) => (

          <button
            key={m}
            className={
              "reg" +
              (mode === m ? " on" : "")
            }
            aria-pressed={
              mode === m
            }
            onClick={() => set(m)}
          >
            {t}
          </button>

        ))}

      </div>


      {/* ======================================================
          PAGE
      ====================================================== */}

      {mode === "compare" ? (
        <ComparePage />
      ) : (
        <Single />
      )}

    </div>

  );

}
