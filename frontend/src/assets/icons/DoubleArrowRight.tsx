import { HTMLProps } from 'react';
export const DoubleArrowRight = (props: HTMLProps<HTMLElement>) => {
  return (
    <svg
      className={props.className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M11 4L19 12L11 20M8 8L12 12L8 16" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};
