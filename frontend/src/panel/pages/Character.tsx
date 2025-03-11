import { ApiCharacter } from '@/types/Characters';
import { Character } from '../components/Character';
import React from 'react';

interface ICharacterViewProps {
  character: ApiCharacter;
}

const CharacterViewComponent = ({ character }: ICharacterViewProps) => {
  return <Character character={character} />;
};

export const CharacterView = React.memo(CharacterViewComponent, (prevProps, nextProps) => {
  return prevProps.character.character_id === nextProps.character.character_id;
});
