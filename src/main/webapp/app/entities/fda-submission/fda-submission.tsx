import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Col, Row, Table } from 'reactstrap';
import { byteSize, Translate, TextFormat, getSortState, JhiPagination, JhiItemCount } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IFdaSubmission } from 'app/shared/model/fda-submission.model';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/shared/util/pagination.constants';
import { overridePaginationStateWithQueryParams } from 'app/shared/util/entity-utils';

import { IRootStore } from 'app/stores';
export interface IFdaSubmissionProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const FdaSubmission = (props: IFdaSubmissionProps) => {
  const [paginationState, setPaginationState] = useState(
    overridePaginationStateWithQueryParams(getSortState(props.location, ITEMS_PER_PAGE, 'id'), props.location.search)
  );

  const fdaSubmissionList = props.fdaSubmissionList;
  const loading = props.loading;
  const totalItems = props.totalItems;

  const getAllEntities = () => {
    props.getEntities({
      page: paginationState.activePage - 1,
      size: paginationState.itemsPerPage,
      sort: `${paginationState.sort},${paginationState.order}`,
    });
  };

  const sortEntities = () => {
    getAllEntities();
    const endURL = `?page=${paginationState.activePage}&sort=${paginationState.sort},${paginationState.order}`;
    if (props.location.search !== endURL) {
      props.history.push(`${props.location.pathname}${endURL}`);
    }
  };

  useEffect(() => {
    sortEntities();
  }, [paginationState.activePage, paginationState.order, paginationState.sort]);

  useEffect(() => {
    const params = new URLSearchParams(props.location.search);
    const page = params.get('page');
    const sort = params.get(SORT);
    if (page && sort) {
      const sortSplit = sort.split(',');
      setPaginationState({
        ...paginationState,
        activePage: +page,
        sort: sortSplit[0],
        order: sortSplit[1],
      });
    }
  }, [props.location.search]);

  const sort = p => () => {
    setPaginationState({
      ...paginationState,
      order: paginationState.order === ASC ? DESC : ASC,
      sort: p,
    });
  };

  const handlePagination = currentPage =>
    setPaginationState({
      ...paginationState,
      activePage: currentPage,
    });

  const handleSyncList = () => {
    sortEntities();
  };

  const { match } = props;

