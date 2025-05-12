import React, { useState } from 'react';
import { DateRangePicker, Range } from 'react-date-range';

export interface DateFilterMenuProp {
  id: string;
  currSelections: Set<Date>;
  allSelections: Set<Date>;
  updateSelections: (selected: Set<Date>) => void;
}

const RANGE_KEY = 'selection';
const DEFAULT_DATE_RANGE: Range[] = [
  {
    startDate: new Date(),
    endDate: new Date(),
    key: RANGE_KEY,
  },
];

export const DateFilterMenu: React.FC<DateFilterMenuProp> = ({
  id,
  currSelections,
  allSelections,
  updateSelections,
}: DateFilterMenuProp) => {
  const [dateRanges, setDateRanges] = useState<Range[]>(DEFAULT_DATE_RANGE);

  const handleRangeChange = (item: { [RANGE_KEY: string]: Range }) => {
    const range = item[RANGE_KEY];
    setDateRanges([range]);

    const { startDate, endDate } = range;
    if (!startDate || !endDate) return;

    const filtered = new Set<Date>();
    allSelections.forEach(date => {
      if (date >= startDate && date <= endDate) {
        filtered.add(date);
      }
    });

    updateSelections(filtered);
  };

  return <DateRangePicker showDateDisplay ranges={dateRanges} onChange={handleRangeChange} />;
};
