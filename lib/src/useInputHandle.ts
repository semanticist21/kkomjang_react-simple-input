import * as React from "react";

import type {
  InputValues,
  UseInputHandleProps,
  UseInputHandleResult,
} from "./type";
import { createEmptyObj, createMatchingObj } from "./typeUtil";

const createInitialValues = <
  T extends string,
  E extends string,
  U extends string
>({
  strings,
  booleans,
  numbers,
  defaults,
}: {
  strings: readonly T[];
  booleans: readonly E[];
  numbers: readonly U[];
  defaults?: UseInputHandleProps<T, E, U>["defaults"];
}): InputValues<T, E, U> => {
  // 각 타입별 기본값을 한 번에 합쳐 초기 state를 만든다.
  return Object.assign(
    {} as InputValues<T, E, U>,
    createEmptyObj(strings, defaults?.string ?? ""),
    createEmptyObj(booleans, defaults?.boolean ?? false),
    createEmptyObj(numbers, defaults?.number ?? 0)
  );
};

const resolveInputKey = <T extends string>(
  target: Pick<
    HTMLButtonElement | HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
    "id" | "name"
  >,
  useId: boolean,
  isKey: (key: string) => key is T
): T => {
  // id/name 중 실제로 사용할 키를 골라 검증한다.
  const key = useId ? target.id : target.name;

  if (!key) {
    throw new Error(useId ? "id 값이 비어 있습니다." : "name 값이 비어 있습니다.");
  }

  if (!isKey(key)) {
    throw new Error(
      useId ? "id 값이 등록된 키가 아닙니다." : "name 값이 등록된 키가 아닙니다."
    );
  }

  return key;
};

export const useInputHandle = <
  T extends string = never,
  E extends string = never,
  U extends string = never
>({
  strings = [],
  booleans = [],
  numbers = [],
  defaults,
}: UseInputHandleProps<T, E, U>): UseInputHandleResult<T, E, U> => {
  const stringKeys = React.useMemo(() => [...strings] as readonly T[], [strings]);
  const boolKeys = React.useMemo(() => [...booleans] as readonly E[], [booleans]);
  const numberKeys = React.useMemo(() => [...numbers] as readonly U[], [numbers]);

  const [values, setValues] = React.useState<InputValues<T, E, U>>(() =>
    createInitialValues({
      strings: stringKeys,
      booleans: boolKeys,
      numbers: numberKeys,
      defaults,
    })
  );

  const matching = React.useMemo(() => {
    // 폼 요소에 바로 꽂아 넣을 수 있게 key 매핑 객체를 고정한다.
    return Object.freeze(
      Object.assign(
        {} as UseInputHandleResult<T, E, U>["matching"],
        createMatchingObj(stringKeys),
        createMatchingObj(boolKeys),
        createMatchingObj(numberKeys)
      )
    );
  }, [boolKeys, numberKeys, stringKeys]);

  const isStrKey = React.useCallback(
    (key: string): key is T => stringKeys.includes(key as T),
    [stringKeys]
  );

  const isBoolKey = React.useCallback(
    (key: string): key is E => boolKeys.includes(key as E),
    [boolKeys]
  );

  const isNumKey = React.useCallback(
    (key: string): key is U => numberKeys.includes(key as U),
    [numberKeys]
  );

  const handleString = React.useCallback(
    (useId = false) =>
      (
        event: React.ChangeEvent<
          | HTMLButtonElement
          | HTMLInputElement
          | HTMLSelectElement
          | HTMLTextAreaElement
        >
      ) => {
        const key = resolveInputKey(event.currentTarget, useId, isStrKey);
        const { value } = event.currentTarget;

        setValues((prev) => ({
          ...prev,
          [key]: value,
        }));
      },
    [isStrKey]
  );

  const handleCheck = React.useCallback(
    (useId = false) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const key = resolveInputKey(event.currentTarget, useId, isBoolKey);
      const { checked } = event.currentTarget;

      setValues((prev) => ({
        ...prev,
        [key]: checked,
      }));
    },
    [isBoolKey]
  );

  const handleNumber = React.useCallback(
    (useId = false) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const key = resolveInputKey(event.currentTarget, useId, isNumKey);
      const { value } = event.currentTarget;

      // 빈 값은 유지하고, 숫자 문자열만 number로 변환한다.
      if (value === "" || /^\d+(\.\d+)?$/.test(value)) {
        setValues((prev) => ({
          ...prev,
          [key]: value === "" ? "" : Number(value),
        }));
      }
    },
    [isNumKey]
  );

  return {
    values,
    setValues,
    matching,
    handlers: {
      handleString,
      handleCheck,
      handleNumber,
    },
    keys: {
      allKeys: [...stringKeys, ...boolKeys, ...numberKeys] as const,
      stringKeys,
      boolKeys,
      numberKeys,
    },
    checks: {
      isStrKey,
      isBoolKey,
      isNumKey,
    },
  };
};
