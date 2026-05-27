import { useState } from "react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { RefreshCw, CheckCircle, XCircle, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export default function BulkPriceRefresh({ cards, onComplete }) {
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);
  const [done, setDone] = useState(false);

  const holdingCards = cards.filter((c) => c.status !== "sold");

  const run = async () => {
    setRunning(true);
    setDone(false);
    setResults([]);
    setProgress(0);

    const updates = [];

    for (let i = 0; i < holdingCards.length; i++) {
      const card = holdingCards[i];

      const data = await base44.integrations.Core.InvokeLLM({
        prompt: `Look up the TCGPlayer MARKET PRICE for this Pokémon card: "${card.name}" from set "${card.set_name || "unknown"}".
${card.type === "graded_card" ? `This is a graded card: ${card.grading_company} ${card.grade}` : ""}
${card.type === "sealed_product" ? "This is a sealed product (booster box or similar)." : ""}

Go to TCGPlayer.com and find the Market Price (not listed price, not low — the "Market Price" value).
Return the market price in USD as a number.`,
        add_context_from_internet: true,
        model: "gemini_3_flash",
        response_json_schema: {
          type: "object",
          properties: {
            market_price: { type: "number", description: "TCGPlayer Market Price in USD" },
            price_trend: { type: "string", enum: ["rising", "falling", "stable"] },
          },
          required: ["market_price"],
        },
      });

      const newValue = data?.market_price;
      const oldValue = card.current_value || 0;
      const change = newValue ? newValue - oldValue : null;

      if (newValue) {
        await base44.entities.Card.update(card.id, { current_value: newValue });
      }

      updates.push({
        id: card.id,
        name: card.name,
        oldValue,
        newValue,
        change,
        trend: data?.price_trend,
        success: !!newValue,
      });

      setResults([...updates]);
      setProgress(Math.round(((i + 1) / holdingCards.length) * 100));
    }

    setRunning(false);
    setDone(true);
    if (onComplete) onComplete();
  };

  const trendColor = (t) => t === "rising" ? "text-emerald-500" : t === "falling" ? "text-red-500" : "text-muted-foreground";

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <div className="text-left">
            <p className="font-heading font-semibold text-sm">Bulk TCGPlayer Price Refresh</p>
            <p className="text-[11px] text-muted-foreground">
              Fetch live TCGPlayer market prices for all {holdingCards.length} held items
            </p>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
          {!running && !done && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Fetches the live TCGPlayer Market Price for each of your {holdingCards.length} held item(s).
                Uses AI with web search — each card is looked up individually on TCGPlayer.com.
              </p>
              <p className="text-xs font-medium text-amber-600 bg-amber-50 rounded-lg p-2.5">
                ⚡ Uses {holdingCards.length} AI + web search credit{holdingCards.length !== 1 ? "s" : ""}.
              </p>
              <Button onClick={run} className="gap-2 w-full sm:w-auto" disabled={holdingCards.length === 0}>
                <RefreshCw className="w-4 h-4" /> Refresh All Prices from TCGPlayer
              </Button>
            </div>
          )}

          {running && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Looking up {results.length + 1} of {holdingCards.length} on TCGPlayer...
                </span>
                <span className="font-semibold">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {results.map((r) => (
                <div key={r.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/50 text-xs">
                  {r.success ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                  )}
                  <span className="flex-1 truncate font-medium">{r.name}</span>
                  {r.success && (
                    <>
                      <span className="text-muted-foreground">${r.oldValue?.toFixed(0)} → ${r.newValue?.toFixed(0)}</span>
                      <span className={cn("font-semibold", r.change >= 0 ? "text-emerald-500" : "text-red-500")}>
                        {r.change >= 0 ? "+" : ""}${r.change?.toFixed(2)}
                      </span>
                      <span className={cn("text-[10px]", trendColor(r.trend))}>
                        {r.trend === "rising" ? "↑" : r.trend === "falling" ? "↓" : "→"}
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {done && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                <CheckCircle className="w-4 h-4" />
                All prices updated from TCGPlayer!
              </div>
              <Button variant="outline" size="sm" onClick={() => { setDone(false); setResults([]); setProgress(0); }} className="text-xs">
                Reset
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}