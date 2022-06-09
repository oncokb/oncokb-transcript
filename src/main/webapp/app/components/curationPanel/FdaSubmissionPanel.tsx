import React, { useEffect, useState } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores/createStore';
import { Menu } from 'react-pro-sidebar';
import { Button, Form } from 'reactstrap';
import { SearchOptionType } from 'app/config/constants';
import { useHistory, useLocation } from 'react-router-dom';
import { notifyError, notifySuccess } from 'app/oncokb-commons/components/util/NotificationUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';
import DefaultTooltip from 'app/shared/tooltip/DefaultTooltip';
import { IDeviceUsageIndication } from 'app/shared/model/device-usage-indication.model';
import CancerTypeSelect from 'app/shared/select/CancerTypeSelect';
import { deviceUsageIndicationClient } from 'app/shared/api/clients';
import { SaveButton } from 'app/shared/button/SaveButton';
import GeneSelect from 'app/shared/select/GeneSelect';
import AlterationSelect from 'app/shared/select/AlterationSelect';
import DrugSelect from 'app/shared/select/DrugSelect';

const SidebarMenuItem: React.FunctionComponent<{ style?: React.CSSProperties }> = ({ style, children }) => {
  return <div style={{ padding: '8px 24px 0 24px', ...style }}>{children}</div>;
};

export const defaultAdditional = {
  page: 1,
  type: SearchOptionType.GENE,
};

export interface FdaSubmissionPanelProps extends StoreProps {
  entityId: string;
}

const FdaSubmissionPanel: React.FunctionComponent<StoreProps> = props => {
  const [selectedGeneId, setSelectedGeneId] = useState(null);
  const [alterationValue, onAlterationChange] = useState(null);
  const [cancerTypeValue, onCancerTypeChange] = useState(null);
  const [drugValue, onDrugChange] = useState(null);
  const [deviceUsageIndications, setDeviceUsageIndications] = useState([]);

  const history = useHistory();
  const location = useLocation();
  const id = parseInt(location.pathname.split('/')[2], 10);

  useEffect(() => {
    if (!isNaN(id)) {
      const getEntity = async () => await deviceUsageIndicationClient.getDeviceUsageIndicationByFdaSubmission(id);
      getEntity()
        .then(entities => setDeviceUsageIndications(entities.data))
        .catch(error => notifyError(error));
    }
  }, [id]);

  const createDeviceUsageIndication = (e: any) => {
    e.preventDefault();
    const deviceUsageIndicationDTO = {
      fdaSubmission: id,
      alteration: alterationValue.value as number,
      cancerType: cancerTypeValue.value as number,
      drug: drugValue.value as number,
    };
    deviceUsageIndicationClient
      .createDeviceUsageIndication(deviceUsageIndicationDTO)
      .then(() => {
        notifySuccess('Biomarker association added.');
        deviceUsageIndicationClient.getDeviceUsageIndicationByFdaSubmission(id).then(indications => {
          setDeviceUsageIndications(indications.data);
        });
      })
      .catch(error => notifyError(error));
  };

  const redirectToCreateAlteration = () => {
    history.push('/alteration/new');
  };

  const onDeleteDeviceUsageIndication = (deviceUsageIndicationId: number) => {
    history.push(`/device-usage-indication/${deviceUsageIndicationId}/delete`);
  };

  return (
    <>
      <Menu>
        <Form onSubmit={createDeviceUsageIndication}>
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
                <AlterationSelect geneId={selectedGeneId} onChange={onAlterationChange} />
              </div>
              <DefaultTooltip overlay={'Create new alteration'}>
                <Button color="primary" onClick={redirectToCreateAlteration}>
                  <FontAwesomeIcon icon={faPlus} size="sm" />
                </Button>
              </DefaultTooltip>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <CancerTypeSelect onChange={onCancerTypeChange} />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <DrugSelect onChange={onDrugChange} />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SaveButton />
          </SidebarMenuItem>
        </Form>
      </Menu>
      {deviceUsageIndications.length > 0 && (
        <Menu>
          <SidebarMenuItem>Biomarker Associations</SidebarMenuItem>
          <SidebarMenuItem style={{ overflowY: 'scroll', height: '425px' }}>
            {deviceUsageIndications.map((indication: IDeviceUsageIndication) => {
              return (
                <div
                  key={`indication${indication.id}`}
                  style={{
                    color: 'black',
                    display: 'flex',
                    justifyContent: 'space-between',
                    background: 'white',
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid lightgrey',
                    margin: '10px 0px',
                  }}
                >
                  <div>
                    <div>{`${indication.alteration.genes[0].hugoSymbol}/${indication.alteration.name}`}</div>
                    <div>Cancer Type: {indication.cancerType.mainType}</div>
                    <div>Drug: {indication.drug.name}</div>
                  </div>
                  <div>
                    <Button
                      to={`/device-usage-indication/${indication.id}/delete`}
                      color="danger"
                      size="sm"
                      onClick={() => onDeleteDeviceUsageIndication(indication.id)}
                    >
                      <FontAwesomeIcon icon="trash" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </SidebarMenuItem>
        </Menu>
      )}
    </>
  );
};

const mapStoreToProps = ({ geneStore, alterationStore, cancerTypeStore, drugStore, deviceUsageIndicationStore }: IRootStore) => ({
  getGene: geneStore.getEntity,
  getGenes: geneStore.getEntities,
  genes: geneStore.entities,
  searchGenes: geneStore.searchEntities,
  getAlterations: alterationStore.getEntities,
  getCancerTypes: cancerTypeStore.getEntities,
  searchCancerTypes: cancerTypeStore.searchEntities,
  getDrugs: drugStore.getEntities,
  searchDrugs: drugStore.searchEntities,
  getDeviceUsageIndications: deviceUsageIndicationStore.getEntities,
  deviceUsageIndications: deviceUsageIndicationStore.entities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(FdaSubmissionPanel);
