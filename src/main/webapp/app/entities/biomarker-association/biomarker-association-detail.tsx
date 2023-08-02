import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import {} from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootStore } from 'app/stores';
import { getFdaSubmissionLinks } from '../companion-diagnostic-device/companion-diagnostic-device';
export interface IBiomarkerAssociationDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const BiomarkerAssociationDetail = (props: IBiomarkerAssociationDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const biomarkerAssociationEntity = props.biomarkerAssociationEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="biomarkerAssociationDetailsHeading">BiomarkerAssociation</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{biomarkerAssociationEntity.id}</dd>
          <dt>Fda Submission</dt>
          <dd>{biomarkerAssociationEntity.fdaSubmissions ? getFdaSubmissionLinks(biomarkerAssociationEntity.fdaSubmissions) : ''}</dd>
          <dt>Alterations</dt>
          <dd>
            {biomarkerAssociationEntity.alterations
              ? biomarkerAssociationEntity.alterations.map((val, i) => (
                  <span key={val.id}>
                    <Link to={`/alteration/${val.id}`}>{val.name}</Link>
                    {biomarkerAssociationEntity.alterations && i === biomarkerAssociationEntity.alterations.length - 1 ? '' : ', '}
                  </span>
                ))
              : null}
          </dd>
          <dt>Cancer Type</dt>
          <dd>{biomarkerAssociationEntity.cancerType ? biomarkerAssociationEntity.cancerType.id : ''}</dd>
          <dt>Drugs</dt>
          <dd>
            {biomarkerAssociationEntity.drugs
              ? biomarkerAssociationEntity.drugs.map((val, i) => (
                  <span key={val.id}>
                    <Link to={`/drug/${val.id}`}>{val.name}</Link>
                    {biomarkerAssociationEntity.drugs && i === biomarkerAssociationEntity.drugs.length - 1 ? '' : ' + '}
                  </span>
                ))
              : null}
          </dd>
        </dl>
        <Button tag={Link} to={`/biomarker-association/${biomarkerAssociationEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ biomarkerAssociationStore }: IRootStore) => ({
  biomarkerAssociationEntity: biomarkerAssociationStore.entity,
  getEntity: biomarkerAssociationStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(BiomarkerAssociationDetail);
