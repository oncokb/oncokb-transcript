import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';

import { ISeqRegion } from 'app/shared/model/seq-region.model';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT, ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';

import { IRootStore } from 'app/stores';
import EntityActionButton from 'app/shared/button/EntityActionButton';
import OncoKBTable, { SearchColumn } from 'app/shared/table/OncoKBTable';
import { filterByKeyword, getEntityTableActionsColumn } from 'app/shared/util/utils';
import { ICompanionDiagnosticDevice } from 'app/shared/model/companion-diagnostic-device.model';
export interface ISeqRegionProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const SeqRegion = (props: ISeqRegionProps) => {
  useEffect(() => {
    props.getEntities({});
  }, []);

  const columns: SearchColumn<ISeqRegion>[] = [
    {
      accessor: 'name',
      Header: 'Name',
      onFilter: (data: ISeqRegion, keyword) => (data.name ? filterByKeyword(data.name, keyword) : false),
    },
    {
      accessor: 'chromosome',
      Header: 'Chromosome',
      onFilter: (data: ISeqRegion, keyword) => (data.chromosome ? filterByKeyword(data.chromosome, keyword) : false),
    },
    {
      accessor: 'description',
      Header: 'Description',
      onFilter: (data: ISeqRegion, keyword) => (data.description ? filterByKeyword(data.description, keyword) : false),
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
