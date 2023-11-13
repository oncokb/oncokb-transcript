import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';

import { ILevelOfEvidence } from 'app/shared/model/level-of-evidence.model';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants';

import { IRootStore } from 'app/stores';
import OncoKBTable, { SearchColumn } from 'app/shared/table/OncoKBTable';
import EntityActionButton from 'app/shared/button/EntityActionButton';
import { getEntityTableActionsColumn } from 'app/shared/util/utils';
export interface ILevelOfEvidenceProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const LevelOfEvidence = (props: ILevelOfEvidenceProps) => {
  useEffect(() => {
    props.getEntities({});
  }, []);

  const columns: SearchColumn<ILevelOfEvidence>[] = [
    { accessor: 'type', Header: 'Type' },
    { accessor: 'level', Header: 'Level' },
    getEntityTableActionsColumn(ENTITY_TYPE.LEVEL_OF_EVIDENCE),
  ];

  return (
    <div>
      <h2 id="level-of-evidence-heading" data-cy="LevelOfEvidenceHeading">
        Level Of Evidences
        <EntityActionButton
          className="ml-2"
          color="primary"
          entityType={ENTITY_TYPE.LEVEL_OF_EVIDENCE}
          entityAction={ENTITY_ACTION.CREATE}
        />
      </h2>
      {props.levelOfEvidenceList && <OncoKBTable data={props.levelOfEvidenceList.concat()} columns={columns} loading={props.loading} />}
    </div>
  );
};

const mapStoreToProps = ({ levelOfEvidenceStore }: IRootStore) => ({
  levelOfEvidenceList: levelOfEvidenceStore.entities,
  loading: levelOfEvidenceStore.loading,
  getEntities: levelOfEvidenceStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(LevelOfEvidence);
