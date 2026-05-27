import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import BulkPriceRefresh from '@/components/market/BulkPriceRefresh';
import BulkImport from '@/components/market/BulkImport';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Minus, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MarketTools() {
  const queryClient = useQueryClient();

  const { data: cards = [], isLoading } = useQuery({
    queryKey: ['cards'],
    queryFn: () => base44.entities.Card.list('-created_date'),
  });

  const handleRefreshComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['cards'] });
  };

  // Portfolio value trend summary
  const holdingCards = cards.filter((c) => c.status !== 'sold');
  const totalInvested = holdingCards.reduce(
    (s, c) => s + (c.purchase_price || 0) + (c.grading_cost || 0),
    0
  );
  const totalValue = holdingCards.reduce(
    (s, c) => s + (c.current_value || 0),
    0
  );
  const totalProfit = totalValue - totalInvested;
  const roi = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Market Tools
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          AI-powered price lookups, bulk refresh, and CSV import
        </p>
      </div>

      {/* Portfolio snapshot */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="w-4 h-4 text-primary" />
          <h2 className="font-heading font-semibold text-sm">
            Portfolio Snapshot (Held Items)
          </h2>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Items Held', value: holdingCards.length },
              {
                label: 'Total Invested',
                value: `$${totalInvested.toFixed(2)}`,
              },
              { label: 'Current Value', value: `$${totalValue.toFixed(2)}` },
              {
                label: 'Unrealised P&L',
                value: `${totalProfit >= 0 ? '+' : ''}$${Math.abs(
                  totalProfit
                ).toFixed(2)}`,
                sub: `${roi >= 0 ? '+' : ''}${roi.toFixed(1)}% ROI`,
                positive: totalProfit >= 0,
                negative: totalProfit < 0,
              },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-muted/50 p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {item.label}
                </p>
                <p
                  className={cn(
                    'text-lg font-heading font-bold',
                    item.positive && 'text-emerald-500',
                    item.negative && 'text-red-500'
                  )}
                >
                  {item.value}
                </p>
                {item.sub && (
                  <p
                    className={cn(
                      'text-xs font-semibold',
                      item.positive ? 'text-emerald-500' : 'text-red-500'
                    )}
                  >
                    {item.sub}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tools */}
      <div className="space-y-4">
        <h2 className="font-heading font-semibold">Tools</h2>
        <BulkPriceRefresh cards={cards} onComplete={handleRefreshComplete} />
        <BulkImport onComplete={handleRefreshComplete} />
      </div>

      {/* Cards value table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-heading font-semibold text-sm">
            All Held Items — Value Overview
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left p-3 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  Card
                </th>
                <th className="text-right p-3 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  Cost
                </th>
                <th className="text-right p-3 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  Value
                </th>
                <th className="text-right p-3 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  P&L
                </th>
                <th className="text-right p-3 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  ROI
                </th>
                <th className="text-right p-3 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  Min Sell
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      <td colSpan={6} className="p-3">
                        <Skeleton className="h-5 w-full rounded" />
                      </td>
                    </tr>
                  ))
              ) : holdingCards.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center text-muted-foreground text-xs"
                  >
                    No held items. Add cards to your collection to see them
                    here.
                  </td>
                </tr>
              ) : (
                holdingCards.map((card) => {
                  const cost =
                    (card.purchase_price || 0) + (card.grading_cost || 0);
                  const value = card.current_value || 0;
                  const pnl = value - cost;
                  const cardROI = cost > 0 ? (pnl / cost) * 100 : 0;
                  const minSell =
                    card.min_sell_percentage && value
                      ? (value * card.min_sell_percentage) / 100
                      : null;

                  return (
                    <tr
                      key={card.id}
                      className="border-b border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {card.image_url && (
                            <img
                              src={card.image_url}
                              className="w-7 h-9 object-cover rounded"
                              alt=""
                            />
                          )}
                          <div>
                            <p className="font-medium text-xs">{card.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {card.set_name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-right text-xs">
                        ${cost.toFixed(2)}
                      </td>
                      <td className="p-3 text-right text-xs font-semibold">
                        ${value.toFixed(2)}
                      </td>
                      <td
                        className={cn(
                          'p-3 text-right text-xs font-semibold',
                          pnl >= 0 ? 'text-emerald-500' : 'text-red-500'
                        )}
                      >
                        {pnl >= 0 ? '+' : ''}${Math.abs(pnl).toFixed(2)}
                      </td>
                      <td
                        className={cn(
                          'p-3 text-right text-xs font-semibold',
                          cardROI >= 0 ? 'text-emerald-500' : 'text-red-500'
                        )}
                      >
                        {cardROI >= 0 ? '+' : ''}
                        {cardROI.toFixed(1)}%
                      </td>
                      <td className="p-3 text-right text-xs text-muted-foreground">
                        {minSell ? `$${minSell.toFixed(2)}` : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
