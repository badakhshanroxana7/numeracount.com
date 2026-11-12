import Link from "next/link";

export default function Brand({ light = false }: { light?: boolean }) {
  return <Link href="/" className={`brand${light ? " brand-white" : ""}`} aria-label="Numeracount home">
    <span className="brand-mark brand-abacus" aria-hidden="true">
      <svg viewBox="0 0 40 40" fill="none" focusable="false">
        <rect x="5" y="5" width="30" height="30" rx="5" stroke="currentColor" strokeWidth="2"/>
        <path d="M8 13h24M8 20h24M8 27h24" stroke="currentColor" strokeWidth="1.6"/>
        <g fill="currentColor"><rect x="11" y="9" width="4" height="8" rx="2"/><rect x="17" y="9" width="4" height="8" rx="2"/><rect x="22" y="16" width="4" height="8" rx="2"/><rect x="28" y="16" width="4" height="8" rx="2"/><rect x="11" y="23" width="4" height="8" rx="2"/><rect x="17" y="23" width="4" height="8" rx="2"/><rect x="23" y="23" width="4" height="8" rx="2"/></g>
      </svg>
    </span>
    <span>numera<span className="brand-light">count</span></span>
  </Link>;
}
