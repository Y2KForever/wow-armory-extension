import { Spinner } from '@/assets/icons/Spinner';
import { Button } from '@/components/ui/button';

interface FetchCharactersButtonProps {
  onClick: () => void;
  isDisabled: boolean;
  isLoading: boolean;
}

export const FetchCharactersButton = ({ onClick, isDisabled, isLoading }: FetchCharactersButtonProps) => {
  return (
    <Button
      style={{ textDecoration: 'none' }}
      disabled={isDisabled}
      onClick={onClick}
      id="bnet-connect-btn"
      className="w-[232px] h-[48px] font-bold text-xl rounded-lg bg-blizzard text-white flex items-center flex-row justify-evenly hover:cursor-pointer mt-2"
      variant="link"
    >
      {isLoading ? (
        <>
          <Spinner className="animate-spin fill-current" />
          Processing...
        </>
      ) : (
        `Fetch Characters`
      )}
    </Button>
  );
};
