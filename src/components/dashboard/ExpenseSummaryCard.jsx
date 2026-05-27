import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Receipt, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const CATEGORY_LABELS = {
  shipping: 'Shipping',
  platform_fee: 'Platform Fees',
  travel: 'Travel',
  supplies: 'Supplies',
  grading_fee: 'Grading Fees',
  other: 'Other',
};

export default function ExpenseSummaryCard({ grossProfit }) {
  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => base44.entities.Expense.list(),
  });

  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netGain = grossProfit - totalExpenses;
  const isPositive = netGain >= 0;

  // Group by category
  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + (e.amount || 0);
    return acc;
  }, {});

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center">
            <Receipt className="w-4 h-4 text-destructive" />
          </div>
          <div>
            <h2 className="font-heading font-semibold text-base">
              Operating Expenses
            </h2>
            <p className="text-[11px] text-muted-foreground">
              {expenses.length} expense{expenses.length !== 1 ? 's' : ''} logged
            </p>
          </div>
        </div>
        <Link
          to="/expenses"
          className="text-[11px] text-primary hover:underline"
        >
          Manage →
        </Link>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-muted/50 p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Total Expenses
          </p>
          <p className="text-lg font-heading font-bold text-destructive mt-0.5">
            -${totalExpenses.toFixed(2)}
          </p>
        </div>
        <div className="rounded-xl bg-muted/50 p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Net Gain
          </p>
          <p
            className={cn(
              'text-lg font-heading font-bold mt-0.5',
              isPositive ? 'text-emerald-500' : 'text-red-500'
            )}
          >
            {isPositive ? '+' : '-'}${Math.abs(netGain).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Category breakdown */}
      {Object.keys(byCategory).length > 0 && (
        <div className="space-y-1.5">
          {Object.entries(byCategory).map(([cat, amt]) => (
            <div
              key={cat}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-muted-foreground">
                {CATEGORY_LABELS[cat] || cat}
              </span>
              <span className="font-medium">${amt.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      {expenses.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-2">
          No expenses logged yet.{' '}
          <Link to="/expenses" className="text-primary hover:underline">
            Add one →
          </Link>
        </p>
      )}
    </div>
  );
}
