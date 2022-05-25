import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Table } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
export interface IConsequenceProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const Consequence = (props: IConsequenceProps) => {
  const consequenceList = props.consequenceList;
  const loading = props.loading;

  useEffect(() => {
    props.getEntities({});
  }, []);

  const handleSyncList = () => {
    props.getEntities({});
  };

  const { match } = props;

  return (
    <div>
      <h2 id="consequence-heading" data-cy="ConsequenceHeading">
        Consequences
        <div className="d-flex justify-content-end">
          <Button className="mr-2" color="info" onClick={handleSyncList} disabled={loading}>
            <FontAwesomeIcon icon="sync" spin={loading} /> Refresh List
          </Button>
          <Link to={`${match.url}/new`} className="btn btn-primary jh-create-entity" id="jh-create-entity" data-cy="entityCreateButton">
            <FontAwesomeIcon icon="plus" />
            &nbsp; Create new Consequence
          </Link>
        </div>
      </h2>
      <div className="table-responsive">
        {consequenceList && consequenceList.length > 0 ? (
          <Table responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Term</th>
                <th>Name</th>
                <th>Is Generally Truncating</th>
                <th>Description</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {consequenceList.map((consequence, i) => (
                <tr key={`entity-${i}`} data-cy="entityTable">
                  <td>
                    <Button tag={Link} to={`${match.url}/${consequence.id}`} color="link" size="sm">
                      {consequence.id}
                    </Button>
                  </td>
                  <td>{consequence.type}</td>
                  <td>{consequence.term}</td>
                  <td>{consequence.name}</td>
                  <td>{consequence.isGenerallyTruncating ? 'true' : 'false'}</td>
                  <td>{consequence.description}</td>
                  <td className="text-right">
                    <div className="btn-group flex-btn-group-container">
                      <Button tag={Link} to={`${match.url}/${consequence.id}`} color="info" size="sm" data-cy="entityDetailsButton">
                        <FontAwesomeIcon icon="eye" /> <span className="d-none d-md-inline">View</span>
                      </Button>
                      <Button tag={Link} to={`${match.url}/${consequence.id}/edit`} color="primary" size="sm" data-cy="entityEditButton">
                        <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
                      </Button>
                      <Button tag={Link} to={`${match.url}/${consequence.id}/delete`} color="danger" size="sm" data-cy="entityDeleteButton">
                        <FontAwesomeIcon icon="trash" /> <span className="d-none d-md-inline">Delete</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          !loading && <div className="alert alert-warning">No Consequences found</div>
        )}
      </div>
    </div>
  );
};

const mapStoreToProps = ({ consequenceStore }: IRootStore) => ({
  consequenceList: consequenceStore.entities,
  loading: consequenceStore.loading,
  searchEntities: consequenceStore.searchEntities,
  getEntities: consequenceStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(Consequence);
