import React, { useState } from 'react';
import { Menu } from 'react-pro-sidebar';
import { Button, Form } from 'reactstrap';
import { ENTITY_ACTION, ENTITY_TYPE, SearchOptionType } from 'app/config/constants/constants';
import { useHistory, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, width } from '@fortawesome/free-solid-svg-icons/faPlus';
import DefaultTooltip from 'app/shared/tooltip/DefaultTooltip';
import CancerTypeSelect, { CancerTypeSelectOption } from 'app/shared/select/CancerTypeSelect';
import { SaveButton } from 'app/shared/button/SaveButton';
import GeneSelect from 'app/shared/select/GeneSelect';
import AlterationSelect from 'app/shared/select/AlterationSelect';
import DrugSelect, { DrugSelectOption } from 'app/shared/select/DrugSelect';
import FdaSubmissionSelect from 'app/shared/select/FdaSubmissionSelect';
import { connect } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { getEntityActionRoute } from 'app/shared/util/RouteUtils';
import { Alteration, Association, CancerType, Drug, FdaSubmission } from 'app/shared/api/generated/curation';
import { associationClient } from 'app/shared/api/clients';
import { notifyError, notifySuccess } from 'app/oncokb-commons/components/util/NotificationUtils';
import { IFdaSubmission } from 'app/shared/model/fda-submission.model';

const SidebarMenuItem: React.FunctionComponent<{ style?: React.CSSProperties; children: React.ReactNode }> = ({ style, children }) => {
  return <div style={{ padding: '0.5rem 1rem', ...style }}>{children}</div>;
};

export const defaultAdditional = {
  page: 1,
  type: SearchOptionType.GENE,
};

const CompanionDiagnosticDevicePanel: React.FunctionComponent<StoreProps> = props => {
  const [selectedGeneId, setSelectedGeneId] = useState<string | null>(null);
  type AlterationChangeArg = Parameters<NonNullable<Parameters<typeof AlterationSelect>[0]['onChange']>>[0];
  const [alterationValue, onAlterationChange] = useState<AlterationChangeArg | null>(null);
  const [cancerTypeValue, onCancerTypeChange] = useState<CancerTypeSelectOption | null>(null);
  const [drugValue, onDrugChange] = useState<readonly DrugSelectOption[]>();
  const [fdaSubmissionValue, onFdaSubmissionChange] = useState<readonly IFdaSubmission[]>();

  const history = useHistory();
  const location = useLocation();
  const id = parseInt(location.pathname.split('/')[2], 10);

  const createBiomarkerAssociation = (e: any) => {
    e.preventDefault();
    const association: Association = {
      fdaSubmissions: fdaSubmissionValue?.map((fdaSubmission): FdaSubmission => {
        return {
          // TYPE-ISSUE: value is not on FdaSubmission
          id: (fdaSubmission as any).value,
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
    <div>
      <h4 style={{ marginBottom: '2rem', marginLeft: '1rem' }}>Curation Panel</h4>
      <Menu>
        <Form onSubmit={createBiomarkerAssociation}>
          <SidebarMenuItem>Add Biomarker Association</SidebarMenuItem>
          <SidebarMenuItem>
            <GeneSelect
              isMulti={false}
              onChange={option => {
                const geneId = option ? option.value : null;
                setSelectedGeneId(geneId?.toString() ?? null);
              }}
            />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <div style={{ display: 'flex' }}>
              <div style={{ flex: 1 }}>
                <AlterationSelect isMulti geneId={selectedGeneId ?? ''} onChange={onAlterationChange} />
              </div>
              <DefaultTooltip overlay={'Create new alteration'}>
                <Button className="ms-1" color="primary" onClick={redirectToCreateAlteration}>
                  <FontAwesomeIcon icon={faPlus} size="sm" />
                </Button>
              </DefaultTooltip>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <CancerTypeSelect isMulti={false} onChange={onCancerTypeChange} />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <DrugSelect isMulti onChange={onDrugChange} />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <div style={{ display: 'flex' }}>
              <div style={{ flex: 1 }}>
                <FdaSubmissionSelect cdxId={id} isMulti onChange={onFdaSubmissionChange} />
              </div>
              <DefaultTooltip overlay={'Create new Fda Submission'}>
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
    </div>
  );
};

const mapStoreToProps = ({ associationStore }: IRootStore) => ({});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect<object, StoreProps>(mapStoreToProps)(CompanionDiagnosticDevicePanel);
