import { RefObject, useCallback, useEffect } from 'react';

export const useTextareaAutoHeight = (inputRef: RefObject<HTMLInputElement | HTMLTextAreaElement | null>, type: string | undefined) => {
  const resize = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = 'auto';
    input.style.height = `${input.scrollHeight}px`;
  }, [inputRef]);

  useEffect(() => {
    const input = inputRef.current;
    if (!input || type !== 'textarea') {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      window.requestAnimationFrame(() => {
        resize();
      });
    });
    resizeObserver.observe(input);
    resize();

    return () => {
      resizeObserver.disconnect();
    };
  }, [inputRef, resize, type]);

  return resize;
};
