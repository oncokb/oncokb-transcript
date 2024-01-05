import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';

import { IGenomicIndicator } from 'app/shared/model/genomic-indicator.model';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';

import { IRootStore } from 'app/stores';
import EntityActionButton from 'app/shared/button/EntityActionButton';
import { getEntityTableActionsColumn } from 'app/shared/util/utils';
import OncoKBTable from 'app/shared/table/OncoKBTable';
import { Column } from 'react-table';

export interface IGenomicIndicatorProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const GenomicIndicator = (props: IGenomicIndicatorProps) => {
  useEffect(() => {
    props.getEntities({});
  }, []);
  const columns: Column<IGenomicIndicator>[] = [
    { accessor: 'type', Header: 'Type' },
    { accessor: 'name', Header: 'Name' },
    getEntityTableActionsColumn(ENTITY_TYPE.GENOMIC_INDICATOR),
  ];

  return (
    <div>
      <h2 id="genomic-indicator-heading" data-cy="GenomicIndicatorHeading">
        Genomic Indicators
        <EntityActionButton
          className="ml-2"
          color="primary"
          entityType={ENTITY_TYPE.GENOMIC_INDICATOR}
          entityAction={ENTITY_ACTION.CREATE}
        />
      </h2>
      <div>
        {props.genomicIndicatorList && (
          <OncoKBTable columns={columns} data={props.genomicIndicatorList.concat()} loading={props.loading} showPagination />
        )}
      </div>
    </div>
  );
};

const mapStoreToProps = ({ genomicIndicatorStore }: IRootStore) => ({
  genomicIndicatorList: genomicIndicatorStore.entities,
  loading: genomicIndicatorStore.loading,
  getEntities: genomicIndicatorStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(GenomicIndicator);
