import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import CardForm from '@/components/collection/CardForm';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AddCard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Card.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      navigate('/collection');
    },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/collection"
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Add New Card
          </h1>
          <p className="text-sm text-muted-foreground">
            Add a card, graded slab, or sealed product
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <CardForm
          onSubmit={createMutation.mutate}
          isSubmitting={createMutation.isPending}
        />
      </div>
    </div>
  );
}
