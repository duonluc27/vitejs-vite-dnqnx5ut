import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

export default function RefreshPricesButton({ cards }) {
  const queryClient = useQueryClient();
  const [state, setState] = useState('idle'); // idle | running | done
  const [progress, setProgress] = useState({ done: 0, total: 0, failed: 0 });

  const refreshable = cards.filter((c) => c.status !== 'sold');

  const run = async () => {
    setState('running');
    setProgress({ done: 0, total: refreshable.length, failed: 0 });
    let failed = 0;

    for (let i = 0; i < refreshable.length; i++) {
      const card = refreshable[i];
      const query = [
        card.name,
        card.set_name,
        card.type === 'graded_card'
          ? `${card.grading_company} ${card.grade}`
          : '',
      ]
        .filter(Boolean)
        .join(' ');

      const data = await base44.integrations.Core.InvokeLLM({
        prompt: `Find the current TCGPlayer market price for this Pokémon card: "${query}". Return only the market price as a number in USD. If not found, return null.`,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: 'object',
          properties: {
            market_price: { type: 'number' },
          },
          required: [],
        },
      });

      if (data?.market_price && data.market_price > 0) {
        await base44.entities.Card.update(card.id, {
          current_value: data.market_price,
        });
      } else {
        failed++;
      }

      setProgress({ done: i + 1, total: refreshable.length, failed });
    }

    queryClient.invalidateQueries({ queryKey: ['cards'] });
    setState('done');
    setTimeout(() => setState('idle'), 4000);
  };

  const pct =
    progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div className="flex items-center gap-3">
      {state === 'running' && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span>
            {progress.done}/{progress.total}
          </span>
        </div>
      )}
      {state === 'done' && (
        <span className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
          <CheckCircle className="w-3.5 h-3.5" />
          Updated {progress.done - progress.failed} cards
          {progress.failed > 0 && (
            <span className="text-muted-foreground ml-1">
              ({progress.failed} skipped)
            </span>
          )}
        </span>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={run}
        disabled={state === 'running' || refreshable.length === 0}
        className="gap-2 text-xs"
      >
        <RefreshCw
          className={cn('w-3.5 h-3.5', state === 'running' && 'animate-spin')}
        />
        {state === 'running' ? 'Refreshing...' : 'Refresh Prices'}
      </Button>
    </div>
  );
}
