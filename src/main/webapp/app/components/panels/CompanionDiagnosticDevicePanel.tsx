import React, { useEffect, useState } from 'react';
import { Menu } from 'react-pro-sidebar';
import { Button, Container, Form } from 'reactstrap';
import { ENTITY_ACTION, ENTITY_TYPE, SearchOptionType } from 'app/config/constants/constants';
import { useHistory, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';
import DefaultTooltip from 'app/shared/tooltip/DefaultTooltip';
import CancerTypeSelect, { CancerTypeSelectOption } from 'app/shared/select/CancerTypeSelect';
import { SaveButton } from 'app/shared/button/SaveButton';
import GeneSelect, { GeneSelectOption } from 'app/shared/select/GeneSelect';
import AlterationSelect, { AlterationSelectOption } from 'app/shared/select/AlterationSelect';
import DrugSelect, { DrugSelectOption } from 'app/shared/select/DrugSelect';
import FdaSubmissionSelect, { FdaSubmissionSelectOption } from 'app/shared/select/FdaSubmissionSelect';
import { getEntityActionRoute } from 'app/shared/util/RouteUtils';
import { Alteration, Association, CancerType, Drug, FdaSubmission } from 'app/shared/api/generated/curation';
import { associationClient } from 'app/shared/api/clients';
import { notifyError, notifySuccess } from 'app/oncokb-commons/components/util/NotificationUtils';
import { IRootStore } from 'app/stores';
import { connect } from 'app/shared/util/typed-inject';

const SidebarMenuItem: React.FunctionComponent<{ style?: React.CSSProperties; children: React.ReactNode }> = ({ style, children }) => {
  return <div style={{ padding: '0.5rem 1rem', ...style }}>{children}</div>;
};

export const defaultAdditional = {
  page: 1,
  type: SearchOptionType.GENE,
};

const CompanionDiagnosticDevicePanel: React.FunctionComponent<StoreProps> = ({ getEntity }: StoreProps) => {
  const [geneValue, setGeneValue] = useState<GeneSelectOption | null>(null);
  const [alterationValue, onAlterationChange] = useState<readonly AlterationSelectOption[]>();
  const [cancerTypeValue, onCancerTypeChange] = useState<CancerTypeSelectOption | null>(null);
  const [drugValue, onDrugChange] = useState<readonly DrugSelectOption[]>([]);
  const [fdaSubmissionValue, onFdaSubmissionChange] = useState<readonly FdaSubmissionSelectOption[]>([]);

  const history = useHistory();
  const location = useLocation();
  const id = parseInt(location.pathname.split('/')[2], 10);

  useEffect(() => {
    if (geneValue === null) {
      onAlterationChange([]);
    }
  }, [geneValue]);

  const resetValues = () => {
    onAlterationChange([]);
    setGeneValue(null);
    onCancerTypeChange(null);
    onDrugChange([]);
    onFdaSubmissionChange([]);
  };

  const createBiomarkerAssociation = (e: any) => {
    e.preventDefault();
    const association: Association = {
      fdaSubmissions: fdaSubmissionValue?.map((fdaSubmission): FdaSubmission => {
        return {
          id: fdaSubmission.value,
          number: '',
          curated: false,
          genetic: false,
          deviceName: '',
          supplementNumber: '',
        };
      }),
      alterations: alterationValue?.map((alteration): Alteration => {
        return {
          id: alteration.value,
          type: 'UNKNOWN',
          name: '',
          alteration: '',
          proteinChange: '',
        };
      }),
      drugs: drugValue?.map((drug): Drug => {
        return {
          id: drug.value,
          uuid: '',
        };
      }),
    };

    if (cancerTypeValue) {
      association.cancerTypes = [{ id: cancerTypeValue.value } as CancerType];
    }
    associationClient
      .createAssociation(association)
      .then(() => {
        getEntity(id); // Refresh CDx association table
        resetValues();
        notifySuccess('Biomarker association added.');
      })
      .catch(error => notifyError(error));
  };

  const redirectToCreateAlteration = () => {
    history.push(getEntityActionRoute(ENTITY_TYPE.COMPANION_DIAGNOSTIC_DEVICE, ENTITY_ACTION.ADD));
  };

  const redirectToCreateFdaSubmission = () => {
    history.push(getEntityActionRoute(ENTITY_TYPE.FDA_SUBMISSION, ENTITY_ACTION.ADD));
  };

  return (
    <Container>
      <h4 style={{ marginBottom: '2rem', marginLeft: '1rem' }}>Curation Panel</h4>
      <Menu>
        <Form onSubmit={createBiomarkerAssociation}>
          <SidebarMenuItem>Add Biomarker Association</SidebarMenuItem>
          <SidebarMenuItem>
            <GeneSelect onChange={setGeneValue} value={geneValue} />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <div className="d-flex align-items-start">
              <div style={{ flex: 1 }}>
                <AlterationSelect
                  isMulti
                  geneId={geneValue?.value?.toString() ?? ''}
                  onChange={onAlterationChange}
                  value={alterationValue}
                />
              </div>
              <DefaultTooltip overlay={'Create new alteration'}>
                <Button className="ms-1" color="primary" onClick={redirectToCreateAlteration}>
                  <FontAwesomeIcon icon={faPlus} size="sm" />
                </Button>
              </DefaultTooltip>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <CancerTypeSelect onChange={onCancerTypeChange} value={cancerTypeValue} />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <DrugSelect isMulti onChange={onDrugChange} value={drugValue} placeholder={'Select drug(s)'} />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <div className="d-flex align-items-start">
              <div style={{ flex: 1 }}>
                <FdaSubmissionSelect
                  cdxId={id}
                  isMulti
                  onChange={onFdaSubmissionChange}
                  value={fdaSubmissionValue}
                  placeholder={'Select FDA submission(s)'}
                />
              </div>
              <DefaultTooltip overlay={'Create new FDA submission'}>
                <Button className="ms-1" color="primary" onClick={redirectToCreateFdaSubmission}>
                  <FontAwesomeIcon icon={faPlus} size="sm" />
                </Button>
              </DefaultTooltip>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SaveButton />
          </SidebarMenuItem>
        </Form>
      </Menu>
    </Container>
  );
};

const mapStoreToProps = ({ companionDiagnosticDeviceStore }: IRootStore) => ({
  getEntity: companionDiagnosticDeviceStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(CompanionDiagnosticDevicePanel);
