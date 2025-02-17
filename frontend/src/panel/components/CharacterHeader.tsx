import { DoubleArrowLeft } from '@/assets/icons/DoubleArrowLeft';
import { Separator } from '@/components/ui/separator';
import { IViewProps } from '../pages/Panel';

interface ICharacterProps {
  setView: React.Dispatch<React.SetStateAction<IViewProps>>;
}

export const CharacterHeader = ({ setView }: ICharacterProps) => {
  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col w-full h-[32px] justify-center bg-backgroundBlizzard-light">
        <div
          className="w-[28px] flex flex-col justify-center w-full"
          onClick={() => setView({ view: 'list', character: null })}
        >
          <DoubleArrowLeft width={24} height={24} className="stroke-white hover:cursor-pointer" />
        </div>
      </div>
      <Separator className="bg-white/15" />
    </div>
  );
};
