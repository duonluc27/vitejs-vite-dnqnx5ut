import { useState } from "react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { Upload, FileSpreadsheet, CheckCircle, XCircle, ChevronDown, ChevronUp, Download } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useQueryClient } from "@tanstack/react-query";

const TEMPLATE_CSV = `name,type,set_name,purchase_price,grading_cost,grading_company,grade,current_value,min_sell_percentage,status,date_purchased,notes
Charizard VMAX,graded_card,Shining Fates,120,30,PSA,10,350,85,holding,2024-06-15,Pulled from booster box
Pikachu V,raw_card,Vivid Voltage,15,,,,25,80,holding,2024-09-01,
Evolving Skies Booster Box,sealed_product,Evolving Skies,145,,,, 280,90,holding,2024-03-10,`;

export default function BulkImport({ onComplete }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [progress, setProgress] = useState(0);
  const [importResults, setImportResults] = useState(null);

  const queryClient = useQueryClient();

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pokemon_cards_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setParsing(true);
    setPreview(null);
    setImportResults(null);

    const { file_url } = await base44.integrations.Core.UploadFile({ file: f });

    const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url,
      json_schema: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                type: { type: "string", enum: ["raw_card", "graded_card", "sealed_product"] },
                set_name: { type: "string" },
                purchase_price: { type: "number" },
                grading_cost: { type: "number" },
                grading_company: { type: "string" },
                grade: { type: "string" },
                current_value: { type: "number" },
                min_sell_percentage: { type: "number" },
                status: { type: "string", enum: ["holding", "listed", "sold"] },
                date_purchased: { type: "string" },
                notes: { type: "string" },
              },
              required: ["name", "purchase_price"],
            },
          },
        },
      },
    });

    if (result.status === "success") {
      const items = result.output?.items || (Array.isArray(result.output) ? result.output : []);
      setPreview(items);
    }
    setParsing(false);
  };

  const doImport = async () => {
    if (!preview?.length) return;
    setImporting(true);
    setProgress(0);
    let success = 0;
    let failed = 0;

    for (let i = 0; i < preview.length; i++) {
      const card = {
        ...preview[i],
        grading_company: preview[i].grading_company || "None",
        status: preview[i].status || "holding",
        purchase_price: Number(preview[i].purchase_price) || 0,
        grading_cost: Number(preview[i].grading_cost) || 0,
        current_value: Number(preview[i].current_value) || 0,
        min_sell_percentage: Number(preview[i].min_sell_percentage) || 0,
      };
      await base44.entities.Card.create(card);
      success++;
      setProgress(Math.round(((i + 1) / preview.length) * 100));
    }

    queryClient.invalidateQueries({ queryKey: ["cards"] });
    setImportResults({ success, failed });
    setImporting(false);
    setPreview(null);
    setFile(null);
    if (onComplete) onComplete();
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setImportResults(null);
    setProgress(0);
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-accent/10 p-2">
            <FileSpreadsheet className="w-4 h-4 text-accent" />
          </div>
          <div className="text-left">
            <p className="font-heading font-semibold text-sm">Bulk Import from CSV</p>
            <p className="text-[11px] text-muted-foreground">Upload a spreadsheet to import multiple cards at once</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
          {!file && !importResults && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Upload a CSV or Excel file with your card collection. Download the template to see the required format.
              </p>
              <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={downloadTemplate}>
                <Download className="w-3.5 h-3.5" /> Download CSV Template
              </Button>
              <label className="flex flex-col items-center justify-center w-full h-28 rounded-xl border-2 border-dashed border-border hover:border-primary/40 cursor-pointer transition-colors bg-muted/30">
                <Upload className="w-5 h-5 text-muted-foreground mb-1.5" />
                <span className="text-xs font-medium">Click to upload CSV or Excel</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">.csv, .xlsx, .xls</span>
                <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFile} className="hidden" />
              </label>
            </div>
          )}

          {parsing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Parsing file...
            </div>
          )}

          {preview && !importing && (
            <div className="space-y-3">
              <p className="text-xs font-medium">{preview.length} cards found in file:</p>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {preview.map((card, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-xs">
                    <span className="text-muted-foreground w-5">#{i + 1}</span>
                    <span className="flex-1 font-medium truncate">{card.name}</span>
                    <span className="text-muted-foreground">{card.set_name}</span>
                    <span className="font-semibold">${Number(card.purchase_price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={doImport} className="gap-1.5 text-xs">
                  <CheckCircle className="w-3.5 h-3.5" /> Import {preview.length} Cards
                </Button>
                <Button variant="outline" size="sm" onClick={reset} className="text-xs">Cancel</Button>
              </div>
            </div>
          )}

          {importing && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Importing... {progress}%</p>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {importResults && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                <CheckCircle className="w-4 h-4" />
                Successfully imported {importResults.success} cards!
              </div>
              <Button variant="outline" size="sm" onClick={reset} className="text-xs">Import More</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}