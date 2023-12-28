import { FDA_SUBMISSION_TABLE_COLUMNS } from 'app/entities/fda-submission/constant';
import React from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { IRootStore } from 'app/stores';
import { Column } from 'react-table';
import _ from 'lodash';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants';
import EntityActionButton from 'app/shared/button/EntityActionButton';
import { IFdaSubmission } from 'app/shared/model/fda-submission.model';
import OncoKBAsyncTable, { PaginationState } from 'app/shared/table/OncoKBAsyncTable';
import { getEntityTableActionsColumn, getPaginationFromSearchParams } from 'app/shared/util/utils';

const defaultPaginationState: PaginationState<IFdaSubmission> = {
  order: 'asc',
  sort: 'deviceName',
  activePage: 1,
};

export interface IFdaSubmissionProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const FdaSubmission = (props: IFdaSubmissionProps) => {
  const fdaSubmissionList = props.fdaSubmissionList;

  return (
    <div>
      <h2 id="fda-submission-heading" data-cy="FdaSubmissionHeading">
        FDA Submissions
        <EntityActionButton className="ml-2" color="primary" entityType={ENTITY_TYPE.FDA_SUBMISSION} entityAction={ENTITY_ACTION.CREATE} />
      </h2>
      <div>
        {fdaSubmissionList && (
          <OncoKBAsyncTable
            data={fdaSubmissionList.concat()}
            columns={FDA_SUBMISSION_TABLE_COLUMNS}
            loading={props.loading}
            initialPaginationState={getPaginationFromSearchParams(props.location.search) || defaultPaginationState}
            searchEntities={props.searchEntities}
            getEntities={props.getEntities}
            totalItems={props.totalItems}
          />
        )}
      </div>
    </div>
  );
};

const mapStoreToProps = ({ fdaSubmissionStore }: IRootStore) => ({
  fdaSubmissionList: fdaSubmissionStore.entities,
  loading: fdaSubmissionStore.loading,
  totalItems: fdaSubmissionStore.totalItems,
  getEntities: fdaSubmissionStore.getEntities,
  searchEntities: fdaSubmissionStore.searchEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(FdaSubmission);
