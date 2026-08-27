import { ApiCharacter, InstanceType } from '@/types/Characters';
import React from 'react';
import { Instances } from '../components/Instances';

interface IInstanceView {
  character: ApiCharacter;
  type?: InstanceType;
}

const InstanceViewComponent = ({ character, type = InstanceType.RAID }: IInstanceView) => {
  return <Instances character={character} type={type} />;
};

export const InstanceView = React.memo(InstanceViewComponent, (prevProps, nextProps) => {
  return prevProps.character.character_id === nextProps.character.character_id && prevProps.type === nextProps.type;
});
