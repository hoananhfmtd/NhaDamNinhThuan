import React from "react";

export function useCounter(initialValue = 0) {
  const [counter, setCounter] = React.useState(initialValue);
  return {
    counter,
    increment: React.useCallback(() => setCounter(c => c + 1), []),
    decrement: React.useCallback(() => setCounter(c => c - 1), []),
    setCounter
  }
} 