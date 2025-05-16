import React, { useState } from 'react';
import { DateRangePicker, Range } from 'react-date-range';
import { Button } from 'reactstrap';

export interface DateFilterMenuProp {
  id: string;
  currSelections: Set<Date>;
  allSelections: Set<Date>;
  updateSelections: (selected: Set<Date>, hasFilters: boolean) => void;
}

const RANGE_KEY = 'selection';
const DEFAULT_DATE_RANGE: Range[] = [
  {
    startDate: new Date(),
    endDate: new Date(),
    key: RANGE_KEY,
  },
];

export const DateFilterMenu: React.FC<DateFilterMenuProp> = ({ updateSelections }: DateFilterMenuProp) => {
  const [dateRanges, setDateRanges] = useState<Range[]>(DEFAULT_DATE_RANGE);

  const handleRangeChange = (item: { [RANGE_KEY: string]: Range }) => {
    const range = item[RANGE_KEY];
    setDateRanges([range]);

    const { startDate, endDate } = range;
    if (!startDate || !endDate) {
      return;
    }

    updateSelections(new Set([startDate, endDate]), true);
  };

  return (
    <div>
      <DateRangePicker showDateDisplay ranges={dateRanges} onChange={handleRangeChange} />
      <div className="d-flex justify-content-end mt-2">
        <Button
          color="secondary"
          size="sm"
          onClick={() => {
            setDateRanges(DEFAULT_DATE_RANGE);
            updateSelections(new Set(), false);
          }}
        >
          Clear filters
        </Button>
      </div>
    </div>
  );
};
