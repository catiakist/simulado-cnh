// Renders a visual representation of a Brazilian CTB traffic sign
// R = Regulatory (red circle), A = Warning (yellow triangle), S/D = Info (blue rect)

interface Props {
  code: string;
}

function getSignType(code: string): 'R' | 'A' | 'S' | 'D' | 'SAU' | 'TAR' | 'THC' | 'TNA' | 'DEF' | '?' {
  if (code.startsWith('R-')) return 'R';
  if (code.startsWith('A-')) return 'A';
  if (code.startsWith('S-') || code.startsWith('SI-')) return 'S';
  if (code.startsWith('D-')) return 'D';
  if (code.startsWith('SAU')) return 'SAU';
  if (code.startsWith('TAR')) return 'TAR';
  if (code.startsWith('THC') || code.startsWith('TNA')) return 'THC';
  if (code.startsWith('DEF')) return 'DEF';
  return '?';
}

function getLabel(type: ReturnType<typeof getSignType>): string {
  switch (type) {
    case 'R': return 'Regulamentação';
    case 'A': return 'Advertência';
    case 'S': return 'Serviços auxiliares';
    case 'D': return 'Direção / Indicação';
    case 'SAU': return 'Sinalização de área urbana';
    case 'TAR': return 'Trânsito em área rural';
    case 'THC': case 'TNA': return 'Trânsito em via especial';
    case 'DEF': return 'Defesa civil';
    default: return 'Sinalização viária';
  }
}

function SignShape({ code, type }: { code: string; type: ReturnType<typeof getSignType> }) {
  const shortCode = code.replace(/^[A-Z]+-/, '');

  if (type === 'R') {
    return (
      <svg viewBox="0 0 100 100" width="110" height="110">
        {/* White fill */}
        <circle cx="50" cy="50" r="46" fill="white" />
        {/* Red border */}
        <circle cx="50" cy="50" r="46" fill="none" stroke="#d32f2f" strokeWidth="8" />
        {/* Code text */}
        <text x="50" y="44" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#d32f2f" fontFamily="Arial, sans-serif">R</text>
        <text x="50" y="62" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#1a1a1a" fontFamily="Arial, sans-serif">{shortCode}</text>
      </svg>
    );
  }

  if (type === 'A') {
    // Triangle pointing up
    const pts = '50,8 95,88 5,88';
    return (
      <svg viewBox="0 0 100 100" width="110" height="110">
        <polygon points={pts} fill="#fff176" stroke="#f9a825" strokeWidth="6" strokeLinejoin="round" />
        <text x="50" y="62" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#1a1a1a" fontFamily="Arial, sans-serif">A</text>
        <text x="50" y="78" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1a1a1a" fontFamily="Arial, sans-serif">{shortCode}</text>
      </svg>
    );
  }

  if (type === 'S' || type === 'SAU') {
    return (
      <svg viewBox="0 0 100 80" width="110" height="88">
        <rect x="4" y="4" width="92" height="72" rx="6" fill="#1565c0" stroke="#0d47a1" strokeWidth="4" />
        <text x="50" y="38" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white" fontFamily="Arial, sans-serif">S</text>
        <text x="50" y="56" textAnchor="middle" fontSize="13" fontWeight="bold" fill="white" fontFamily="Arial, sans-serif">{shortCode}</text>
      </svg>
    );
  }

  if (type === 'D') {
    return (
      <svg viewBox="0 0 110 80" width="120" height="88">
        {/* Direction sign shape with arrow right */}
        <path d="M4,4 H80 L106,40 L80,76 H4 Z" fill="#1565c0" stroke="#0d47a1" strokeWidth="4" />
        <text x="44" y="38" textAnchor="middle" fontSize="13" fontWeight="bold" fill="white" fontFamily="Arial, sans-serif">D</text>
        <text x="44" y="56" textAnchor="middle" fontSize="13" fontWeight="bold" fill="white" fontFamily="Arial, sans-serif">{shortCode}</text>
      </svg>
    );
  }

  // Default: generic sign shape
  return (
    <svg viewBox="0 0 100 100" width="110" height="110">
      <rect x="5" y="5" width="90" height="90" rx="8" fill="#eceff1" stroke="#607d8b" strokeWidth="5" />
      <text x="50" y="42" textAnchor="middle" fontSize="11" fill="#455a64" fontFamily="Arial, sans-serif">{code.split('-')[0]}</text>
      <text x="50" y="62" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#263238" fontFamily="Arial, sans-serif">{shortCode}</text>
    </svg>
  );
}

export default function SignBadge({ code }: Props) {
  const type = getSignType(code);
  const label = getLabel(type);

  function handleImgError(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.target as HTMLImageElement;
    if (img.src.endsWith('.png')) {
      // Try SVG file next
      img.src = `/signs/${code}.svg`;
    } else {
      // Show rendered fallback shape
      img.style.display = 'none';
      const fallback = img.parentElement!.querySelector('.sign-fallback') as HTMLElement;
      if (fallback) fallback.style.display = 'flex';
    }
  }

  return (
    <div className="flex flex-col items-center gap-2 mb-4">
      <div className="bg-white rounded-2xl p-3 shadow-lg flex items-center justify-center min-w-[120px] min-h-[120px]">
        <img
          src={`/signs/${code}.png`}
          alt={`Placa ${code}`}
          className="max-h-28 max-w-28 object-contain"
          onError={handleImgError}
        />
        <div className="sign-fallback" style={{ display: 'none' }}>
          <SignShape code={code} type={type} />
        </div>
      </div>
      <div className="text-center">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
        <p className="text-cyan-300 text-xs font-bold mt-0.5">Código: {code}</p>
      </div>
    </div>
  );
}
