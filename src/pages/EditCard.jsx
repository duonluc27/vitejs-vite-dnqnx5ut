import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import CardForm from '@/components/collection/CardForm';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditCard() {
  const urlParams = new URLSearchParams(window.location.search);
  const cardId = urlParams.get('id');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: cards = [], isLoading } = useQuery({
    queryKey: ['cards'],
    queryFn: () => base44.entities.Card.list(),
  });

  const card = cards.find((c) => c.id === cardId);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Card.update(cardId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      navigate('/collection');
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (!card) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 text-muted-foreground">
        Card not found.
      </div>
    );
  }

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
            Edit Card
          </h1>
          <p className="text-sm text-muted-foreground">{card.name}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <CardForm
          initialData={card}
          onSubmit={updateMutation.mutate}
          isSubmitting={updateMutation.isPending}
        />
      </div>
    </div>
  );
}
