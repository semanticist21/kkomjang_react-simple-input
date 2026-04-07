import type * as React from "react";

export type CombineIfNotNever<A, B, C> = [A] extends [never]
  ? [B] extends [never]
    ? [C] extends [never]
      ? never
      : C
    : [C] extends [never]
    ? B
    : B & C
  : [B] extends [never]
  ? [C] extends [never]
    ? A
    : A & C
  : [C] extends [never]
  ? A & B
  : A & B & C;

export type InputValues<
  T extends string,
  E extends string,
  U extends string
> = CombineIfNotNever<Record<T, string>, Record<E, boolean>, Record<U, number>>;

export interface UseInputHandleProps<
  T extends string,
  E extends string,
  U extends string
> {
  strings?: readonly T[];
  booleans?: readonly E[];
  numbers?: readonly U[];
  defaults?: {
    string?: string;
    boolean?: boolean;
    number?: number;
  };
}

export interface UseInputHandleResult<
  T extends string,
  E extends string,
  U extends string
> {
  values: InputValues<T, E, U>;
  setValues: React.Dispatch<React.SetStateAction<InputValues<T, E, U>>>;
  matching: Readonly<Record<T, T> & Record<E, E> & Record<U, U>>;
  handlers: {
    handleString: (
      useId?: boolean
    ) => (
      event: React.ChangeEvent<
        | HTMLButtonElement
        | HTMLInputElement
        | HTMLSelectElement
        | HTMLTextAreaElement
      >
    ) => void;
    handleCheck: (
      useId?: boolean
    ) => (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumber: (
      useId?: boolean
    ) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  };
  keys: {
    readonly allKeys: readonly (T | E | U)[];
    readonly stringKeys: readonly T[];
    readonly boolKeys: readonly E[];
    readonly numberKeys: readonly U[];
  };
  checks: {
    isStrKey: (key: string) => key is T;
    isBoolKey: (key: string) => key is E;
    isNumKey: (key: string) => key is U;
  };
}
