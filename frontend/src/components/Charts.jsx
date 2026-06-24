import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

// Brand-aligned palette (orange / teal / blue / amber / violet)
export const CHART_COLORS = ['#ee6123', '#16b8a3', '#3b5bdb', '#f4a259', '#7048e8', '#e8336d']

const AXIS_COLOR = '#8a90a6'

function ChartTooltip({ active, payload, label, valueLabel = 'Clicks' }) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="chart-tooltip">
      {label != null && <span className="chart-tooltip-label">{label}</span>}
      <span className="chart-tooltip-value">
        {payload[0].name && payload[0].name !== 'value' ? `${payload[0].name}: ` : ''}
        {payload[0].value} {valueLabel}
      </span>
    </div>
  )
}

// Time-series of clicks per day. `data` = [{ date, clicks }]
export function ClicksOverTime({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#eef0f6" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: AXIS_COLOR }}
          tickLine={false}
          axisLine={{ stroke: '#e6e8ef' }}
          interval="preserveStartEnd"
          minTickGap={28}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: AXIS_COLOR }}
          tickLine={false}
          axisLine={false}
          width={40}
        />
        <Tooltip cursor={{ fill: 'rgba(238,97,35,0.06)' }} content={<ChartTooltip />} />
        <Bar dataKey="clicks" fill="#16b8a3" radius={[5, 5, 0, 0]} maxBarSize={42} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// Horizontal ranked bars. `data` = [{ name, value }]
export function RankedBars({ data }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(data.length * 46, 120)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
        barCategoryGap={10}
      >
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="name"
          width={108}
          tick={{ fontSize: 12, fill: '#15192c' }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip cursor={{ fill: 'rgba(238,97,35,0.06)' }} content={<ChartTooltip />} />
        <Bar dataKey="value" radius={[0, 5, 5, 0]} maxBarSize={22}>
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// Donut chart with legend. `data` = [{ name, value }]
export function DonutChart({ data }) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  return (
    <div className="donut-wrap">
      <div className="donut-chart">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={52}
              outerRadius={78}
              paddingAngle={data.length > 1 ? 2 : 0}
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-center">
          <span className="donut-center-value">{total}</span>
          <span className="donut-center-label">total</span>
        </div>
      </div>
      <ul className="donut-legend">
        {data.map((d, i) => (
          <li key={d.name} className="donut-legend-item">
            <span className="legend-dot" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
            <span className="legend-name">{d.name}</span>
            <span className="legend-value">{Math.round((d.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
