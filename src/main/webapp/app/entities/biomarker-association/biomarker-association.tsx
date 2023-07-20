import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Col, Row, Table } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IBiomarkerAssociation } from 'app/shared/model/biomarker-association.model';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

import { IRootStore } from 'app/stores';
import { getFdaSubmissionLinks } from '../companion-diagnostic-device/companion-diagnostic-device';
export interface IBiomarkerAssociationProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const BiomarkerAssociation = (props: IBiomarkerAssociationProps) => {
  const biomarkerAssociationList = props.biomarkerAssociationList;
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
      <h2 id="biomarker-association-heading" data-cy="BiomarkerAssociationHeading">
        Biomarker Associations
        <div className="d-flex justify-content-end">
          <Button className="mr-2" color="info" onClick={handleSyncList} disabled={loading}>
            <FontAwesomeIcon icon="sync" spin={loading} /> Refresh List
          </Button>
          <Link to={`${match.url}/new`} className="btn btn-primary jh-create-entity" id="jh-create-entity" data-cy="entityCreateButton">
            <FontAwesomeIcon icon="plus" />
            &nbsp; Create new Biomarker Association
          </Link>
        </div>
      </h2>
      <div className="table-responsive">
        {biomarkerAssociationList && biomarkerAssociationList.length > 0 ? (
          <Table responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Fda Submission</th>
                <th>Alteration</th>
                <th>Cancer Type</th>
                <th>Drug</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {biomarkerAssociationList.map((biomarkerAssociation, i) => (
                <tr key={`entity-${i}`} data-cy="entityTable">
                  <td>
                    <Button tag={Link} to={`${match.url}/${biomarkerAssociation.id}`} color="link" size="sm">
                      {biomarkerAssociation.id}
                    </Button>
                  </td>
                  <td>{biomarkerAssociation.fdaSubmissions ? getFdaSubmissionLinks(biomarkerAssociation.fdaSubmissions) : ''}</td>
                  <td>
                    {biomarkerAssociation.cancerType ? (
                      <Link to={`cancer-type/${biomarkerAssociation.cancerType.id}`}>{biomarkerAssociation.cancerType.id}</Link>
                    ) : (
                      ''
                    )}
                  </td>
                  <td className="text-right">
                    <div className="btn-group flex-btn-group-container">
                      <Button
                        tag={Link}
                        to={`${match.url}/${biomarkerAssociation.id}`}
                        color="info"
                        size="sm"
                        data-cy="entityDetailsButton"
                      >
                        <FontAwesomeIcon icon="eye" /> <span className="d-none d-md-inline">View</span>
                      </Button>
                      <Button
                        tag={Link}
                        to={`${match.url}/${biomarkerAssociation.id}/edit`}
                        color="primary"
                        size="sm"
                        data-cy="entityEditButton"
                      >
                        <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
                      </Button>
                      <Button
                        tag={Link}
                        to={`${match.url}/${biomarkerAssociation.id}/delete`}
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
          !loading && <div className="alert alert-warning">No Biomarker Associations found</div>
        )}
      </div>
    </div>
  );
};

const mapStoreToProps = ({ biomarkerAssociationStore }: IRootStore) => ({
  biomarkerAssociationList: biomarkerAssociationStore.entities,
  loading: biomarkerAssociationStore.loading,
  getEntities: biomarkerAssociationStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(BiomarkerAssociation);
