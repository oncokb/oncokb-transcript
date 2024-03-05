import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { IDrug } from 'app/shared/model/drug.model';
import { IRootStore } from 'app/stores';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';
import EntityActionButton from 'app/shared/button/EntityActionButton';
import { filterByKeyword, getAlterationName, getEntityTableActionsColumn, getGeneNameFromAlteration } from 'app/shared/util/utils';
import OncoKBTable, { SearchColumn } from 'app/shared/table/OncoKBTable';
import { ITreatment } from 'app/shared/model/treatment.model';
import { IAlteration } from 'app/shared/model/alteration.model';
import _ from 'lodash';
import styles from './styles.module.scss';

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

  const getUniqueGenes = (treatments: ITreatment[]) => {
    const biomarkers: DrugAssocBiomarkers = {};
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
      accessor: 'treatments',
      Header: 'Associated Biomarker(s)',
      minWidth: 250,
      Cell(cell: { original: IDrug }) {
        const uniqueGenes = getUniqueGenes(cell.original.treatments || []);
        return (
          <>
            {Object.keys(uniqueGenes)
              .sort()
              .map((geneName, index) => {
                const alterations = _.uniqBy(uniqueGenes[geneName], 'id');
                return (
                  <>
                    <div>{getGeneAlterationText(geneName, alterations)}</div>
                    {index < Object.keys(uniqueGenes).length - 1 ? <div className={styles.horizontalDivider}></div> : undefined}
                  </>
                );
              })}
          </>
        );
      },
      onFilter: (data: IDrug, keyword) => filterByKeyword(getAllGeneAlterationTexts(getUniqueGenes(data.treatments || [])), keyword, true),
      sortMethod: (a: ITreatment[], b: ITreatment[]) =>
        getAllGeneAlterationTexts(getUniqueGenes(a || [])).localeCompare(getAllGeneAlterationTexts(getUniqueGenes(b || []))),
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
