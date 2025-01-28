import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isFetchBaseQueryError = (error: any): error is FetchBaseQueryError & { data: { error: string } } => {
  return (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    'data' in error &&
    typeof error.data === 'object' &&
    error.data !== null &&
    'error' in error.data &&
    typeof error.data.error === 'string'
  );
};
