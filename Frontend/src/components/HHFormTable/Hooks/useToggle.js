import React from "react";

export function useToggle(initialValue = false) {
  const [value, setValue] = React.useState(initialValue);

  const toggle = React.useCallback(() =>
    setValue((v) => !v), []
  )

  const setTrue = React.useCallback(() =>
    setValue(true), []
  )

  const setFalse = React.useCallback(() =>
    setValue(false), []
  )
  const returnCallback = { toggle, setTrue, setFalse, setValue };
  return [value, returnCallback];
}