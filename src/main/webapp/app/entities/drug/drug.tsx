import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { IDrug } from 'app/shared/model/drug.model';
import { IRootStore } from 'app/stores';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';
import EntityActionButton from 'app/shared/button/EntityActionButton';
import { filterByKeyword, getAlterationName, getEntityTableActionsColumn, getGeneNameFromAlteration } from 'app/shared/util/utils';
import OncoKBTable, { SearchColumn } from 'app/shared/table/OncoKBTable';
import { IAlteration } from 'app/shared/model/alteration.model';
import _ from 'lodash';
import * as styles from './styles.module.scss';
import { IAssociation } from 'app/shared/model/association.model';

export interface IDrugProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export type DrugAssocBiomarkers = {
  [key: string]: IAlteration[];
};

const getGeneAlterationText = (geneName: string, alterations: IAlteration[]) => {
  return `${geneName} ${getAlterationName(alterations)}`;
};

const getAllGeneAlterationTexts = (biomarkers: DrugAssocBiomarkers) => {
  return Object.keys(biomarkers)
    .sort()
    .map(geneName => {
      return getGeneAlterationText(geneName, biomarkers[geneName]);
    })
    .join(', ');
};

export const Drug = (props: IDrugProps) => {
  useEffect(() => {
    props.getEntities({});
  }, []);

  const drugList = props.drugList;

  const getUniqueGenes = (associations: IAssociation[]) => {
    const biomarkers: DrugAssocBiomarkers = {};
    associations?.forEach(val => {
      for (const alteration of val?.alterations ?? []) {
        const geneName = getGeneNameFromAlteration(alteration);
        if (geneName) {
          if (geneName in biomarkers) {
            biomarkers[geneName].push(alteration);
          } else {
            biomarkers[geneName] = [alteration];
          }
        }
      }
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
      accessor: 'associations',
      Header: 'Associated Biomarker(s)',
      minWidth: 250,
      Cell(cell: { original: IDrug }) {
        const uniqueGenes = getUniqueGenes(cell.original.associations || []);
        return (
          <>
            {Object.keys(uniqueGenes)
              .sort()
              .map(geneName => {
                const alterations = _.uniqBy(uniqueGenes[geneName], 'id');
                return (
                  <div key={geneName} className={styles.biomarkersContainer}>
                    <div>{getGeneAlterationText(geneName, alterations)}</div>
                    <div className={styles.horizontalDivider}></div>
                  </div>
                );
              })}
          </>
        );
      },
      onFilter: (data: IDrug, keyword) =>
        filterByKeyword(getAllGeneAlterationTexts(getUniqueGenes(data.associations || [])), keyword, true),
      sortMethod: (a: IAssociation[], b: IAssociation[]) =>
        getAllGeneAlterationTexts(getUniqueGenes(a || [])).localeCompare(getAllGeneAlterationTexts(getUniqueGenes(b || []))),
    },
    getEntityTableActionsColumn(ENTITY_TYPE.DRUG),
  ];

  return (
    <div>
      <h2 id="drug-heading" data-cy="DrugHeading">
        Drugs
        <EntityActionButton className="ms-2" color="primary" entityType={ENTITY_TYPE.DRUG} entityAction={ENTITY_ACTION.ADD} />
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

export default connect<IDrugProps, StoreProps>(mapStoreToProps)(Drug);
