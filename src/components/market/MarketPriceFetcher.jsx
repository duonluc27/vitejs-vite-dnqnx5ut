import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import {
  RefreshCw,
  TrendingUp,
  CheckCircle,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MarketPriceFetcher({ card, onPriceUpdate }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const buildQuery = () => {
    const parts = [card.name];
    if (card.set_name) parts.push(card.set_name);
    if (card.type === 'graded_card' && card.grade) {
      parts.push(`${card.grading_company || 'PSA'} ${card.grade}`);
    }
    return parts.join(' ');
  };

  const fetchPrice = async () => {
    setLoading(true);
    setResult(null);
    const query = buildQuery();

    const data = await base44.integrations.Core.InvokeLLM({
      prompt: `Go to TCGPlayer.com and look up the MARKET PRICE for this Pokémon card: "${query}".

The TCGPlayer market price is the most accurate current price — it is NOT the listed price, it is the "Market Price" stat shown on the product page.

Search TCGPlayer.com for: site:tcgplayer.com "${card.name}" ${
        card.set_name || ''
      } pokemon

Steps:
1. Find the exact card on TCGPlayer.com
2. Get the "Market Price" (not "Listed Median", not "Low") — this is shown as "Market Price: $X.XX" on the page
3. Also note the Low and High sold prices if available

Card details:
- Name: ${card.name}
- Set: ${card.set_name || 'Unknown'}
- Type: ${card.type}
${
  card.type === 'graded_card'
    ? `- Grade: ${card.grading_company} ${card.grade}`
    : ''
}
${
  card.type === 'sealed_product'
    ? '- This is a sealed booster box or sealed product'
    : ''
}

Return ONLY the TCGPlayer market price data. If TCGPlayer doesn't have it, try ebay.com recent sales or pricecharting.com as fallback.`,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          market_price: {
            type: 'number',
            description: 'TCGPlayer Market Price in USD',
          },
          low_price: { type: 'number', description: 'TCGPlayer Low price' },
          high_price: { type: 'number', description: 'TCGPlayer High price' },
          source: {
            type: 'string',
            description: 'Source website used (e.g. TCGPlayer, PriceCharting)',
          },
          card_url: {
            type: 'string',
            description: 'Direct URL to the card on TCGPlayer',
          },
          price_trend: {
            type: 'string',
            enum: ['rising', 'falling', 'stable'],
          },
        },
        required: ['market_price', 'source'],
      },
    });

    setResult(data);
    setLoading(false);
  };

  const trendIcon = {
    rising: TrendingUp,
    falling: TrendingDown,
    stable: Minus,
  };
  const trendColors = {
    rising: 'text-emerald-500',
    falling: 'text-red-500',
    stable: 'text-muted-foreground',
  };
  const TrendIcon = result?.price_trend ? trendIcon[result.price_trend] : null;

  return (
    <div className="space-y-2 mt-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={fetchPrice}
        disabled={loading}
        className="gap-2 text-xs h-8"
      >
        {loading ? (
          <RefreshCw className="w-3 h-3 animate-spin" />
        ) : (
          <TrendingUp className="w-3 h-3" />
        )}
        {loading ? 'Fetching TCGPlayer price...' : 'Get TCGPlayer Price'}
      </Button>

      {result && (
        <div className="rounded-xl border border-border bg-muted/40 p-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {result.source || 'TCGPlayer'} Market Price
              </p>
              <p className="text-xl font-heading font-bold">
                ${result.market_price?.toFixed(2)}
              </p>
              {result.low_price && result.high_price && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Range: ${result.low_price?.toFixed(2)} – $
                  {result.high_price?.toFixed(2)}
                </p>
              )}
            </div>
            {TrendIcon && (
              <TrendIcon
                className={cn('w-4 h-4 mt-1', trendColors[result.price_trend])}
              />
            )}
          </div>
          {result.card_url && (
            <a
              href={result.card_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-primary underline underline-offset-2 block truncate"
            >
              View on {result.source || 'TCGPlayer'} →
            </a>
          )}
          <Button
            type="button"
            size="sm"
            className="w-full h-8 text-xs gap-1.5"
            onClick={() => {
              onPriceUpdate(result.market_price);
              setResult(null);
            }}
          >
            <CheckCircle className="w-3 h-3" />
            Apply ${result.market_price?.toFixed(2)} as current value
          </Button>
        </div>
      )}
    </div>
  );
}
