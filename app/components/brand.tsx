import Link from "next/link";

export default function Brand({ light = false }: { light?: boolean }) {
  return <Link href="/" className={`brand${light ? " brand-white" : ""}`} aria-label="Numeracount home">
    <span className="brand-mark brand-abacus" aria-hidden="true">
      <svg viewBox="0 0 40 40" fill="none" focusable="false">
        <rect x="5" y="5" width="30" height="30" rx="5" stroke="currentColor" strokeWidth="2"/>
        <path d="M8 12h24M8 20h24M8 28h24" stroke="currentColor" strokeWidth="1.6"/>
        <g fill="currentColor"><rect x="11" y="9" width="4" height="6" rx="2"/><rect x="18" y="9" width="4" height="6" rx="2"/><rect x="22" y="17" width="4" height="6" rx="2"/><rect x="29" y="17" width="4" height="6" rx="2"/><rect x="11" y="25" width="4" height="6" rx="2"/><rect x="18" y="25" width="4" height="6" rx="2"/><rect x="25" y="25" width="4" height="6" rx="2"/></g>
      </svg>
    </span>
    <span>numera<span className="brand-light">count</span></span>
  </Link>;
}
