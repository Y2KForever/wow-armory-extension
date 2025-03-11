import { ApiCharacter } from '@/types/Characters';
import { Talents } from '../components/Talents';
import React from 'react';

interface ITalentView {
  character: ApiCharacter;
}

const TalentViewComponent = ({ character }: ITalentView) => {
  return <Talents character={character} />;
};

export const TalentView = React.memo(TalentViewComponent, (prevProps, nextProps) => {
  return prevProps.character.character_id === nextProps.character.character_id;
});
