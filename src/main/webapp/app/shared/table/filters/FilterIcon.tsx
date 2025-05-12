import React from 'react';
import { GoFilter } from 'react-icons/go';
import '../filter-icon-modal.scss';

export const FilterIcon = ({ isActiveFilter }: { isActiveFilter: boolean }) => {
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <GoFilter className="filter-icon" size={20} style={{ fontWeight: 'bold' }} />
      {isActiveFilter && <span className="active-filter-circle" />}
    </div>
  );
};
