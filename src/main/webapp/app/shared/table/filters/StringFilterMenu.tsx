import React, { useMemo, useState } from 'react';
import { Input, Button } from 'reactstrap';
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
  const [newSelections, setNewSelections] = useState(currSelections);
  const [filterOperator, setFilterOperator] = useState(STRING_OPERATORS.contains);

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
    // _.debounce(() => updateFilterText(e.target.value), 500);
  };

  const handleCheckboxChange = (value, event) => {
    event.stopPropagation();
    if (event.target.checked) {
      newSelections.add(value);
    } else {
      newSelections.delete(value);
    }
    setNewSelections(new Set(newSelections));
    updateSelections(new Set(newSelections));
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    if (event.target.checked) {
      setNewSelections(new Set(allSelections));
    } else {
      setNewSelections(new Set());
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
            <Input type="checkbox" onChange={handleSelectAll} style={{ cursor: 'pointer' }} />
            <label>Select all ({filteredSelections.length})</label>
          </div>
          {Array.from(filteredSelections).map(selection => (
            <div key={selection} style={{ display: 'flex', margin: '2px' }}>
              <Input
                type="checkbox"
                checked={newSelections.has(selection)}
                onChange={e => handleCheckboxChange(selection, e)}
                style={{ cursor: 'pointer' }}
              />
              <label>{selection}</label>
            </div>
          ))}
        </div>
      </div>
      <div className="d-flex justify-content-end mt-2">
        <Button
          color="secondary"
          size="sm"
          onClick={() => {
            setNewSelections(new Set());
          }}
        >
          Clear filters
        </Button>
      </div>
    </div>
  );
};
