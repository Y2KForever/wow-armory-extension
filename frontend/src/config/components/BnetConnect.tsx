import { BattleNet } from '@/assets/icons/BattleNet';
import { Button } from '@/components/ui/button';

interface BNetConnectProps {
  openAuth: () => void;
  isDisabled: boolean;
}

export const BNetConnect = ({ openAuth, isDisabled }: BNetConnectProps) => {
  return (
    <Button
      style={{ textDecoration: 'none' }}
      disabled={isDisabled}
      onClick={openAuth}
      id="bnet-connect-btn"
      className="select-none w-[232px] h-[48px] font-bold text-xl rounded-lg bg-blizzard text-white flex items-center flex-row justify-evenly hover:cursor-pointer mt-2"
      variant="link"
    >
      <BattleNet className="fill-current" />
      Get Started Now
    </Button>
  );
};
