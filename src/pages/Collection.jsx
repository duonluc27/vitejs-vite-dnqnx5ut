import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CardItem from '@/components/collection/CardItem';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  SlidersHorizontal,
  Package,
  LayoutList,
  LayoutGrid,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import CardListRow from '@/components/collection/CardListRow';
import RefreshPricesButton from '@/components/collection/RefreshPricesButton';
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

export default function Collection() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewMode, setViewMode] = useState('card');

  const queryClient = useQueryClient();

  const { data: cards = [], isLoading } = useQuery({
    queryKey: ['cards'],
    queryFn: () => base44.entities.Card.list('-created_date'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Card.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      setDeleteTarget(null);
    },
  });

  const filtered = cards
    .filter((c) => {
      const matchSearch =
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.set_name?.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'all' || c.type === typeFilter;
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchSearch && matchType && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'newest')
        return new Date(b.created_date) - new Date(a.created_date);
      if (sortBy === 'value_high')
        return (b.current_value || 0) - (a.current_value || 0);
      if (sortBy === 'value_low')
        return (a.current_value || 0) - (b.current_value || 0);
      if (sortBy === 'profit') {
        const profitA =
          (a.current_value || 0) -
          (a.purchase_price || 0) -
          (a.grading_cost || 0);
        const profitB =
          (b.current_value || 0) -
          (b.purchase_price || 0) -
          (b.grading_cost || 0);
        return profitB - profitA;
      }
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Collection
        </h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('card')}
              className={cn(
                'p-2 transition-colors',
                viewMode === 'card'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted text-muted-foreground'
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 transition-colors',
                viewMode === 'list'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted text-muted-foreground'
              )}
            >
              <LayoutList className="w-4 h-4" />
            </button>
          </div>
          <RefreshPricesButton cards={cards} />
          <Link to="/add">
            <Button className="gap-2 font-semibold shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4" /> Add Card
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search cards..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="raw_card">Raw Cards</SelectItem>
            <SelectItem value="graded_card">Graded Cards</SelectItem>
            <SelectItem value="sealed_product">Sealed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="holding">Holding</SelectItem>
            <SelectItem value="listed">Listed</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-40">
            <SlidersHorizontal className="w-3.5 h-3.5 mr-2" />
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="value_high">Value: High→Low</SelectItem>
            <SelectItem value="value_low">Value: Low→High</SelectItem>
            <SelectItem value="profit">Most Profitable</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cards List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Package className="w-12 h-12 mb-4 opacity-30" />
          <p className="text-lg font-medium">No cards found</p>
          <p className="text-sm mt-1">
            {cards.length === 0
              ? 'Add your first card to get started'
              : 'Try adjusting your filters'}
          </p>
          {cards.length === 0 && (
            <Link to="/add" className="mt-4">
              <Button className="gap-2">
                <Plus className="w-4 h-4" /> Add Your First Card
              </Button>
            </Link>
          )}
        </div>
      ) : viewMode === 'card' ? (
        <div className="space-y-4">
          {filtered.map((card) => (
            <CardItem key={card.id} card={card} onDelete={setDeleteTarget} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((card) => (
            <CardListRow key={card.id} card={card} onDelete={setDeleteTarget} />
          ))}
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this item from your collection.
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
