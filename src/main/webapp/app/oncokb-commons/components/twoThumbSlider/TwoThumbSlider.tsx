import React, { useState } from 'react';
import { formatPercentage } from 'app/shared/util/utils';
import classnames from 'classnames';
import * as styles from './styles.module.scss';

interface RangeSliderProps {
  min: number;
  max: number;
  range: [number, number];
  step: number;
  onChange: (newRange: [number, number]) => void;
}

export const TwoThumbSlider = ({ min, max, range, step, onChange }: RangeSliderProps) => {
  const [minValue, setMinValue] = useState(range ? range[0] : min);
  const [maxValue, setMaxValue] = useState(range ? range[1] : max);

  const handleMinChange = e => {
    e.preventDefault();
    const newMinVal = Math.min(+e.target.value, maxValue);
    setMinValue(newMinVal);
    onChange([newMinVal, maxValue]);
  };

  const handleMaxChange = e => {
    e.preventDefault();
    const newMaxVal = Math.max(+e.target.value, minValue);
    setMaxValue(newMaxVal);
    onChange([minValue, newMaxVal]);
  };

  const minPos = ((minValue - min) / ((max ?? 100) - min)) * 100;
  const maxPos = ((maxValue - min) / ((max ?? 100) - min)) * 100;

  return (
    <div className={styles.wrapper}>
      <div className={styles['range-slider']}>
        <div className={styles['range-labels']}>
          <span className={classnames(styles['range-label'], styles['range-label-start'])}>{formatPercentage(minValue)}</span>
          <span className={classnames(styles['range-label'], styles['range-label-end'])}>{formatPercentage(maxValue)}</span>
        </div>
        <input type="range" value={minValue} min={min} max={max} step={step} onChange={handleMinChange} />
        <input type="range" value={maxValue} min={min} max={max} step={step} onChange={handleMaxChange} />
        <div className={styles['track-wrapper']}>
          <div className={styles['track']} />
          <div className={styles['range-between']} style={{ left: `${minPos}%`, right: `${100 - maxPos}%` }} />
          <div className={styles['control']} style={{ left: `${minPos}%` }} />
          <div className={styles['control']} style={{ left: `${maxPos}%` }} />
        </div>
      </div>
    </div>
  );
};

export default TwoThumbSlider;
