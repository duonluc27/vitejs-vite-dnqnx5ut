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

export default function CardListRow({ card, onDelete }) {
  const totalCost = (card.purchase_price || 0) + (card.grading_cost || 0);
  const currentValue =
    card.status === 'sold' ? card.sold_price || 0 : card.current_value || 0;
  const profit = currentValue - totalCost;
  const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;
  const isPositive = profit > 0;
  const isNegative = profit < 0;

  return (
    <div className="group flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card hover:shadow-md hover:border-primary/20 transition-all duration-200">
      {/* Thumbnail */}
      <div className="w-10 h-14 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
        {card.image_url ? (
          <img
            src={card.image_url}
            alt={card.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold text-lg opacity-20">
            ?
          </div>
        )}
      </div>

      {/* Name + set */}
      <div className="flex-1 min-w-0">
        <p className="font-heading font-semibold text-sm truncate">
          {card.name}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          {card.set_name && (
            <p className="text-[11px] text-muted-foreground truncate">
              {card.set_name}
            </p>
          )}
          {card.type === 'graded_card' && card.grade && (
            <span className="text-[11px] font-semibold text-primary">
              {card.grading_company} {card.grade}
            </span>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="hidden sm:flex items-center gap-1.5">
        <Badge className={cn('text-[10px] border', TYPE_STYLES[card.type])}>
          {TYPE_LABELS[card.type]}
        </Badge>
        <Badge
          className={cn('text-[10px] border-0', STATUS_STYLES[card.status])}
        >
          {card.status}
        </Badge>
      </div>

      {/* Financials */}
      <div className="hidden md:grid grid-cols-3 gap-4 text-right">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Cost
          </p>
          <p className="text-sm font-semibold">${totalCost.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            {card.status === 'sold' ? 'Sold' : 'Value'}
          </p>
          <p className="text-sm font-semibold">${currentValue.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            ROI
          </p>
          <div className="flex items-center justify-end gap-1">
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
              {roi.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Link to={`/edit?id=${card.id}`}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Pencil className="w-3.5 h-3.5" />
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={() => onDelete(card)}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
