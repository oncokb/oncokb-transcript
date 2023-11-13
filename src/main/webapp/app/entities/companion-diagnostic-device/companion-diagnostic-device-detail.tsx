import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Row, Col } from 'reactstrap';
import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, ENTITY_ACTION, ENTITY_TYPE, PAGE_ROUTE } from 'app/config/constants';
import WithSeparator from 'react-with-separator';
import EntityActionButton from 'app/shared/button/EntityActionButton';
import CdxBiomarkerAssociationTable from 'app/shared/table/CdxBiomarkerAssociationTable';
import { TextFormat } from 'react-jhipster';
import _ from 'lodash';
export interface ICompanionDiagnosticDeviceDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const CompanionDiagnosticDeviceDetail = (props: ICompanionDiagnosticDeviceDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const companionDiagnosticDeviceEntity = props.companionDiagnosticDeviceEntity;
  const biomarkerAssociations = _.uniq(
    (companionDiagnosticDeviceEntity.fdaSubmissions || []).reduce((acc, fdaSubmission) => {
      fdaSubmission.associations.map(ass => {
        ass.fdaSubmissions = [fdaSubmission];
        return acc;
      });
      acc.push(...fdaSubmission.associations);
      return acc;
    }, [])
  );

  return (
    <>
      <Row>
        <Col md="8">
          <h2>
            Companion Diagnostic Device
            <EntityActionButton
              className="ml-2"
              color="primary"
              entityId={companionDiagnosticDeviceEntity.id}
              entityType={ENTITY_TYPE.COMPANION_DIAGNOSTIC_DEVICE}
              entityAction={ENTITY_ACTION.EDIT}
            />
          </h2>
          <div className="mt-4">
            <h4>CDx Details</h4>
            <dt>
              <span id="id">ID</span>
            </dt>
            <dd>{companionDiagnosticDeviceEntity.id}</dd>
            <dt>
              <span id="name">Name</span>
            </dt>
            <dd>{companionDiagnosticDeviceEntity.name}</dd>
            <dt>
              <span id="manufacturer">Manufacturer</span>
            </dt>
            <dd>{companionDiagnosticDeviceEntity.manufacturer}</dd>
            <dt>
              <span id="indicationDetails">Indication Details</span>
            </dt>
            <dd>{companionDiagnosticDeviceEntity.indicationDetails}</dd>
            <dt>
              <span id="platformType">Platform Type</span>
            </dt>
            <dd>{companionDiagnosticDeviceEntity.platformType}</dd>
            <dt>
              <span id="platformType">Last Updated</span>
            </dt>
            <dd>
              <TextFormat value={companionDiagnosticDeviceEntity.lastUpdated} type="date" format={APP_DATE_FORMAT} />
            </dd>
            <dt>Specimen Type</dt>
            <dd>
              <WithSeparator separator={', '}>
                {(companionDiagnosticDeviceEntity.specimenTypes || []).map((val, i) => (
                  <Link to={`${PAGE_ROUTE.SPECIMEN_TYPE}/${val.id}`} key={val.type}>
                    {`${val.name}(${val.type})`}
                  </Link>
                ))}
              </WithSeparator>
            </dd>
          </div>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <CdxBiomarkerAssociationTable biomarkerAssociations={biomarkerAssociations} />
        </Col>
      </Row>
    </>
  );
};

const mapStoreToProps = ({ companionDiagnosticDeviceStore }: IRootStore) => ({
  companionDiagnosticDeviceEntity: companionDiagnosticDeviceStore.entity,
  getEntity: companionDiagnosticDeviceStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(CompanionDiagnosticDeviceDetail);
