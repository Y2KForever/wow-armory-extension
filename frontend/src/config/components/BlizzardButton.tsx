import { Spinner } from '@/assets/icons/Spinner';
import { Button } from '@/components/ui/button';
import { ReactElement } from 'react';

interface BlizzardButtonProps {
  onClick: () => {};
  isDisabled: boolean;
  isLoading: boolean;
  children: ReactElement | string;
  className?: string | undefined;
}

export const BlizzardButton = ({ onClick, isDisabled, isLoading, children, className }: BlizzardButtonProps) => {
  return (
    <Button
      style={{ textDecoration: 'none' }}
      disabled={isDisabled}
      onClick={onClick}
      id="bnet-connect-btn"
      className={`select-none w-[232px] h-[48px] font-bold text-xl rounded-lg bg-blizzard flex items-center flex-row justify-evenly hover:cursor-pointer ${className}`}
      variant="link"
    >
      {isLoading ? (
        <>
          <Spinner className="animate-spin fill-current" />
          Processing...
        </>
      ) : (
        children
      )}
    </Button>
  );
};
