import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Col, Row, Table } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { ICategoricalAlteration } from 'app/shared/model/categorical-alteration.model';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

import { IRootStore } from 'app/stores';
export interface ICategoricalAlterationProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const CategoricalAlteration = (props: ICategoricalAlterationProps) => {
  const categoricalAlterationList = props.categoricalAlterationList;
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
      <h2 id="categorical-alteration-heading" data-cy="CategoricalAlterationHeading">
        Categorical Alterations
        <div className="d-flex justify-content-end">
          <Button className="mr-2" color="info" onClick={handleSyncList} disabled={loading}>
            <FontAwesomeIcon icon="sync" spin={loading} /> Refresh List
          </Button>
          <Link to={`${match.url}/new`} className="btn btn-primary jh-create-entity" id="jh-create-entity" data-cy="entityCreateButton">
            <FontAwesomeIcon icon="plus" />
            &nbsp; Create new Categorical Alteration
          </Link>
        </div>
      </h2>
      <div className="table-responsive">
        {categoricalAlterationList && categoricalAlterationList.length > 0 ? (
          <Table responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Type</th>
                <th>Alteration Type</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {categoricalAlterationList.map((categoricalAlteration, i) => (
                <tr key={`entity-${i}`} data-cy="entityTable">
                  <td>
                    <Button tag={Link} to={`${match.url}/${categoricalAlteration.id}`} color="link" size="sm">
                      {categoricalAlteration.id}
                    </Button>
                  </td>
                  <td>{categoricalAlteration.name}</td>
                  <td>{categoricalAlteration.type}</td>
                  <td>{categoricalAlteration.alterationType}</td>
                  <td className="text-right">
                    <div className="btn-group flex-btn-group-container">
                      <Button
                        tag={Link}
                        to={`${match.url}/${categoricalAlteration.id}`}
                        color="info"
                        size="sm"
                        data-cy="entityDetailsButton"
                      >
                        <FontAwesomeIcon icon="eye" /> <span className="d-none d-md-inline">View</span>
                      </Button>
                      <Button
                        tag={Link}
                        to={`${match.url}/${categoricalAlteration.id}/edit`}
                        color="primary"
                        size="sm"
                        data-cy="entityEditButton"
                      >
                        <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
                      </Button>
                      <Button
                        tag={Link}
                        to={`${match.url}/${categoricalAlteration.id}/delete`}
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
          !loading && <div className="alert alert-warning">No Categorical Alterations found</div>
        )}
      </div>
    </div>
  );
};

const mapStoreToProps = ({ categoricalAlterationStore }: IRootStore) => ({
  categoricalAlterationList: categoricalAlterationStore.entities,
  loading: categoricalAlterationStore.loading,
  getEntities: categoricalAlterationStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(CategoricalAlteration);
