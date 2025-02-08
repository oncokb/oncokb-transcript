import { useEffect, useRef, useState } from 'react';

export interface useOverflowDetectorProps {
  onChange?: (overflow: boolean) => void;
  detectHeight?: boolean;
  detectWidth?: boolean;
}

export function useOverflowDetector(props: useOverflowDetectorProps = {}) {
  const [isOverflow, setIsOverflow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateState = () => {
      if (ref.current === null) {
        return;
      }

      const { detectWidth: handleWidth = true, detectHeight: handleHeight = true } = props;

      const newState =
        (handleWidth && ref.current.offsetWidth < ref.current.scrollWidth) ||
        (handleHeight && ref.current.offsetHeight < ref.current.scrollHeight);

      if (newState === isOverflow) {
        return;
      }
      setIsOverflow(newState);
      if (props.onChange) {
        props.onChange(newState);
      }
    };
    updateState();
  }, [ref.current, props.detectWidth, props.detectHeight, props.onChange]);

  return [isOverflow, ref] as const;
}
