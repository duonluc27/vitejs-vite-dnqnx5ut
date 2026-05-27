import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const TYPE_LABELS = {
  raw_card: 'Raw Cards',
  graded_card: 'Graded',
  sealed_product: 'Sealed',
};

const TYPE_COLORS = {
  raw_card: 'hsl(200, 70%, 50%)',
  graded_card: 'hsl(45, 93%, 47%)',
  sealed_product: 'hsl(262, 83%, 58%)',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, profit, count } = payload[0].payload;
  const isPos = profit >= 0;
  return (
    <div className="rounded-xl border border-border bg-card shadow-xl p-3 text-xs space-y-1">
      <p className="font-heading font-semibold">{name}</p>
      <p className="text-muted-foreground">
        {count} item{count !== 1 ? 's' : ''}
      </p>
      <p
        className={
          isPos ? 'text-emerald-500 font-bold' : 'text-red-500 font-bold'
        }
      >
        {isPos ? '+' : '-'}${Math.abs(profit).toFixed(2)} profit
      </p>
    </div>
  );
};

export default function ProfitByTypeChart({ cards }) {
  const data = Object.entries(TYPE_LABELS).map(([type, label]) => {
    const subset = cards.filter((c) => c.type === type);
    const profit = subset.reduce((sum, c) => {
      const value =
        c.status === 'sold' ? c.sold_price || 0 : c.current_value || 0;
      const cost = (c.purchase_price || 0) + (c.grading_cost || 0);
      return sum + (value - cost);
    }, 0);
    return {
      name: label,
      profit: parseFloat(profit.toFixed(2)),
      count: subset.length,
      type,
    };
  });

  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        No data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={data}
        barSize={40}
        margin={{ top: 4, right: 4, bottom: 0, left: -10 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(var(--border))"
          vertical={false}
        />
        <XAxis
          dataKey="name"
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
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: 'hsl(var(--muted))', radius: 8 }}
        />
        <Bar dataKey="profit" radius={[6, 6, 0, 0]}>
          {data.map((entry) => (
            <Cell
              key={entry.type}
              fill={
                entry.profit >= 0
                  ? TYPE_COLORS[entry.type]
                  : 'hsl(var(--destructive))'
              }
              opacity={0.85}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
