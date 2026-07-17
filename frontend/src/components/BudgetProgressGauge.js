export function BudgetProgressGauge(used, maxBudget) {
  const rawPct = maxBudget != null && maxBudget > 0
    ? (used / maxBudget) * 100
    : 0;
  const displayPct = Math.min(Math.round(rawPct), 100);
  const overBudget = rawPct > 100;

  const color = overBudget ? '#EF4444'
    : '#C9A84C';

  const r = 52;
  const cx = 65;
  const cy = 65;
  const L = Math.PI * r;
  const offset = L - (displayPct / 100) * L;

  return `
    <svg width="208" height="130" viewBox="0 0 130 91" class="overflow-visible">
      <path d="M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}" fill="none" stroke="#E8E5DF" stroke-width="5" stroke-linecap="round"/>
      <path d="M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round"
        stroke-dasharray="${L}" stroke-dashoffset="${offset}">
        <animate attributeName="stroke-dashoffset" from="${L}" to="${offset}" dur="0.7s" fill="freeze"/>
      </path>
      <text x="${cx}" y="58" text-anchor="middle" font-size="22" font-weight="bold" fill="${color}">
        ${overBudget ? '>100' : displayPct}%
      </text>
      <text x="${cx}" y="70" text-anchor="middle" font-size="9" fill="#9CA3AF">Budget Used</text>
    </svg>
  `;
}
