import { HTMLProps } from 'react';
export const DoubleArrowLeft = (props: HTMLProps<HTMLElement>) => {
  return (
    <svg
      className={props.className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M13 4L5 12L13 20M16 8L12 12L16 16" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};
