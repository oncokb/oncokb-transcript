import React, { useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import { VscFilterFilled } from 'react-icons/vsc';
import { Input } from 'reactstrap';
import './filter-icon-modal.scss';
import DefaultTooltip from 'app/shared/tooltip/DefaultTooltip';
import { Button } from 'reactstrap';

interface IFilterIconModalProps {
  id: string;
  allSelections: Set<string>;
  currSelections: Set<string>;
  updateSelections: (selected: Set<string>) => void;
}

export const FilterIconModal = observer(({ allSelections, currSelections, updateSelections }: IFilterIconModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newSelections, setNewSelections] = useState(currSelections);

  const handleSearchChange = event => {
    setSearchTerm(event.target.value);
  };

  const SearchedSelections = useMemo(() => {
    if (!allSelections) {
      return [];
    }
    return [...allSelections].filter(item => item.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [allSelections, searchTerm]);

  const handleCheckboxChange = (value, event) => {
    event.stopPropagation();
    if (event.target.checked) {
      newSelections.add(value);
    } else {
      newSelections.delete(value);
    }
    setNewSelections(new Set(newSelections));
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    if (event.target.checked) {
      setNewSelections(new Set(allSelections));
    } else {
      setNewSelections(new Set());
    }
  };

  const applyFilter = () => {
    updateSelections(new Set(newSelections));
  };

  const filterComponent = () => {
    return (
      <div className="filter-overlay" onClick={e => e.stopPropagation()}>
        <div style={{ marginTop: '10px' }}>
          <Input placeholder="Search" value={searchTerm} onChange={handleSearchChange} />
          <div className="checkbox-list">
            <div>
              <Input type="checkbox" onChange={e => handleSelectAll(e)} />
              <label>Select All</label>
            </div>
            {SearchedSelections.map(selection => (
              <div key={selection} style={{ display: 'flex' }}>
                <Input type="checkbox" checked={newSelections.has(selection)} onChange={e => handleCheckboxChange(selection, e)} />
                <label>{selection}</label>
              </div>
            ))}
          </div>
        </div>
        <div className="d-flex justify-content-end pt-2">
          <Button onClick={applyFilter} color="primary" size="sm">
            Filter
          </Button>
        </div>
      </div>
    );
  };

  return (
    <DefaultTooltip
      overlay={filterComponent}
      placement="right"
      trigger="click"
      overlayInnerStyle={{ background: 'transparent', boxShadow: 'none', border: 0, padding: 0 }}
      arrowContent={null}
    >
      <div className="filter-component" onClick={e => e.stopPropagation()}>
        <VscFilterFilled className="filter-icon" color="grey" size={10} />
      </div>
    </DefaultTooltip>
  );
});

export default FilterIconModal;
