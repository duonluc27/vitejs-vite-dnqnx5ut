import { useState } from "react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { ImageIcon, Loader2, Check } from "lucide-react";

export default function AutoImageFetch({ card, onImageUpdate }) {
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState(null);

  const fetch = async () => {
    setLoading(true);
    setOptions(null);

    const data = await base44.integrations.Core.InvokeLLM({
      prompt: `Find the card image URL for this Pokémon card from TCGPlayer or the official Pokémon TCG image CDN.

Card: "${card.name}"
Set: "${card.set_name || ""}"
Type: ${card.type}
${card.type === "graded_card" && card.grade ? `Grade: ${card.grading_company} ${card.grade}` : ""}

Search TCGPlayer.com for this card. TCGPlayer card images follow this CDN pattern:
https://product-images.tcgplayer.com/fit-in/437x437/XXXXXX.jpg  (where XXXXXX is the product ID)

Also check:
- https://images.pokemontcg.io/ (official Pokémon TCG API CDN)
- https://limitlesstcg.com/

Return 2-3 working direct image URLs (.jpg or .png) that show the front face of this specific card. Only return URLs you are confident actually exist and are publicly accessible. Do NOT make up URLs.`,
      add_context_from_internet: true,
      model: "gemini_3_flash",
      response_json_schema: {
        type: "object",
        properties: {
          image_urls: {
            type: "array",
            items: { type: "string" },
            description: "Direct image URLs for the card",
          },
          pokemon_tcg_id: {
            type: "string",
            description: "The Pokémon TCG API card ID if found (e.g. swsh45-18)",
          },
        },
        required: ["image_urls"],
      },
    });

    // If we got a pokemon TCG ID, build the official image URL
    let urls = data?.image_urls?.filter(Boolean) || [];
    if (data?.pokemon_tcg_id) {
      const tcgApiUrl = `https://images.pokemontcg.io/${data.pokemon_tcg_id}/large.png`;
      urls = [tcgApiUrl, ...urls];
    }

    setOptions(urls);
    setLoading(false);
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={fetch}
        disabled={loading}
        className="gap-2 text-xs h-8"
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImageIcon className="w-3 h-3" />}
        {loading ? "Searching TCGPlayer..." : "Find Card Image"}
      </Button>

      {options !== null && options.length === 0 && (
        <p className="text-xs text-muted-foreground">No images found. Try uploading one manually.</p>
      )}

      {options && options.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] text-muted-foreground">Click an image to use it:</p>
          <div className="flex gap-2 flex-wrap">
            {options.map((url, i) => (
              <div key={i} className="relative group cursor-pointer" onClick={() => { onImageUpdate(url); setOptions(null); }}>
                <img
                  src={url}
                  alt={`Option ${i + 1}`}
                  className="w-20 h-28 object-cover rounded-lg border border-border hover:border-primary transition-colors"
                  onError={(e) => { e.target.parentElement.style.display = "none"; }}
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-lg">
                  <Check className="w-5 h-5 text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}