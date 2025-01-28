import { HTMLProps } from 'react';
export const Sort = (props: HTMLProps<HTMLElement>) => {
  return (
    <svg
      className={props.className}
      width={props.width}
      height={props.height}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-labelledby="Sort icon"
    >
      <title>Sort</title>
      <path
        d="M7 22L3 18M7 22L11 18M7 22V14M7 3V10M16 14H21L16 22H21M16 10V7M16 7V4.5C16 3.11929 17.1193 2 18.5 2C19.8807 2 21 3.11929 21 4.5V7M16 7H21M21 7V10"
        stroke-width="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
