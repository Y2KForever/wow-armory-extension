import { ApiCharacter } from '@/types/Characters';
import React from 'react';
import { Instances } from '../components/Instances';

interface IInstanceView {
  character: ApiCharacter;
}

const InstanceViewComponent = ({ character }: IInstanceView) => {
  return <Instances character={character} />;
};

export const InstanceView = React.memo(InstanceViewComponent, (prevProps, nextProps) => {
  return prevProps.character.character_id === nextProps.character.character_id;
});