  return (
    <div>
      <h2 id="fda-submission-heading" data-cy="FdaSubmissionHeading">
        Fda Submissions
        <div className="d-flex justify-content-end">
          <Button className="mr-2" color="info" onClick={handleSyncList} disabled={loading}>
            <FontAwesomeIcon icon="sync" spin={loading} /> Refresh List
          </Button>
          <Link to={`${match.url}/new`} className="btn btn-primary jh-create-entity" id="jh-create-entity" data-cy="entityCreateButton">
            <FontAwesomeIcon icon="plus" />
            &nbsp; Create new Fda Submission
          </Link>
        </div>
      </h2>
      <div className="table-responsive">
        {fdaSubmissionList && fdaSubmissionList.length > 0 ? (
          <Table responsive>
            <thead>
              <tr>
                <th className="hand" onClick={sort('id')}>
                  ID <FontAwesomeIcon icon="sort" />
                </th>
                <th className="hand" onClick={sort('number')}>
                  Number <FontAwesomeIcon icon="sort" />
                </th>
                <th className="hand" onClick={sort('supplementNumber')}>
                  Supplement Number <FontAwesomeIcon icon="sort" />
                </th>
                <th className="hand" onClick={sort('deviceName')}>
                  Device Name <FontAwesomeIcon icon="sort" />
                </th>
                <th className="hand" onClick={sort('genericName')}>
                  Generic Name <FontAwesomeIcon icon="sort" />
                </th>
                <th className="hand" onClick={sort('dateReceived')}>
                  Date Received <FontAwesomeIcon icon="sort" />
                </th>
                <th className="hand" onClick={sort('decisionDate')}>
                  Decision Date <FontAwesomeIcon icon="sort" />
                </th>
                <th className="hand" onClick={sort('description')}>
                  Description <FontAwesomeIcon icon="sort" />
                </th>
                <th>
                  Companion Diagnostic Device <FontAwesomeIcon icon="sort" />
                </th>
                <th>
                  Type <FontAwesomeIcon icon="sort" />
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {fdaSubmissionList.map((fdaSubmission, i) => (
                <tr key={`entity-${i}`} data-cy="entityTable">
                  <td>
                    <Button tag={Link} to={`${match.url}/${fdaSubmission.id}`} color="link" size="sm">
                      {fdaSubmission.id}
                    </Button>
                  </td>
                  <td>{fdaSubmission.number}</td>
                  <td>{fdaSubmission.supplementNumber}</td>
                  <td>{fdaSubmission.deviceName}</td>
                  <td>{fdaSubmission.genericName}</td>
                  <td>
                    {fdaSubmission.dateReceived ? (
                      <TextFormat type="date" value={fdaSubmission.dateReceived} format={APP_DATE_FORMAT} />
                    ) : null}
                  </td>
                  <td>
                    {fdaSubmission.decisionDate ? (
                      <TextFormat type="date" value={fdaSubmission.decisionDate} format={APP_DATE_FORMAT} />
                    ) : null}
                  </td>
                  <td>{fdaSubmission.description}</td>
                  <td>
                    {fdaSubmission.companionDiagnosticDevice ? (
                      <Link to={`companion-diagnostic-device/${fdaSubmission.companionDiagnosticDevice.id}`}>
                        {fdaSubmission.companionDiagnosticDevice.id}
                      </Link>
                    ) : (
                      ''
                    )}
                  </td>
                  <td>
                    {fdaSubmission.type ? <Link to={`fda-submission-type/${fdaSubmission.type.id}`}>{fdaSubmission.type.id}</Link> : ''}
                  </td>
                  <td className="text-right">
                    <div className="btn-group flex-btn-group-container">
                      <Button tag={Link} to={`${match.url}/${fdaSubmission.id}`} color="info" size="sm" data-cy="entityDetailsButton">
                        <FontAwesomeIcon icon="eye" /> <span className="d-none d-md-inline">View</span>
                      </Button>
                      <Button
                        tag={Link}
                        to={`${match.url}/${fdaSubmission.id}/edit?page=${paginationState.activePage}&sort=${paginationState.sort},${paginationState.order}`}
                        color="primary"
                        size="sm"
                        data-cy="entityEditButton"
                      >
                        <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
                      </Button>
                      <Button
                        tag={Link}
                        to={`${match.url}/${fdaSubmission.id}/delete?page=${paginationState.activePage}&sort=${paginationState.sort},${paginationState.order}`}
                        color="danger"
                        size="sm"
                        data-cy="entityDeleteButton"
                      >
                        <FontAwesomeIcon icon="trash" /> <span className="d-none d-md-inline">Delete</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          !loading && <div className="alert alert-warning">No Fda Submissions found</div>
        )}
      </div>
      {totalItems ? (
        <div className={fdaSubmissionList && fdaSubmissionList.length > 0 ? '' : 'd-none'}>
          <Row className="justify-content-center">
            <JhiItemCount page={paginationState.activePage} total={totalItems} itemsPerPage={paginationState.itemsPerPage} />
          </Row>
          <Row className="justify-content-center">
            <JhiPagination
              activePage={paginationState.activePage}
              onSelect={handlePagination}
              maxButtons={5}
              itemsPerPage={paginationState.itemsPerPage}
              totalItems={totalItems}
            />
          </Row>
        </div>
      ) : (
        ''
      )}
    </div>
  );
};

const mapStoreToProps = ({ fdaSubmissionStore }: IRootStore) => ({
  fdaSubmissionList: fdaSubmissionStore.entities,
  loading: fdaSubmissionStore.loading,
  totalItems: fdaSubmissionStore.totalItems,
  getEntities: fdaSubmissionStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(FdaSubmission);
