import { cn } from '@/lib/utils';

export default function StatCard({
  label,
  value,
  subValue,
  icon: Icon,
  trend,
  className,
}) {
  const isPositive = trend === 'up';
  const isNegative = trend === 'down';

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:shadow-lg hover:shadow-primary/5',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="text-2xl font-heading font-bold tracking-tight">
            {value}
          </p>
          {subValue && (
            <p
              className={cn(
                'text-xs font-semibold',
                isPositive && 'text-emerald-500',
                isNegative && 'text-red-500',
                !isPositive && !isNegative && 'text-muted-foreground'
              )}
            >
              {subValue}
            </p>
          )}
        </div>
        {Icon && (
          <div className="rounded-xl bg-primary/10 p-2.5">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        )}
      </div>
    </div>
  );
}
