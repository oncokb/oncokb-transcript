import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { GridOptions } from 'ag-grid-community';
import React, { useMemo } from 'react';

export interface IOncoKBGrid<T> extends GridOptions<T> {}

export const OncoKBGrid = <T extends object>(props: IOncoKBGrid<T>) => {
  const defaultColDef = useMemo(() => {
    return {
      filter: 'agGroupColumnFilter',
    };
  }, []);
  return (
    <div className={'ag-theme-quartz'}>
      <AgGridReact
        rowSelection="multiple"
        defaultColDef={defaultColDef}
        suppressRowClickSelection={true}
        pagination={true}
        paginationPageSize={10}
        paginationPageSizeSelector={[10, 25, 50]}
        domLayout="autoHeight"
        {...props}
      />
    </div>
  );
};
