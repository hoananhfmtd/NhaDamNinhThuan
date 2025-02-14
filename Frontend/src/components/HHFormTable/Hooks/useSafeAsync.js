import { useEffect, useRef } from 'react';

function useSafeAsync(callback, dependencies = []) {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;

    callback().catch((error) => {
      if (isMounted.current) {
        console.error('Error occurred:', error);
      }
    });

    return () => {
      isMounted.current = false;
    };
  }, dependencies);
}

export default useSafeAsync;