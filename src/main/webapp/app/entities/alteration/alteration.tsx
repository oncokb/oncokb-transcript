import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Col, Row, Table } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IAlteration } from 'app/shared/model/alteration.model';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

import { IRootStore } from 'app/stores';
export interface IAlterationProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const Alteration = (props: IAlterationProps) => {
  const alterationList = props.alterationList;
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
      <h2 id="alteration-heading" data-cy="AlterationHeading">
        Alterations
        <div className="d-flex justify-content-end">
          <Button className="mr-2" color="info" onClick={handleSyncList} disabled={loading}>
            <FontAwesomeIcon icon="sync" spin={loading} /> Refresh List
          </Button>
          <Link to={`${match.url}/new`} className="btn btn-primary jh-create-entity" id="jh-create-entity" data-cy="entityCreateButton">
            <FontAwesomeIcon icon="plus" />
            &nbsp; Create new Alteration
          </Link>
        </div>
      </h2>
      <div className="table-responsive">
        {alterationList && alterationList.length > 0 ? (
          <Table responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Name</th>
                <th>Alteration</th>
                <th>Protein Start</th>
                <th>Protein End</th>
                <th>Ref Residues</th>
                <th>Variant Residues</th>
                <th>Consequence</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {alterationList.map((alteration, i) => (
                <tr key={`entity-${i}`} data-cy="entityTable">
                  <td>
                    <Button tag={Link} to={`${match.url}/${alteration.id}`} color="link" size="sm">
                      {alteration.id}
                    </Button>
                  </td>
                  <td>{alteration.type}</td>
                  <td>{alteration.name}</td>
                  <td>{alteration.alteration}</td>
                  <td>{alteration.proteinStart}</td>
                  <td>{alteration.proteinEnd}</td>
                  <td>{alteration.refResidues}</td>
                  <td>{alteration.variantResidues}</td>
                  <td>
                    {alteration.consequence ? (
                      <Link to={`variant-consequence/${alteration.consequence.id}`}>{alteration.consequence.id}</Link>
                    ) : (
                      ''
                    )}
                  </td>
                  <td className="text-right">
                    <div className="btn-group flex-btn-group-container">
                      <Button tag={Link} to={`${match.url}/${alteration.id}`} color="info" size="sm" data-cy="entityDetailsButton">
                        <FontAwesomeIcon icon="eye" /> <span className="d-none d-md-inline">View</span>
                      </Button>
                      <Button tag={Link} to={`${match.url}/${alteration.id}/edit`} color="primary" size="sm" data-cy="entityEditButton">
                        <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
                      </Button>
                      <Button tag={Link} to={`${match.url}/${alteration.id}/delete`} color="danger" size="sm" data-cy="entityDeleteButton">
                        <FontAwesomeIcon icon="trash" /> <span className="d-none d-md-inline">Delete</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          !loading && <div className="alert alert-warning">No Alterations found</div>
        )}
      </div>
    </div>
  );
};

const mapStoreToProps = ({ alterationStore }: IRootStore) => ({
  alterationList: alterationStore.entities,
  loading: alterationStore.loading,
  getEntities: alterationStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(Alteration);
