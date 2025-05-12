import React from 'react';
import { observer } from 'mobx-react';
import '../filter-icon-modal.scss';
import DefaultTooltip from 'app/shared/tooltip/DefaultTooltip';
import { FilterIcon } from './FilterIcon';
import { StringFilterMenu } from './StringFilterMenu';
import { NumberFilterMenu } from './NumberFilterMenu';
import { DateFilterMenu } from './DateFilterMenu';
import { FilterTypes } from './types';
import classNames from 'classnames';

type FilterValueTypeMap = {
  [FilterTypes.STRING]: string;
  [FilterTypes.NUMBER]: number;
  [FilterTypes.DATE]: Date;
};

interface IFilterIconModalProps<T extends FilterTypes> {
  id: string;
  filterType: T;
  allSelections: Set<FilterValueTypeMap[T]>;
  currSelections: Set<FilterValueTypeMap[T]>;
  updateSelections: (selected: Set<FilterValueTypeMap[T]>) => void;
}

export const FilterIconModal = observer(
  <T extends FilterTypes>({ id, filterType, allSelections, currSelections, updateSelections }: IFilterIconModalProps<T>) => {
    const renderFilterMenu = (): JSX.Element | null => {
      switch (filterType) {
        case FilterTypes.STRING:
          return (
            <StringFilterMenu
              id={id}
              currSelections={currSelections as Set<string>}
              allSelections={allSelections as Set<string>}
              updateSelections={updateSelections as (selected: Set<string>) => void}
            />
          );

        case FilterTypes.NUMBER:
          return (
            <NumberFilterMenu
              id={id}
              currSelections={currSelections as Set<number>}
              allSelections={allSelections as Set<number>}
              updateSelections={updateSelections as (selected: Set<number>) => void}
              updateFilterOperator={() => {}} // Replace with actual handlers if needed
              updateFilterRange={() => {}}
            />
          );

        case FilterTypes.DATE:
          return (
            <DateFilterMenu
              id={id}
              currSelections={currSelections as Set<Date>}
              allSelections={allSelections as Set<Date>}
              updateSelections={updateSelections as (selected: Set<Date>) => void}
            />
          );

        default:
          return null;
      }
    };

    return (
      <DefaultTooltip
        overlay={
          <div className={classNames('filter-overlay', 'date-filter')} onClick={e => e.stopPropagation()}>
            <h4></h4>
            {renderFilterMenu()}
          </div>
        }
        placement="right"
        trigger="click"
        overlayInnerStyle={{ background: 'transparent', boxShadow: 'none', border: 0, padding: 0 }}
        arrowContent={null}
      >
        <div className="filter-component" onClick={e => e.stopPropagation()}>
          <FilterIcon isActiveFilter={currSelections.size > 0} />
        </div>
      </DefaultTooltip>
    );
  },
);
