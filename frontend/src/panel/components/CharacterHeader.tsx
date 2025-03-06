import { DoubleArrowLeft } from '@/assets/icons/DoubleArrowLeft';
import { Separator } from '@/components/ui/separator';
import { IViewProps } from '../pages/Panel';
import { CharacterIcon } from '@/assets/icons/CharacterIcon';
import { Views } from '@/types/User';
import { Star } from '@/assets/icons/Star';

interface IMenuHeaderProps {
  setView: React.Dispatch<React.SetStateAction<IViewProps>>;
  view: IViewProps;
  isTalentDisabled: boolean;
}

export const MenuHeader = ({ setView, view, isTalentDisabled }: IMenuHeaderProps) => {
  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-row w-full h-[32px] items-center bg-backgroundBlizzard-light space-between">
        <div
          className="w-[28px] flex flex-col justify-center"
          onClick={() => setView({ view: Views.LIST, character: null })}
        >
          <DoubleArrowLeft width={24} height={24} className="stroke-white hover:cursor-pointer" />
        </div>
        <div
          data-active={`${view.view === Views.ITEM ? true : false}`}
          className={`w-[32px] h-[32px] flex flex-col justify-center items-center data-[active=true]:bg-backgroundBlizzard ml-3 [&>svg]:data-[active=true]:fill-indigo-500`}
          onClick={() => setView({ view: Views.ITEM, character: view.character })}
        >
          <CharacterIcon className="fill-white hover:cursor-pointer hover:fill-indigo-500" />
        </div>
        <div
          data-active={`${view.view === Views.TALENTS ? true : false}`}
          className={`w-[32px] h-[32px] flex flex-col justify-center items-center data-[active=true]:bg-backgroundBlizzard ml-3 [&>svg]:data-[active=true]:fill-yellow-500`}
          onClick={() => (!isTalentDisabled ? setView({ view: Views.TALENTS, character: view.character }) : undefined)}
        >
          <Star className={`fill-white hover:cursor-pointer hover:fill-yellow-400`} />
        </div>
      </div>
      <Separator className="bg-white/15" />
    </div>
  );
};
