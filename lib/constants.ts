export const DALLE_QUALITY = {
  STANDARD: 'standard',
  HD: 'hd'
} as const;

export type ValueOf<T> = T[keyof T];