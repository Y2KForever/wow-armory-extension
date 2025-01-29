import { Button } from '@/components/ui/button';

interface BNetConnectProps {
  openAuth: () => void;
  isDisabled: boolean;
}

export const ImportButton = ({ openAuth, isDisabled }: BNetConnectProps) => {
  return (
    <Button
      style={{ textDecoration: 'none' }}
      disabled={isDisabled}
      onClick={openAuth}
      id="bnet-connect-btn"
      className="select-none w-[232px] h-[48px] font-bold text-xl rounded-lg bg-blizzard flex items-center flex-row justify-evenly hover:cursor-pointer mr-16"
      variant="link"
    >
      Import Characters
    </Button>
  );
};
