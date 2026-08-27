import { ApiCharacter } from '@/types/Characters';
import React from 'react';
import { MythicKeystone } from '../components/MythicKeystone';

interface IMythicKeystoneView {
  character: ApiCharacter;
}

const MythicKeystoneViewComponent = ({ character }: IMythicKeystoneView) => {
  return <MythicKeystone character={character} />;
};

export const MythicKeystoneView = React.memo(MythicKeystoneViewComponent, (prevProps, nextProps) => {
  return prevProps.character.character_id === nextProps.character.character_id;
});
