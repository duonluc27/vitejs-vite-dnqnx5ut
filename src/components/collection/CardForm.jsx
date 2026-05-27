import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, Loader2, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import MarketPriceFetcher from '@/components/market/MarketPriceFetcher';
import AutoImageFetch from '@/components/market/AutoImageFetch';

const TYPES = [
  { value: 'raw_card', label: 'Raw Card' },
  { value: 'graded_card', label: 'Graded Card' },
  { value: 'sealed_product', label: 'Sealed Product' },
];

const GRADING_COMPANIES = ['PSA', 'BGS', 'CGC', 'SGC', 'AGS', 'None'];
const STATUSES = [
  { value: 'holding', label: 'Holding' },
  { value: 'listed', label: 'Listed' },
  { value: 'sold', label: 'Sold' },
];

export default function CardForm({ initialData, onSubmit, isSubmitting }) {
  const getInitialForm = () => {
    const defaults = {
      name: '',
      type: 'raw_card',
      set_name: '',
      image_url: '',
      purchase_price: '',
      grading_cost: '',
      grading_company: 'None',
      grade: '',
      current_value: '',
      min_sell_percentage: '',
      status: 'holding',
      sold_price: '',
      notes: '',
      date_purchased: '',
    };
    if (!initialData) return defaults;
    return {
      ...defaults,
      ...initialData,
      purchase_price: initialData.purchase_price?.toString() ?? '',
      grading_cost: initialData.grading_cost?.toString() ?? '',
      current_value: initialData.current_value?.toString() ?? '',
      min_sell_percentage: initialData.min_sell_percentage?.toString() ?? '',
      sold_price: initialData.sold_price?.toString() ?? '',
    };
  };

  const [form, setForm] = useState(getInitialForm);
  const [uploading, setUploading] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    handleChange('image_url', file_url);
    setUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...form,
      purchase_price: parseFloat(form.purchase_price) || 0,
      grading_cost: parseFloat(form.grading_cost) || 0,
      current_value: parseFloat(form.current_value) || 0,
      min_sell_percentage: parseFloat(form.min_sell_percentage) || 0,
      sold_price: parseFloat(form.sold_price) || 0,
    };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image upload */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider">Card Image</Label>
        <div className="flex flex-col sm:flex-row gap-4">
          {form.image_url ? (
            <div className="relative w-40 h-56 rounded-xl overflow-hidden border border-border flex-shrink-0">
              <img
                src={form.image_url}
                alt="Card"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleChange('image_url', '')}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-40 h-56 rounded-xl border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors bg-muted/50 flex-shrink-0">
              {uploading ? (
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground">
                    Upload Image
                  </span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
          {form.name && (
            <div className="flex flex-col justify-end">
              <AutoImageFetch
                card={{
                  name: form.name,
                  set_name: form.set_name,
                  type: form.type,
                  grade: form.grade,
                  grading_company: form.grading_company,
                }}
                onImageUpdate={(url) => handleChange('image_url', url)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Basic info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider">Name *</Label>
          <Input
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g. Charizard VMAX"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider">Set Name</Label>
          <Input
            value={form.set_name}
            onChange={(e) => handleChange('set_name', e.target.value)}
            placeholder="e.g. Shining Fates"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider">Type *</Label>
          <Select
            value={form.type}
            onValueChange={(v) => handleChange('type', v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider">Status</Label>
          <Select
            value={form.status}
            onValueChange={(v) => handleChange('status', v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grading */}
      {form.type === 'graded_card' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-muted/50 border border-border">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider">
              Grading Company
            </Label>
            <Select
              value={form.grading_company}
              onValueChange={(v) => handleChange('grading_company', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GRADING_COMPANIES.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider">Grade</Label>
            <Input
              value={form.grade}
              onChange={(e) => handleChange('grade', e.target.value)}
              placeholder="e.g. 10, 9.5"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider">
              Grading Cost ($)
            </Label>
            <Input
              type="number"
              step="0.01"
              value={form.grading_cost}
              onChange={(e) => handleChange('grading_cost', e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>
      )}

      {/* Financials */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider">
            Purchase Price ($) *
          </Label>
          <Input
            type="number"
            step="0.01"
            value={form.purchase_price}
            onChange={(e) => handleChange('purchase_price', e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider">
            Current Value ($)
          </Label>
          <Input
            type="number"
            step="0.01"
            value={form.current_value}
            onChange={(e) => handleChange('current_value', e.target.value)}
            placeholder="0.00"
          />
          {form.name && (
            <MarketPriceFetcher
              card={{
                name: form.name,
                set_name: form.set_name,
                type: form.type,
                grade: form.grade,
                grading_company: form.grading_company,
              }}
              onPriceUpdate={(price) =>
                handleChange('current_value', price.toString())
              }
            />
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider">Min Sell %</Label>
          <Input
            type="number"
            step="0.1"
            value={form.min_sell_percentage}
            onChange={(e) =>
              handleChange('min_sell_percentage', e.target.value)
            }
            placeholder="e.g. 80"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider">
            Date Purchased
          </Label>
          <Input
            type="date"
            value={form.date_purchased}
            onChange={(e) => handleChange('date_purchased', e.target.value)}
          />
        </div>
      </div>

      {/* Sold info */}
      {form.status === 'sold' && (
        <div className="space-y-1.5 p-4 rounded-xl bg-muted/50 border border-border">
          <Label className="text-xs uppercase tracking-wider">
            Sold Price ($)
          </Label>
          <Input
            type="number"
            step="0.01"
            value={form.sold_price}
            onChange={(e) => handleChange('sold_price', e.target.value)}
            placeholder="0.00"
          />
        </div>
      )}

      {/* Notes */}
      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-wider">Notes</Label>
        <Textarea
          value={form.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Any additional notes..."
          rows={3}
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full sm:w-auto h-11 px-8 font-semibold"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
          </>
        ) : initialData ? (
          'Update Card'
        ) : (
          'Add to Collection'
        )}
      </Button>
    </form>
  );
}
