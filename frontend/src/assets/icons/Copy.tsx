import { HTMLProps } from 'react';
export const CopyIcon = (props: HTMLProps<HTMLElement>) => {
  return (
    <svg
      style={props.style}
      className={props.className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        opacity="0.32"
        d="M18 7.25V10C18 12.8003 18 14.2004 17.455 15.27C16.9757 16.2108 16.2108 16.9757 15.27 17.455C14.2004 18 12.8003 18 10 18H7.25012C7.25012 18.6967 7.25012 19.0451 7.29342 19.3369C7.55194 21.0797 8.92037 22.4482 10.6632 22.7067C10.9551 22.75 11.3034 22.75 12.0001 22.75H16.3501C18.5903 22.75 19.7104 22.75 20.5661 22.314C21.3187 21.9305 21.9307 21.3186 22.3141 20.566C22.7501 19.7103 22.7501 18.5902 22.7501 16.35V12.0001C22.7501 11.3033 22.7501 10.9549 22.7068 10.663C22.4483 8.92023 21.0799 7.55186 19.3371 7.29331C19.0452 7.25 18.6968 7.25 18 7.25Z"
      />
      <path d="M7.65012 1.25C5.40991 1.25 4.28981 1.25 3.43416 1.68597C2.68151 2.06947 2.06959 2.68139 1.6861 3.43404C1.25012 4.28969 1.25012 5.40979 1.25012 7.65V10.35C1.25012 12.5902 1.25012 13.7103 1.6861 14.566C2.06959 15.3186 2.68151 15.9305 3.43416 16.314C4.28981 16.75 5.40991 16.75 7.65012 16.75H10.3501C12.5903 16.75 13.7104 16.75 14.5661 16.314C15.3187 15.9305 15.9307 15.3186 16.3141 14.566C16.7501 13.7103 16.7501 12.5902 16.7501 10.35V7.65C16.7501 5.40979 16.7501 4.28969 16.3141 3.43404C15.9307 2.68139 15.3187 2.06947 14.5661 1.68597C13.7104 1.25 12.5903 1.25 10.3501 1.25H7.65012Z" />
    </svg>
  );
};
