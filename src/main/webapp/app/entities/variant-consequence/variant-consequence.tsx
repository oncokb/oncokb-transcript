import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Col, Row, Table } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IVariantConsequence } from 'app/shared/model/variant-consequence.model';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

import { IRootStore } from 'app/stores';
export interface IVariantConsequenceProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const VariantConsequence = (props: IVariantConsequenceProps) => {
  const variantConsequenceList = props.variantConsequenceList;
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
      <h2 id="variant-consequence-heading" data-cy="VariantConsequenceHeading">
        Variant Consequences
        <div className="d-flex justify-content-end">
          <Button className="mr-2" color="info" onClick={handleSyncList} disabled={loading}>
            <FontAwesomeIcon icon="sync" spin={loading} /> Refresh List
          </Button>
          <Link to={`${match.url}/new`} className="btn btn-primary jh-create-entity" id="jh-create-entity" data-cy="entityCreateButton">
            <FontAwesomeIcon icon="plus" />
            &nbsp; Create new Variant Consequence
          </Link>
        </div>
      </h2>
      <div className="table-responsive">
        {variantConsequenceList && variantConsequenceList.length > 0 ? (
          <Table responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Term</th>
                <th>Is Generally Truncating</th>
                <th>Description</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {variantConsequenceList.map((variantConsequence, i) => (
                <tr key={`entity-${i}`} data-cy="entityTable">
                  <td>
                    <Button tag={Link} to={`${match.url}/${variantConsequence.id}`} color="link" size="sm">
                      {variantConsequence.id}
                    </Button>
                  </td>
                  <td>{variantConsequence.term}</td>
                  <td>{variantConsequence.isGenerallyTruncating ? 'true' : 'false'}</td>
                  <td>{variantConsequence.description}</td>
                  <td className="text-right">
                    <div className="btn-group flex-btn-group-container">
                      <Button tag={Link} to={`${match.url}/${variantConsequence.id}`} color="info" size="sm" data-cy="entityDetailsButton">
                        <FontAwesomeIcon icon="eye" /> <span className="d-none d-md-inline">View</span>
                      </Button>
                      <Button
                        tag={Link}
                        to={`${match.url}/${variantConsequence.id}/edit`}
                        color="primary"
                        size="sm"
                        data-cy="entityEditButton"
                      >
                        <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
                      </Button>
                      <Button
                        tag={Link}
                        to={`${match.url}/${variantConsequence.id}/delete`}
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
          !loading && <div className="alert alert-warning">No Variant Consequences found</div>
        )}
      </div>
    </div>
  );
};

const mapStoreToProps = ({ variantConsequenceStore }: IRootStore) => ({
  variantConsequenceList: variantConsequenceStore.entities,
  loading: variantConsequenceStore.loading,
  getEntities: variantConsequenceStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(VariantConsequence);
