import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';

import { IGenomicIndicator } from 'app/shared/model/genomic-indicator.model';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';

import { IRootStore } from 'app/stores';
import EntityActionButton from 'app/shared/button/EntityActionButton';
import { filterByKeyword, getAlterationName, getEntityTableActionsColumn } from 'app/shared/util/utils';
import OncoKBTable, { SearchColumn } from 'app/shared/table/OncoKBTable';
import { IAssociation } from 'app/shared/model/association.model';
import { IAlleleState } from 'app/shared/model/allele-state.model';

export interface IGenomicIndicatorProps extends StoreProps, RouteComponentProps<{ url: string }> {}

const getAssociatedAlterations = (associations?: IAssociation[]) => {
  return (
    associations
      ?.map(association =>
        association.alterations?.map(alt => `${alt.genes?.map(gene => gene.hugoSymbol).join('-')} ${alt.alteration}`).join(),
      )
      .join() || ''
  );
};

const getAssociatedAlleleStates = (alleleStates?: IAlleleState[]) => {
  return alleleStates?.map(alleleState => alleleState.name).join();
};

export const GenomicIndicator = (props: IGenomicIndicatorProps) => {
  useEffect(() => {
    props.getEntities({});
  }, []);
  const columns: SearchColumn<IGenomicIndicator>[] = [
    { accessor: 'type', Header: 'Type' },
    {
      accessor: 'uuid',
      Header: 'UUID',
      onFilter: (data: IGenomicIndicator, keyword) => (data.uuid ? filterByKeyword(data.uuid, keyword) : false),
    },
    {
      accessor: 'name',
      Header: 'Name',
      onFilter: (data: IGenomicIndicator, keyword) => (data.name ? filterByKeyword(data.name, keyword) : false),
    },
    {
      Header: 'Associated Allele States',
      accessor: 'alleleStates',
      sortMethod(a, b) {
        return getAssociatedAlleleStates(a).localeCompare(getAssociatedAlleleStates(b));
      },
      Cell(cell: { original }): JSX.Element {
        return <span>{getAssociatedAlleleStates(cell.original.alleleStates)}</span>;
      },
      onFilter: (data: IGenomicIndicator, keyword) =>
        data.alleleStates ? filterByKeyword(getAssociatedAlleleStates(data.alleleStates), keyword) : false,
    },
    {
      Header: 'Associated Alterations',
      accessor: 'alterations',
      sortMethod(a, b) {
        return getAssociatedAlterations(a).localeCompare(getAssociatedAlterations(b));
      },
      Cell(cell: { original }): JSX.Element {
        return <span>{getAssociatedAlterations(cell.original.associations)}</span>;
      },
      onFilter: (data: IGenomicIndicator, keyword) =>
        data.associations ? filterByKeyword(getAssociatedAlterations(data.associations), keyword) : false,
    },
    getEntityTableActionsColumn(ENTITY_TYPE.GENOMIC_INDICATOR),
  ];

  return (
    <div>
      <h2 id="genomic-indicator-heading" data-cy="GenomicIndicatorHeading">
        Genomic Indicators
        <EntityActionButton className="ms-2" color="primary" entityType={ENTITY_TYPE.GENOMIC_INDICATOR} entityAction={ENTITY_ACTION.ADD} />
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
