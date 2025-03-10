import { HTMLProps } from 'react';
export const Update = (props: HTMLProps<HTMLElement>) => {
  return (
    <svg
      className={props.className}
      width={24}
      height={24}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-labelledby="Update icon"
    >
      <path
        d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 3 16.5 3 16.5M2 12C2 6.47715 6.44444 2 12 2C18.6667 2 22 7.5 22 7.5M22 7.5V4M22 7.5H18.5M3 16.5H6.5M3 16.5V20"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
