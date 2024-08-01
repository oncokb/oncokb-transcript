import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';

import { IFdaSubmissionType } from 'app/shared/model/fda-submission-type.model';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';

import { IRootStore } from 'app/stores';
import { getEntityTableActionsColumn } from 'app/shared/util/utils';
import OncoKBTable, { SearchColumn } from 'app/shared/table/OncoKBTable';
import EntityActionButton from 'app/shared/button/EntityActionButton';

export interface IFdaSubmissionTypeProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const FdaSubmissionType = (props: IFdaSubmissionTypeProps) => {
  useEffect(() => {
    props.getEntities({});
  }, []);

  const columns: SearchColumn<IFdaSubmissionType>[] = [
    { accessor: 'type', Header: 'Type' },
    { accessor: 'name', Header: 'Name' },
    { accessor: 'shortName', Header: 'Short Name' },
    { accessor: 'submissionPrefix', Header: 'Submission Prefix' },
    { accessor: 'submissionLink', Header: 'Submission Link' },
    getEntityTableActionsColumn(ENTITY_TYPE.FDA_SUBMISSION_TYPE),
  ];

  return (
    <div>
      <h2 id="fda-submission-type-heading" data-cy="FdaSubmissionTypeHeading">
        FDA Submission Types
        <EntityActionButton
          className="ms-2"
          color="primary"
          entityType={ENTITY_TYPE.FDA_SUBMISSION_TYPE}
          entityAction={ENTITY_ACTION.ADD}
        />
      </h2>
      <div>
        {props.fdaSubmissionTypeList && (
          <OncoKBTable data={props.fdaSubmissionTypeList.concat()} columns={columns} loading={props.loading} />
        )}
      </div>
    </div>
  );
};

const mapStoreToProps = ({ fdaSubmissionTypeStore }: IRootStore) => ({
  fdaSubmissionTypeList: fdaSubmissionTypeStore.entities,
  loading: fdaSubmissionTypeStore.loading,
  getEntities: fdaSubmissionTypeStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(FdaSubmissionType);
