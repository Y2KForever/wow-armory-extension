import { TimeRemaining } from '@/types/Utils';
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

export const Capitalize = (s: string) => s && String(s[0]).toUpperCase() + String(s).slice(1);

export const toSpaces = (input: string): string => {
  return input.toLowerCase().replace(/_/g, ' ');
};

export const removeSpace = (input: string): string => input.toLowerCase().replace(/\s/g, '');

export const toUnderscores = (input: string) => input.toLowerCase().replace(/\s+/g, '_');

export const readableSpec = (input?: string) => (input ? Capitalize(toSpaces(input.replace(/\-.*$/gm, ''))) : '');

export const getTimeRemaining = (isoDate: string): TimeRemaining => {
  const target = new Date(isoDate);
  const now = new Date();

  if (isNaN(target.getTime())) {
    return {
      invalid: true,
      expired: false,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const difference = target.getTime() - now.getTime();

  if (difference <= 0) {
    return {
      expired: true,
      invalid: false,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const hours = Math.floor(difference / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  return {
    expired: false,
    invalid: false,
    hours,
    minutes,
    seconds,
  };
};
