import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const TYPE_STYLES = {
  raw_card: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  graded_card: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  sealed_product: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
};

const TYPE_LABELS = {
  raw_card: 'Raw',
  graded_card: 'Graded',
  sealed_product: 'Sealed',
};

const STATUS_STYLES = {
  holding: 'bg-emerald-500/10 text-emerald-600',
  listed: 'bg-primary/10 text-primary',
  sold: 'bg-muted text-muted-foreground',
};

export default function CardItem({ card, onDelete }) {
  const totalCost = (card.purchase_price || 0) + (card.grading_cost || 0);
  const currentValue =
    card.status === 'sold' ? card.sold_price || 0 : card.current_value || 0;
  const profit = currentValue - totalCost;
  const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;
  const minSellPrice =
    card.min_sell_percentage && card.current_value
      ? (card.current_value * card.min_sell_percentage) / 100
      : null;

  const isPositive = profit > 0;
  const isNegative = profit < 0;

  return (
    <div className="group relative rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20">
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="relative w-full sm:w-36 h-48 sm:h-auto bg-muted flex-shrink-0">
          {card.image_url ? (
            <img
              src={card.image_url}
              alt={card.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-3xl font-heading font-bold opacity-20">
              ?
            </div>
          )}
          <Badge
            className={cn(
              'absolute top-2 left-2 text-[10px] border',
              TYPE_STYLES[card.type]
            )}
          >
            {TYPE_LABELS[card.type]}
          </Badge>
        </div>

        {/* Info */}
        <div className="flex-1 p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-heading font-semibold text-base leading-tight">
                {card.name}
              </h3>
              {card.set_name && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {card.set_name}
                </p>
              )}
            </div>
            <Badge
              className={cn('text-[10px] border-0', STATUS_STYLES[card.status])}
            >
              {card.status}
            </Badge>
          </div>

          {/* Grade info */}
          {card.type === 'graded_card' && card.grade && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                {card.grading_company}
              </span>
              <span className="text-sm font-bold text-primary font-heading">
                {card.grade}
              </span>
            </div>
          )}

          {/* Financials */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Cost
              </p>
              <p className="text-sm font-semibold">${totalCost.toFixed(2)}</p>
              {card.grading_cost > 0 && (
                <p className="text-[10px] text-muted-foreground">
                  (${card.purchase_price?.toFixed(2)} + $
                  {card.grading_cost?.toFixed(2)} grading)
                </p>
              )}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {card.status === 'sold' ? 'Sold For' : 'Value'}
              </p>
              <p className="text-sm font-semibold">
                ${currentValue.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Profit
              </p>
              <div className="flex items-center gap-1">
                {isPositive ? (
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                ) : isNegative ? (
                  <TrendingDown className="w-3 h-3 text-red-500" />
                ) : (
                  <Minus className="w-3 h-3 text-muted-foreground" />
                )}
                <p
                  className={cn(
                    'text-sm font-semibold',
                    isPositive && 'text-emerald-500',
                    isNegative && 'text-red-500'
                  )}
                >
                  ${Math.abs(profit).toFixed(2)}
                </p>
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                ROI
              </p>
              <p
                className={cn(
                  'text-sm font-semibold',
                  isPositive && 'text-emerald-500',
                  isNegative && 'text-red-500'
                )}
              >
                {roi.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Min sell */}
          {minSellPrice !== null && (
            <p className="text-[10px] text-muted-foreground">
              Min sell:{' '}
              <span className="font-medium text-foreground">
                ${minSellPrice.toFixed(2)}
              </span>
              <span className="ml-1">
                ({card.min_sell_percentage}% of value)
              </span>
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <Link to={`/edit?id=${card.id}`}>
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5">
                <Pencil className="w-3 h-3" /> Edit
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-1.5 text-destructive hover:text-destructive"
              onClick={() => onDelete(card)}
            >
              <Trash2 className="w-3 h-3" /> Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
