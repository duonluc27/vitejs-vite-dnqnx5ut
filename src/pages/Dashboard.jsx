import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  DollarSign,
  Layers,
  TrendingUp,
  Award,
  Package,
  CreditCard,
} from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import PortfolioChart from '@/components/dashboard/PortfolioChart';
import ProfitByTypeChart from '@/components/dashboard/ProfitByTypeChart';
import PortfolioValueChart from '@/components/dashboard/PortfolioValueChart';
import ExpenseSummaryCard from '@/components/dashboard/ExpenseSummaryCard';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { data: cards = [], isLoading } = useQuery({
    queryKey: ['cards'],
    queryFn: () => base44.entities.Card.list('-created_date'),
  });

  const totalCost = cards.reduce(
    (sum, c) => sum + (c.purchase_price || 0) + (c.grading_cost || 0),
    0
  );
  const totalValue = cards.reduce((sum, c) => {
    if (c.status === 'sold') return sum + (c.sold_price || 0);
    return sum + (c.current_value || 0);
  }, 0);
  const totalProfit = totalValue - totalCost;
  const totalROI = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
  const gradingCosts = cards.reduce((sum, c) => sum + (c.grading_cost || 0), 0);
  const gradedCount = cards.filter((c) => c.type === 'graded_card').length;
  const sealedCount = cards.filter((c) => c.type === 'sealed_product').length;

  // Top performers
  const topCards = [...cards]
    .map((c) => ({
      ...c,
      profit:
        (c.status === 'sold' ? c.sold_price || 0 : c.current_value || 0) -
        (c.purchase_price || 0) -
        (c.grading_cost || 0),
    }))
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            Portfolio
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {cards.length} item{cards.length !== 1 && 's'} in your collection
          </p>
        </div>
        <Link to="/add">
          <Button className="gap-2 font-semibold shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" /> Add Card
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Invested"
          value={`$${totalCost.toFixed(2)}`}
          icon={DollarSign}
        />
        <StatCard
          label="Portfolio Value"
          value={`$${totalValue.toFixed(2)}`}
          icon={Layers}
        />
        <StatCard
          label="Total Profit"
          value={`$${Math.abs(totalProfit).toFixed(2)}`}
          subValue={`${totalROI >= 0 ? '+' : ''}${totalROI.toFixed(1)}% ROI`}
          trend={totalProfit >= 0 ? 'up' : 'down'}
          icon={TrendingUp}
        />
        <StatCard
          label="Grading Costs"
          value={`$${gradingCosts.toFixed(2)}`}
          subValue={`${gradedCount} graded`}
          icon={Award}
        />
      </div>

      {/* New Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-heading font-semibold text-lg mb-1">
            Profit by Card Type
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            Net profit/loss grouped by asset type
          </p>
          <ProfitByTypeChart cards={cards} />
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-heading font-semibold text-lg mb-1">
            Portfolio Value Over Time
          </h2>
          <div className="flex items-center gap-4 mb-4">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="inline-block w-6 h-0.5 bg-primary rounded" />{' '}
              Value
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="inline-block w-6 h-0.5 bg-muted-foreground rounded opacity-60 border-dashed border-t-2 border-muted-foreground" />{' '}
              Invested
            </span>
          </div>
          <PortfolioValueChart cards={cards} />
        </div>
      </div>

      {/* Expense Summary */}
      <ExpenseSummaryCard grossProfit={totalProfit} />

      {/* Charts & Top Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Breakdown */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-heading font-semibold text-lg mb-4">
            Portfolio Breakdown
          </h2>
          <PortfolioChart cards={cards} />
          <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t border-border">
            <div className="text-center">
              <p className="text-lg font-heading font-bold">
                {cards.filter((c) => c.type === 'raw_card').length}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Raw
              </p>
            </div>
            <div className="text-center">
              <p className="text-lg font-heading font-bold">{gradedCount}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Graded
              </p>
            </div>
            <div className="text-center">
              <p className="text-lg font-heading font-bold">{sealedCount}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Sealed
              </p>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-heading font-semibold text-lg mb-4">
            Top Performers
          </h2>
          {topCards.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <Package className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-sm">Add cards to see top performers</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topCards.map((card, i) => (
                <div
                  key={card.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <span className="text-xs font-bold text-muted-foreground w-5">
                    #{i + 1}
                  </span>
                  <div className="w-9 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    {card.image_url ? (
                      <img
                        src={card.image_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                        ?
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{card.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {card.set_name || card.type.replace('_', ' ')}
                    </p>
                  </div>
                  <p
                    className={`text-sm font-bold ${
                      card.profit >= 0 ? 'text-emerald-500' : 'text-red-500'
                    }`}
                  >
                    {card.profit >= 0 ? '+' : '-'}$
                    {Math.abs(card.profit).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
