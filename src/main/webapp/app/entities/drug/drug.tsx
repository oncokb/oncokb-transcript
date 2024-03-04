import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { IDrug } from 'app/shared/model/drug.model';
import { IRootStore } from 'app/stores';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';
import EntityActionButton from 'app/shared/button/EntityActionButton';
import {
  filterByKeyword,
  getAlterationName,
  getEntityTableActionsColumn,
  getGeneNameFromAlteration,
  getGeneNamesFromAlterations,
} from 'app/shared/util/utils';
import OncoKBTable, { SearchColumn } from 'app/shared/table/OncoKBTable';
import { ITreatment } from 'app/shared/model/treatment.model';
import { IAlteration } from 'app/shared/model/alteration.model';
import { IGene } from 'app/shared/model/gene.model';
import _ from 'lodash';
import Tooltip from 'rc-tooltip';
import WithSeparator from 'react-with-separator';

export interface IDrugProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const Drug = (props: IDrugProps) => {
  useEffect(() => {
    props.getEntities({});
  }, []);

  const drugList = props.drugList;

  const getUniqueGenes = (treatments: ITreatment[]) => {
    const biomarkers: { [key: string]: IAlteration[] } = {};
    treatments.forEach(treatment => {
      treatment.associations?.forEach(val => {
        for (const alteration of val.alterations) {
          const geneName = getGeneNameFromAlteration(alteration);
          if (geneName in biomarkers) {
            biomarkers[geneName].push(alteration);
          } else {
            biomarkers[geneName] = [alteration];
          }
        }
      });
    });
    return biomarkers;
  };

  const columns: SearchColumn<IDrug>[] = [
    {
      accessor: 'uuid',
      Header: 'UUID',
      onFilter: (data: IDrug, keyword) => filterByKeyword(data.uuid, keyword),
    },
    {
      accessor: 'name',
      Header: 'Name',
      onFilter: (data: IDrug, keyword) => filterByKeyword(data.name, keyword),
    },
    {
      id: 'code',
      Header: 'Code',
      Cell(cell: { original }): JSX.Element {
        return cell.original.nciThesaurus ? cell.original.nciThesaurus.code : '';
      },
      onFilter: (data: IDrug, keyword) => filterByKeyword(data.nciThesaurus?.code || '', keyword),
    },
    {
      id: 'genes',
      Header: 'Associated Gene(s)',
      Cell(cell: { original: IDrug }) {
        const uniqueGenes = getUniqueGenes(cell.original.treatments || []);
        return (
          <WithSeparator separator={', '}>
            {Object.keys(uniqueGenes)
              .sort()
              .map(geneName => {
                const alterations = _.uniqBy(uniqueGenes[geneName], 'id');
                return (
                  <Tooltip
                    placement="top"
                    overlay={
                      <>
                        <span>{alterations.length} alteration(s): </span>
                        <span>{getAlterationName(alterations)}</span>
                      </>
                    }
                  >
                    <span>{geneName}</span>
                  </Tooltip>
                );
              })}
          </WithSeparator>
        );
      },
      onFilter: (data: IDrug, keyword) =>
        filterByKeyword(
          Object.keys(getUniqueGenes(data.treatments || []))
            .sort()
            .join(', '),
          keyword
        ),
      sortable: false,
    },
    getEntityTableActionsColumn(ENTITY_TYPE.DRUG),
  ];

  return (
    <div>
      <h2 id="drug-heading" data-cy="DrugHeading">
        Drugs
        <EntityActionButton className="ml-2" color="primary" entityType={ENTITY_TYPE.DRUG} entityAction={ENTITY_ACTION.ADD} />
      </h2>
      <div>{drugList && <OncoKBTable data={props.drugList.concat()} columns={columns} loading={props.loading} showPagination />}</div>
    </div>
  );
};

const mapStoreToProps = ({ drugStore }: IRootStore) => ({
  drugList: drugStore.entities,
  loading: drugStore.loading,
  totalItems: drugStore.totalItems,
  getEntities: drugStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(Drug);
