import { useEffect, useRef } from "react";
export default function Shader({ k = 0.5 }) {
  const r = useRef();
  useEffect(() => window.initShader?.(r.current, k), [k]);
  return <canvas ref={r} className="bg" aria-hidden="true" />;
}
