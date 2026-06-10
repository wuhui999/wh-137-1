import { useEffect, useRef } from 'react';
import { getDeviationColor } from '@/utils/music';

interface DeviationGaugeProps {
  cents: number;
  size?: number;
}

export default function DeviationGauge({ cents, size = 280 }: DeviationGaugeProps) {
  const clampedCents = Math.max(-50, Math.min(50, cents));
  const angle = (clampedCents / 50) * 90;
  const color = getDeviationColor(cents);
  const svgRef = useRef<SVGSVGElement>(null);

  const ticks = [];
  for (let i = -50; i <= 50; i += 5) {
    const tickAngle = (i / 50) * 90;
    const rad = ((tickAngle - 90) * Math.PI) / 180;
    const isMajor = i % 25 === 0;
    const r1 = size / 2 - (isMajor ? 15 : 20);
    const r2 = size / 2 - 5;
    const cx = size / 2;
    const cy = size / 2;
    ticks.push(
      <line
        key={i}
        x1={cx + r1 * Math.cos(rad)}
        y1={cy + r1 * Math.sin(rad)}
        x2={cx + r2 * Math.cos(rad)}
        y2={cy + r2 * Math.sin(rad)}
        className={Math.abs(i) <= Math.abs(clampedCents) ? 'gauge-tick-active' : 'gauge-tick'}
      />
    );
  }

  const labels = [];
  for (let i = -50; i <= 50; i += 25) {
    const tickAngle = (i / 50) * 90;
    const rad = ((tickAngle - 90) * Math.PI) / 180;
    const r = size / 2 - 35;
    const cx = size / 2;
    const cy = size / 2;
    labels.push(
      <text
        key={i}
        x={cx + r * Math.cos(rad)}
        y={cy + r * Math.sin(rad) + 5}
        textAnchor="middle"
        className="fill-navy-300 text-xs font-medium"
      >
        {i > 0 ? `+${i}` : i}
      </text>
    );
  }

  const cx = size / 2;
  const cy = size / 2;
  const pointerLen = size / 2 - 30;
  const pointerRad = ((angle - 90) * Math.PI) / 180;
  const px = cx + pointerLen * Math.cos(pointerRad);
  const py = cy + pointerLen * Math.sin(pointerRad);

  return (
    <div className="relative flex items-center justify-center">
      <svg ref={svgRef} width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="25%" stopColor="#fb923c" />
            <stop offset="40%" stopColor="#d4a857" />
            <stop offset="50%" stopColor="#4ade80" />
            <stop offset="60%" stopColor="#d4a857" />
            <stop offset="75%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>

        <path
          d={`M ${cx - size / 2 + 10} ${cy} A ${size / 2 - 10} ${size / 2 - 10} 0 0 1 ${cx + size / 2 - 10} ${cy}`}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="12"
          strokeLinecap="round"
          opacity="0.4"
        />

        {ticks}
        {labels}

        <line
          x1={cx}
          y1={cy}
          x2={px}
          y2={py}
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          style={{ transition: 'all 0.3s ease-out' }}
        />
        <circle cx={cx} cy={cy} r="8" fill={color} />
        <circle cx={cx} cy={cy} r="4" fill="#0e1a2c" />

        <text
          x={cx}
          y={cy + 5}
          textAnchor="middle"
          className="fill-navy-300 text-xs"
        >
          音分 (cents)
        </text>
      </svg>

      <div
        className="absolute bottom-2 text-center"
        style={{ color }}
      >
        <div className="text-3xl font-display font-bold">
          {cents > 0 ? `+${Math.round(cents)}` : Math.round(cents)}
        </div>
      </div>
    </div>
  );
}
