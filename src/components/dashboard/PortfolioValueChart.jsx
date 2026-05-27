import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { format, parseISO, startOfMonth, isValid } from 'date-fns';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card shadow-xl p-3 text-xs space-y-1">
      <p className="font-heading font-semibold">{label}</p>
      <p className="text-primary font-bold">
        ${payload[0]?.value?.toFixed(2)} value
      </p>
      {payload[1] && (
        <p className="text-muted-foreground">
          ${payload[1]?.value?.toFixed(2)} invested
        </p>
      )}
    </div>
  );
};

export default function PortfolioValueChart({ cards }) {
  // Group cards by purchase month to build a cumulative timeline
  const withDates = cards
    .filter((c) => c.date_purchased && isValid(parseISO(c.date_purchased)))
    .sort((a, b) => new Date(a.date_purchased) - new Date(b.date_purchased));

  if (withDates.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        Add purchase dates to see timeline
      </div>
    );
  }

  // Build monthly snapshots
  const monthMap = {};
  withDates.forEach((c) => {
    const key = format(startOfMonth(parseISO(c.date_purchased)), 'yyyy-MM');
    if (!monthMap[key]) monthMap[key] = { cards: [] };
    monthMap[key].cards.push(c);
  });

  // Cumulative running totals
  const sortedKeys = Object.keys(monthMap).sort();
  let cumulativeCost = 0;
  let cumulativeValue = 0;

  const data = sortedKeys.map((key) => {
    monthMap[key].cards.forEach((c) => {
      cumulativeCost += (c.purchase_price || 0) + (c.grading_cost || 0);
      cumulativeValue +=
        c.status === 'sold' ? c.sold_price || 0 : c.current_value || 0;
    });
    return {
      month: format(parseISO(key + '-01'), 'MMM yy'),
      value: parseFloat(cumulativeValue.toFixed(2)),
      cost: parseFloat(cumulativeCost.toFixed(2)),
    };
  });

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart
        data={data}
        margin={{ top: 4, right: 4, bottom: 0, left: -10 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(var(--border))"
          vertical={false}
        />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${v}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="value"
          stroke="hsl(var(--primary))"
          strokeWidth={2.5}
          dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 0 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="cost"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
