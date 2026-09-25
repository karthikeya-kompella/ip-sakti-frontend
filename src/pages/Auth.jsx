import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { register, isAdmin } from "../services/api";
import { ErrorMessage } from "../components/ui";
import Shader from "../components/Shader";

function Frame({ title, sub, children }) {
  return <main className="auth"><Shader k={0.8} /><div className="glass box"><a href="/" className="tag">← Back to overview</a><h2>{title}</h2><p className="muted">{sub}</p>{children}</div></main>;
}
export function LoginPage() {
  const { login, isAuthenticated, email } = useAuth(), nav = useNavigate();
  const [f, setF] = useState({ email: "", password: "" }), [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  if (isAuthenticated) return <Navigate to={isAdmin(email) ? "/admin" : "/query"} replace />;
  const go = async e => { e.preventDefault(); setBusy(true); setErr(""); try { await login(f.email, f.password); nav(isAdmin(f.email) ? "/admin" : "/query"); } catch (x) { setErr(x.message); setBusy(false); } };
  return (
    <Frame title="Log in" sub="Access source-grounded regulatory research.">
      <form onSubmit={go}><label htmlFor="e">Email</label><input id="e" type="email" required autoComplete="username" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} />
        <label htmlFor="p">Password</label><input id="p" type="password" required autoComplete="current-password" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} />
        <ErrorMessage m={err} /><button className="btn pri" disabled={busy}>{busy ? "Logging in..." : "Log in"}</button></form>
      <p className="muted">No account? <Link to="/register">Create one</Link></p>
    </Frame>
  );
}
export function RegisterPage() {
  const nav = useNavigate();
  const [f, setF] = useState({ email: "", password: "", confirm: "" }), [err, setErr] = useState(""), [ok, setOk] = useState(false), [busy, setBusy] = useState(false);
  const go = async e => {
    e.preventDefault(); setErr("");
    if (f.password !== f.confirm) return setErr("Passwords do not match.");
    setBusy(true);
    try { await register(f.email, f.password); setOk(true); setTimeout(() => nav("/login"), 1400); } catch (x) { setErr(x.message); setBusy(false); }
  };
  return (
    <Frame title="Create account" sub="Register to start asking questions.">
      <form onSubmit={go}>{["email", "password", "confirm"].map(k => (<div key={k}><label htmlFor={k}>{k === "confirm" ? "Confirm password" : k}</label>
        <input id={k} type={k === "email" ? "email" : "password"} required minLength={k === "email" ? undefined : 8} value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} /></div>))}
        <ErrorMessage m={err} />{ok && <div className="ok" role="status">Account created. Redirecting to login...</div>}
        <button className="btn pri" disabled={busy}>{busy ? "Creating account..." : "Register"}</button></form>
      <p className="muted">Already registered? <Link to="/login">Log in</Link></p>
    </Frame>
  );
}
