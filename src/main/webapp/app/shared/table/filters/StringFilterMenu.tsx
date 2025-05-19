import React, { useEffect, useMemo, useState } from 'react';
import { Input, Button, Label } from 'reactstrap';
import { STRING_OPERATORS, applyStringOperator } from './types';
import _ from 'lodash';

export interface StringFilterMenuProps {
  id: string;
  currSelections: Set<string>;
  allSelections: Set<string>;
  updateSelections: (selected: Set<string>) => void;
}

export const StringFilterMenu: React.FC<StringFilterMenuProps> = ({
  id,
  currSelections,
  allSelections,
  updateSelections,
}: StringFilterMenuProps) => {
  const [filterTextInput, setFilterTextInput] = useState('');
  const [filterOperator, setFilterOperator] = useState(STRING_OPERATORS.contains);

  useEffect(() => {
    updateSelections(new Set());
  }, [filterTextInput, filterOperator]);

  const handleOperatorChange = e => {
    setFilterOperator(STRING_OPERATORS[e.target.value]);
  };

  const stringOperatorsDropdown = (
    <select className="form-control input-sm" onChange={handleOperatorChange}>
      {Object.values(STRING_OPERATORS).map(({ id: operatorId, label }) => (
        <option key={operatorId} value={operatorId}>
          {label}
        </option>
      ))}
    </select>
  );

  const handleFilterTextChange = e => {
    setFilterTextInput(e.target.value);
  };

  const handleCheckboxChange = (value, event) => {
    event.stopPropagation();
    const updated = new Set(currSelections);
    if (event.target.checked) {
      updated.add(value);
    } else {
      updated.delete(value);
    }
    updateSelections(updated);
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    if (event.target.checked) {
      updateSelections(new Set(filteredSelections));
    } else {
      updateSelections(new Set());
    }
  };

  const filteredSelections = useMemo(() => {
    if (!allSelections) {
      return [];
    }
    return [...allSelections].filter(item => applyStringOperator(item, filterTextInput, filterOperator));
  }, [allSelections, filterTextInput]);

  return (
    <div>
      <div className="d-flex">
        <div style={{ width: '150px' }}>{stringOperatorsDropdown}</div>
        <div style={{ width: '200px', marginLeft: '0.5rem' }}>
          <Input value={filterTextInput} onChange={handleFilterTextChange} />
        </div>
      </div>
      <div style={{ marginTop: '10px' }}>
        <div className="checkbox-list">
          <div>
            <Input id={`${id}-select-all`} type="checkbox" onChange={handleSelectAll} style={{ cursor: 'pointer' }} />
            <Label for={`${id}-select-all`} style={{ cursor: 'pointer' }}>
              Select all ({filteredSelections.length})
            </Label>
          </div>
          {Array.from(filteredSelections).map((selection, index) => {
            const htmlFor = `string-filter-selection-${id}-${index}`;
            return (
              <div key={selection} style={{ display: 'flex', margin: '2px' }}>
                <Input
                  id={htmlFor}
                  type="checkbox"
                  checked={currSelections.has(selection)}
                  onChange={e => handleCheckboxChange(selection, e)}
                  style={{ cursor: 'pointer' }}
                />
                <Label for={htmlFor} style={{ cursor: 'pointer' }}>
                  {selection}
                </Label>
              </div>
            );
          })}
        </div>
      </div>
      <div className="d-flex justify-content-end mt-2">
        <Button
          color="secondary"
          size="sm"
          onClick={() => {
            updateSelections(new Set());
          }}
        >
          Clear filters
        </Button>
      </div>
    </div>
  );
};
