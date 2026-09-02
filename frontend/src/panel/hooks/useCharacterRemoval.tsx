import { useCallback, useEffect, useState } from 'react';
import { ApiCharacter } from '@/types/Characters';
import { useDeleteCharacterMutation } from '@/store/api/profile';
import { Capitalize } from '@/lib/utils';
import { RemoveCharacterDialog } from '../components/RemoveCharacterDialog';
import { PanelToast, ToastKind } from '../components/PanelToast';

const DONE_TOAST_MS = 6000;

export const useCharacterRemoval = () => {
  const [deleteCharacter] = useDeleteCharacterMutation();
  const [asking, setAsking] = useState<ApiCharacter | null>(null);
  const [hidden, setHidden] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState<{ kind: ToastKind; character: ApiCharacter } | null>(null);

  const remove = useCallback(
    async (character: ApiCharacter) => {
      setHidden((current) => new Set(current).add(character.character_id));
      setToast(null);
      try {
        await deleteCharacter(character.character_id).unwrap();
        setToast({ kind: 'done', character });
      } catch {
        setHidden((current) => {
          const next = new Set(current);
          next.delete(character.character_id);
          return next;
        });
        setToast({ kind: 'error', character });
      }
    },
    [deleteCharacter],
  );

  useEffect(() => {
    if (toast?.kind !== 'done') return;
    const timer = setTimeout(() => setToast(null), DONE_TOAST_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  return {
    hidden,
    ask: setAsking,
    overlay: asking ? (
      <RemoveCharacterDialog
        character={asking}
        onCancel={() => setAsking(null)}
        onConfirm={() => {
          const character = asking;
          setAsking(null);
          void remove(character);
        }}
      />
    ) : null,
    footer: toast ? (
      <PanelToast
        kind={toast.kind}
        text={
          toast.kind === 'done'
            ? `${Capitalize(toast.character.name)} removed from the roster.`
            : `Could not remove ${Capitalize(toast.character.name)}.`
        }
        actionLabel={toast.kind === 'error' ? 'RETRY' : undefined}
        onAction={toast.kind === 'error' ? () => void remove(toast.character) : undefined}
      />
    ) : null,
  };
};
