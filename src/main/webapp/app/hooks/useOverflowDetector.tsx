import { useCallback, useEffect, useRef, useState } from 'react';

export interface useOverflowDetectorProps {
  onChange?: (overflow: boolean) => void;
  handleHeight?: boolean;
  handleWidth?: boolean;
}

export function useOverflowDetector(props: useOverflowDetectorProps = {}) {
  const [overflow, setOverflow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const updateState = useCallback(() => {
    if (ref.current === null) {
      return;
    }

    const { handleWidth = true, handleHeight = true } = props;

    const newState =
      (handleWidth && ref.current.offsetWidth < ref.current.scrollWidth) ||
      (handleHeight && ref.current.offsetHeight < ref.current.scrollHeight);

    if (newState === overflow) {
      return;
    }
    setOverflow(newState);
    if (props.onChange) {
      props.onChange(newState);
    }
  }, [ref.current, props.handleWidth, props.handleHeight, props.onChange, setOverflow, overflow]);

  useEffect(() => {
    updateState();
  });

  return {
    overflow,
    ref,
  };
}
