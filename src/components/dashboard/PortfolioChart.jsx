import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = [
  'hsl(45, 93%, 47%)',
  'hsl(262, 83%, 58%)',
  'hsl(160, 60%, 45%)',
  'hsl(200, 70%, 50%)',
  'hsl(340, 75%, 55%)',
];

const TYPE_LABELS = {
  raw_card: 'Raw Cards',
  graded_card: 'Graded Cards',
  sealed_product: 'Sealed Products',
};

export default function PortfolioChart({ cards }) {
  const data = Object.entries(
    cards.reduce((acc, card) => {
      const type = card.type || 'raw_card';
      acc[type] =
        (acc[type] || 0) + (card.current_value || card.purchase_price || 0);
      return acc;
    }, {})
  ).map(([type, value]) => ({
    name: TYPE_LABELS[type] || type,
    value: Math.round(value * 100) / 100,
  }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        No data yet
      </div>
    );
  }

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => `$${value.toFixed(2)}`}
            contentStyle={{
              borderRadius: '12px',
              border: '1px solid hsl(220, 13%, 89%)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              fontSize: '13px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-3 justify-center mt-2">
        {data.map((item, i) => (
          <div key={item.name} className="flex items-center gap-1.5 text-xs">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className="text-muted-foreground">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
