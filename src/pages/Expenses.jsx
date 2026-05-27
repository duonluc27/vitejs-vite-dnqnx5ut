import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Receipt } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const CATEGORIES = [
  { value: 'shipping', label: 'Shipping' },
  { value: 'platform_fee', label: 'Platform Fee' },
  { value: 'travel', label: 'Travel' },
  { value: 'supplies', label: 'Supplies' },
  { value: 'grading_fee', label: 'Grading Fee' },
  { value: 'other', label: 'Other' },
];

const CAT_STYLES = {
  shipping: 'bg-blue-500/10 text-blue-600',
  platform_fee: 'bg-amber-500/10 text-amber-600',
  travel: 'bg-violet-500/10 text-violet-600',
  supplies: 'bg-emerald-500/10 text-emerald-600',
  grading_fee: 'bg-primary/10 text-primary',
  other: 'bg-muted text-muted-foreground',
};

const empty = {
  description: '',
  category: 'other',
  amount: '',
  date: '',
  notes: '',
};

export default function Expenses() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => base44.entities.Expense.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) =>
      base44.entities.Expense.create({
        ...data,
        amount: parseFloat(data.amount),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setForm(empty);
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Expense.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setDeleteTarget(null);
    },
  });

  const total = expenses.reduce((s, e) => s + (e.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            Expenses
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {expenses.length} expense{expenses.length !== 1 ? 's' : ''} · Total:{' '}
            <span className="font-semibold text-destructive">
              ${total.toFixed(2)}
            </span>
          </p>
        </div>
        <Button
          className="gap-2 font-semibold"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="w-4 h-4" /> Add Expense
        </Button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <h2 className="font-heading font-semibold">New Expense</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">
                Description *
              </label>
              <Input
                className="mt-1"
                placeholder="e.g. eBay selling fees"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider">
                Category
              </label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider">
                Amount (USD) *
              </label>
              <Input
                className="mt-1"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider">
                Date
              </label>
              <Input
                className="mt-1"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider">
                Notes
              </label>
              <Input
                className="mt-1"
                placeholder="Optional"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate(form)}
              disabled={
                !form.description || !form.amount || createMutation.isPending
              }
            >
              Save Expense
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
            ))}
        </div>
      ) : expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Receipt className="w-12 h-12 mb-4 opacity-30" />
          <p className="text-lg font-medium">No expenses yet</p>
          <p className="text-sm mt-1">
            Track shipping, fees, and other costs here
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {expenses.map((e) => (
            <div
              key={e.id}
              className="flex items-center gap-4 px-4 py-3 rounded-xl border border-border bg-card hover:border-primary/20 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{e.description}</p>
                {e.notes && (
                  <p className="text-[11px] text-muted-foreground truncate">
                    {e.notes}
                  </p>
                )}
              </div>
              <Badge
                className={`text-[10px] border-0 flex-shrink-0 ${
                  CAT_STYLES[e.category]
                }`}
              >
                {CATEGORIES.find((c) => c.value === e.category)?.label ||
                  e.category}
              </Badge>
              {e.date && (
                <p className="text-xs text-muted-foreground hidden sm:block flex-shrink-0">
                  {e.date}
                </p>
              )}
              <p className="text-sm font-semibold text-destructive flex-shrink-0">
                -${(e.amount || 0).toFixed(2)}
              </p>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive flex-shrink-0"
                onClick={() => setDeleteTarget(e)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete "{deleteTarget?.description}"?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this expense.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deleteTarget.id)}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
