import { useEffect, useRef } from "react";

export default function useClickOutSide(callback) {
  const nodeRef = useRef(null);
  useEffect(() => {
    function handleClickOutSide(ev) {
      if (nodeRef.current && !nodeRef.current.contains(ev.target)) {
        callback?.();
      }
    }
    document.addEventListener("click", handleClickOutSide);
    return () => {
      document.removeEventListener("click", handleClickOutSide);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return {
    nodeRef,
  };
}
