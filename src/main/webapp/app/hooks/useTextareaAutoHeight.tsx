import React, { useEffect } from 'react';
import { InputType } from 'zlib';

export const useTextareaAutoHeight = (
  inputRef: React.MutableRefObject<HTMLInputElement | HTMLTextAreaElement | null>,
  type: InputType | undefined,
) => {
  useEffect(() => {
    const input = inputRef.current;
    if (!input || type !== 'textarea') {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      window.requestAnimationFrame(() => {
        input.style.height = 'auto';
        input.style.height = `${input.scrollHeight}px`;
      });
    });
    resizeObserver.observe(input);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);
};
