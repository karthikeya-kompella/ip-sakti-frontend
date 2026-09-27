import { useState } from "react";
import ComparePage from "./ComparePage";
import { useSearchParams } from "react-router-dom";

import {
  JurisdictionSelector,
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

  /* ----------------------------------------------------------
     STATE
  ---------------------------------------------------------- */

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

    /* --------------------------------------------------------
       CHECK BROWSER SUPPORT
    -------------------------------------------------------- */

    if (!SpeechRecognition) {
      alert(
        "Voice input isn't supported in this browser. Try Chrome or Microsoft Edge."
      );

      return;
    }


    /* --------------------------------------------------------
       CREATE RECOGNITION
    -------------------------------------------------------- */

    const recognition =
      new SpeechRecognition();


    /* --------------------------------------------------------
       VOICE LANGUAGE
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
      console.log(
        "🎤 Voice recognition started"
      );

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
          "No speech was detected. Please try again."
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

    try {
      recognition.start();
    } catch (error) {
      console.error(
        "Failed to start speech recognition:",
        error
      );

      setListening(false);
    }
  };


  /* ==========================================================
     SUBMIT QUERY
  ========================================================== */

  const go = async (e) => {
    e.preventDefault();


    /* --------------------------------------------------------
       CHECK JURISDICTION
    -------------------------------------------------------- */

    if (!regime) {
      setErr(
        "Select a jurisdiction first."
      );

      return;
    }


    /* --------------------------------------------------------
       CHECK QUESTION
    -------------------------------------------------------- */

    if (!q.trim()) {
      setErr(
        "Please enter a question first."
      );

      return;
    }


    /* --------------------------------------------------------
       START LOADING
    -------------------------------------------------------- */

    setBusy(true);

    setErr("");

    setRes(null);


    /* --------------------------------------------------------
       API REQUEST
    -------------------------------------------------------- */

    try {
      const result = await query(
        q.trim(),
        regime,
        k,
        lang
      );

      console.log(
        "QUERY RESPONSE:",
        result
      );

      setRes(result);

    } catch (x) {
      setErr(
        x.message ||
        "Something went wrong."
      );

    } finally {
      setBusy(false);
    }
  };


  /* ==========================================================
     CITATIONS
  ========================================================== */

  const cites = res?.citations || [];


  /* ==========================================================
     CONFIDENCE
  ========================================================== */

  const confidence =
    res?.confidence || null;


  /* ==========================================================
     UI
  ========================================================== */

  return (
    <div className="work">

      <section className="main">

        {/* ----------------------------------------------------
            HEADER
        ---------------------------------------------------- */}

        <h1>
          Ask IP-SAKTI
        </h1>

        <p className="muted">
          Get source-grounded regulatory guidance
          for your selected jurisdiction.
        </p>


        {/* ====================================================
            QUERY FORM
        ==================================================== */}

        <form
          onSubmit={go}
          className="glass pad"
        >

          {/* ==================================================
              JURISDICTION
          ================================================== */}

          <label>
            Jurisdiction
          </label>

          <JurisdictionSelector
            value={regime}
            onChange={setRegime}
          />


          {/* ==================================================
              RESPONSE LANGUAGE
          ================================================== */}

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


          {/* ==================================================
              QUESTION
          ================================================== */}

          <label
            htmlFor="question"
            style={{
              display: "block",
              marginTop: "12px",
            }}
          >
            Your question
          </label>


          <div
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "flex-start",
              width: "100%",
            }}
          >

            {/* ------------------------------------------------
                TEXTAREA
            ------------------------------------------------ */}

            <textarea
              id="question"
              value={q}
              onChange={(e) =>
                setQ(e.target.value)
              }
              placeholder="Ask about patents, regulatory approval, traditional knowledge, Ayurveda products, or compliance requirements..."
              disabled={busy}
              rows={5}
              style={{
                flex: 1,
                width: "100%",
                resize: "vertical",
              }}
            />


            {/* ------------------------------------------------
                MICROPHONE
            ------------------------------------------------ */}

            <button
              type="button"
              onClick={startVoiceInput}
              title="Speak your question"
              disabled={
                busy || listening
              }
              style={{
                padding: "10px 14px",
                background: "#1a3a2e",
                border: "1px solid #2ecc71",
                borderRadius: "6px",
                color: "#2ecc71",
                cursor:
                  busy || listening
                    ? "not-allowed"
                    : "pointer",
                fontSize: "18px",
                opacity:
                  busy || listening
                    ? 0.6
                    : 1,
              }}
            >
              {listening
                ? "🔴"
                : "🎤"}
            </button>

          </div>


          {/* ==================================================
              VOICE STATUS
          ================================================== */}

          {listening && (
            <p
              className="muted"
              style={{
                marginTop: "8px",
                marginBottom: "0",
              }}
            >
              🎤 Listening... Speak your
              question now.
            </p>
          )}


          {/* ==================================================
              TOP K
          ================================================== */}

          <div
            style={{
              marginTop: "12px",
            }}
          >

            <label htmlFor="top-k">
              Number of sources
            </label>

            <select
              id="top-k"
              value={k}
              onChange={(e) =>
                setK(
                  Number(e.target.value)
                )
              }
              disabled={busy}
            >
              <option value={3}>
                3 sources
              </option>

              <option value={5}>
                5 sources
              </option>

              <option value={8}>
                8 sources
              </option>

              <option value={10}>
                10 sources
              </option>
            </select>

          </div>


          {/* ==================================================
              ASK BUTTON
          ================================================== */}

          <button
            type="submit"
            className="btn"
            disabled={
              busy || listening
            }
            style={{
              marginTop: "15px",
            }}
          >
            {busy
              ? "Searching..."
              : "Ask IP-SAKTI"}
          </button>

        </form>


        {/* ====================================================
            ERROR
        ==================================================== */}

        <ErrorMessage m={err} />


        {/* ====================================================
            RESPONSE
        ==================================================== */}

        {res && (
          <>

            {/* =================================================
                CONFIDENCE BADGE
            ================================================= */}

            {confidence && (
              <div
                style={{
                  display: "inline-block",
                  padding: "4px 10px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  marginTop: "12px",
                  marginBottom: "8px",

                  background:
                    confidence.level === "high"
                      ? "#1a4d2e"
                      : confidence.level === "medium"
                      ? "#4d4a1a"
                      : "#4d1a1a",

                  color:
                    confidence.level === "high"
                      ? "#4ade80"
                      : confidence.level === "medium"
                      ? "#facc15"
                      : "#f87171",
                }}
              >

                Confidence:{" "}

                {confidence.level
                  ? confidence.level.toUpperCase()
                  : "UNKNOWN"}

                {" "}

                (
                {typeof confidence.score ===
                "number"
                  ? confidence.score
                  : "N/A"}
                )

              </div>
            )}


            {/* =================================================
                CONFIDENCE NOTE
            ================================================= */}

            {confidence?.note && (
              <p
                className="muted"
                style={{
                  marginTop: "0",
                  marginBottom: "12px",
                  fontSize: "13px",
                }}
              >
                {confidence.note}
              </p>
            )}


            {/* =================================================
                ANSWER
            ================================================= */}

            <AnswerCard
              label={label(
                res.regime || regime
              )}
              answer={res.answer}
              count={cites.length}
              onCites={() =>
                setOpen(true)
              }
            />

          </>
        )}

      </section>


      {/* ======================================================
          CITATIONS
      ====================================================== */}

      <CitationPanel
        cites={cites}
        open={open}
        onClose={() =>
          setOpen(false)
        }
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


  /* ==========================================================
     CHANGE MODE
  ========================================================== */

  const set = (m) => {
    setSp(
      m === "compare"
        ? { mode: "compare" }
        : {}
    );
  };


  /* ==========================================================
     UI
  ========================================================== */

  return (
    <div>

      {/* ======================================================
          MODE SWITCH
      ====================================================== */}

      <div
        className="seg"
        role="group"
        aria-label="Query mode"
      >

        {[
          [
            "single",
            "Single jurisdiction",
          ],
          [
            "compare",
            "Compare jurisdictions",
          ],
        ].map(([m, t]) => (

          <button
            key={m}
            className={
              "reg" +
              (mode === m
                ? " on"
                : "")
            }
            aria-pressed={
              mode === m
            }
            onClick={() =>
              set(m)
            }
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
