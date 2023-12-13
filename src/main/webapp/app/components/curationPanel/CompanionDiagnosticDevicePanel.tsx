import React, { useState } from 'react';
import { Menu } from 'react-pro-sidebar';
import { Button, Form } from 'reactstrap';
import { ENTITY_ACTION, ENTITY_TYPE, SearchOptionType } from 'app/config/constants';
import { useHistory, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';
import DefaultTooltip from 'app/shared/tooltip/DefaultTooltip';
import CancerTypeSelect from 'app/shared/select/CancerTypeSelect';
import { SaveButton } from 'app/shared/button/SaveButton';
import GeneSelect from 'app/shared/select/GeneSelect';
import AlterationSelect from 'app/shared/select/AlterationSelect';
import DrugSelect from 'app/shared/select/DrugSelect';
import FdaSubmissionSelect from 'app/shared/select/FdaSubmissionSelect';
import { connect } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { getEntityActionRoute } from 'app/shared/util/RouteUtils';
import { Association, CancerType } from 'app/shared/api/generated';
import { associationClient } from 'app/shared/api/clients';
import { notifyError, notifySuccess } from 'app/oncokb-commons/components/util/NotificationUtils';

const SidebarMenuItem: React.FunctionComponent<{ style?: React.CSSProperties }> = ({ style, children }) => {
  return <div style={{ padding: '0.5rem 1rem', ...style }}>{children}</div>;
};

export const defaultAdditional = {
  page: 1,
  type: SearchOptionType.GENE,
};

const CompanionDiagnosticDevicePanel: React.FunctionComponent<StoreProps> = props => {
  const [selectedGeneId, setSelectedGeneId] = useState(null);
  const [alterationValue, onAlterationChange] = useState(null);
  const [cancerTypeValue, onCancerTypeChange] = useState(null);
  const [drugValue, onDrugChange] = useState(null);
  const [fdaSubmissionValue, onFdaSubmissionChange] = useState(null);

  const history = useHistory();
  const location = useLocation();
  const id = parseInt(location.pathname.split('/')[2], 10);

  const createBiomarkerAssociation = (e: any) => {
    e.preventDefault();
    const association: Association = {
      fdaSubmissions: fdaSubmissionValue.map(fdaSubmission => {
        return {
          id: fdaSubmission.value,
        };
      }),
      alterations: alterationValue.map(alteration => {
        return {
          id: alteration.value,
        };
      }),
      associationCancerTypes: [
        {
          relation: 'INCLUSION',
          cancerType: { id: cancerTypeValue.value as number } as CancerType,
        },
      ],
      treatments: [
        {
          drugs: drugValue.map(drug => {
            return {
              id: drug.value,
            };
          }),
        },
      ],
    };
    associationClient
      .createAssociation(association)
      .then(() => {
        notifySuccess('Biomarker association added.');
      })
      .catch(error => notifyError(error));
  };

  const redirectToCreateAlteration = () => {
    history.push(getEntityActionRoute(ENTITY_TYPE.COMPANION_DIAGNOSTIC_DEVICE, ENTITY_ACTION.CREATE));
  };

  const redirectToCreateFdaSubmission = () => {
    history.push(getEntityActionRoute(ENTITY_TYPE.FDA_SUBMISSION, ENTITY_ACTION.CREATE));
  };

  return (
    <Menu>
      <Form onSubmit={createBiomarkerAssociation}>
        <SidebarMenuItem>Add Biomarker Association</SidebarMenuItem>
        <SidebarMenuItem>
          <GeneSelect
            onChange={option => {
              const geneId = option ? option.value : null;
              setSelectedGeneId(geneId);
            }}
          />
        </SidebarMenuItem>
        <SidebarMenuItem>
          <div style={{ display: 'flex' }}>
            <div style={{ flex: 1 }}>
              <AlterationSelect isMulti geneId={selectedGeneId} onChange={onAlterationChange} />
            </div>
            <DefaultTooltip overlay={'Create new alteration'}>
              <Button className="ml-1" color="primary" onClick={redirectToCreateAlteration}>
                <FontAwesomeIcon icon={faPlus} size="sm" />
              </Button>
            </DefaultTooltip>
          </div>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <CancerTypeSelect onChange={onCancerTypeChange} />
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
              <Button className="ml-1" color="primary" onClick={redirectToCreateFdaSubmission}>
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
  );
};

const mapStoreToProps = ({ associationStore }: IRootStore) => ({});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(CompanionDiagnosticDevicePanel);
