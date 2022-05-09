import { useEffect, useRef } from "react";

export default function useInterval(callback: () => void, delay: number) {
  const savedCallback = useRef<() => void>();
  savedCallback.current = callback;
  useEffect(() => {
    const id = delay
      ? setInterval(() => savedCallback.current?.(), delay)
      : undefined;
    return () => clearInterval(id);
  }, [delay]);
}
