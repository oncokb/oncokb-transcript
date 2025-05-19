import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';

import { ISeqRegion } from 'app/shared/model/seq-region.model';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';

import { IRootStore } from 'app/stores';
import EntityActionButton from 'app/shared/button/EntityActionButton';
import OncoKBTable, { FilterableColumn } from 'app/shared/table/OncoKBTable';
import { filterByKeyword, getEntityTableActionsColumn } from 'app/shared/util/utils';
export interface ISeqRegionProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const SeqRegion = (props: ISeqRegionProps) => {
  useEffect(() => {
    props.getEntities({});
  }, []);

  const columns: FilterableColumn<ISeqRegion>[] = [
    {
      accessor: 'name',
      Header: 'Name',
      onSearchFilter: (data: ISeqRegion, keyword) => filterByKeyword(data.name, keyword),
    },
    {
      accessor: 'chromosome',
      Header: 'Chromosome',
      onSearchFilter: (data: ISeqRegion, keyword) => (data.chromosome ? filterByKeyword(data.chromosome, keyword) : false),
    },
    {
      accessor: 'description',
      Header: 'Description',
      onSearchFilter: (data: ISeqRegion, keyword) => (data.description ? filterByKeyword(data.description, keyword) : false),
    },
    getEntityTableActionsColumn(ENTITY_TYPE.SEQ_REGION),
  ];

  return (
    <div>
      <h2 id="seq-region-heading" data-cy="SeqRegionHeading">
        Seq Regions
        <EntityActionButton className="ms-2" color="primary" entityType={ENTITY_TYPE.SEQ_REGION} entityAction={ENTITY_ACTION.ADD} />
      </h2>
      <div>
        {props.seqRegionList && (
          <OncoKBTable data={props.seqRegionList.concat()} columns={columns} loading={props.loading} showPagination />
        )}
      </div>
    </div>
  );
};

const mapStoreToProps = ({ seqRegionStore }: IRootStore) => ({
  seqRegionList: seqRegionStore.entities,
  loading: seqRegionStore.loading,
  getEntities: seqRegionStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(SeqRegion);
