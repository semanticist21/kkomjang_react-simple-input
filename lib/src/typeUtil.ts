export const createEmptyObj = <T extends string, U>(
  keys: readonly T[],
  fill: U
): Record<T, U> => {
  return Object.fromEntries(keys.map((key) => [key, fill])) as Record<T, U>;
};

export const createMatchingObj = <T extends string>(
  keys: readonly T[]
): Record<T, T> => {
  return Object.fromEntries(keys.map((key) => [key, key])) as Record<T, T>;
};
