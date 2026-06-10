interface LineChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  yMin?: number;
  yMax?: number;
  showArea?: boolean;
}

export default function LineChart({
  data,
  height = 200,
  color = '#d4a857',
  yMin,
  yMax,
  showArea = true,
}: LineChartProps) {
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-navy-400 text-sm glass-card"
        style={{ height }}
      >
        暂无数据
      </div>
    );
  }

  const padding = { top: 20, right: 20, bottom: 30, left: 50 };
  const width = 600;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const values = data.map((d) => d.value);
  const actualMin = yMin !== undefined ? yMin : Math.min(...values);
  const actualMax = yMax !== undefined ? yMax : Math.max(...values);
  const range = actualMax - actualMin || 1;

  const getX = (i: number) =>
    padding.left + (data.length === 1 ? chartWidth / 2 : (i / (data.length - 1)) * chartWidth);
  const getY = (v: number) =>
    padding.top + chartHeight - ((v - actualMin) / range) * chartHeight;

  const pathData = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.value)}`).join(' ');
  const areaData = `${pathData} L ${getX(data.length - 1)} ${padding.top + chartHeight} L ${getX(0)} ${padding.top + chartHeight} Z`;

  const yTicks = 5;
  const tickValues = Array.from({ length: yTicks + 1 }, (_, i) => actualMin + (range * i) / yTicks);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {tickValues.map((tv, i) => (
        <g key={i}>
          <line
            x1={padding.left}
            y1={getY(tv)}
            x2={width - padding.right}
            y2={getY(tv)}
            stroke="rgba(255,255,255,0.05)"
            strokeDasharray="4 4"
          />
          <text
            x={padding.left - 8}
            y={getY(tv) + 4}
            textAnchor="end"
            className="fill-navy-400"
            fontSize="11"
          >
            {Math.round(tv)}
          </text>
        </g>
      ))}

      {showArea && <path d={areaData} fill="url(#areaGradient)" />}

      <path d={pathData} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

      {data.map((d, i) => (
        <g key={i}>
          <circle cx={getX(i)} cy={getY(d.value)} r="5" fill="#0e1a2c" stroke={color} strokeWidth="2" />
          <text
            x={getX(i)}
            y={height - padding.bottom + 18}
            textAnchor="middle"
            className="fill-navy-400"
            fontSize="10"
          >
            {d.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
