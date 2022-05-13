import React, { useEffect, useState } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores/createStore';
import { Menu } from 'react-pro-sidebar';
import { Button, Form } from 'reactstrap';
import { AsyncPaginate } from 'react-select-async-paginate';
import { SearchOptionType } from 'app/config/constants';
import { IAlteration } from 'app/shared/model/alteration.model';
import Select from 'react-select';
import { useHistory, useLocation } from 'react-router-dom';
import axiosInstance from 'app/shared/api/axiosInstance';
import { AlterationResourceApi, DeviceUsageIndicationResourceApi } from 'app/shared/api/generated';
import { notifyError, notifySuccess } from 'app/oncokb-commons/components/util/NotificationUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';
import DefaultTooltip from 'app/shared/tooltip/DefaultTooltip';
import { IDeviceUsageIndication } from 'app/shared/model/device-usage-indication.model';
import CancerTypeSelect from 'app/shared/select/CancerTypeSelect';
import { alterationClient, deviceUsageIndicationClient } from 'app/shared/api/clients';

const SidebarMenuItem: React.FunctionComponent<{ style?: React.CSSProperties }> = ({ style, children }) => {
  return <div style={{ padding: '8px 24px 0 24px', ...style }}>{children}</div>;
};

const SELECT_OPTION_LABEL: { [key in SearchOptionType]?: string } = {
  [SearchOptionType.GENE]: 'hugoSymbol',
  [SearchOptionType.ALTERATION]: 'name',
  [SearchOptionType.CANCER_TYPE]: 'mainType',
  [SearchOptionType.DRUG]: 'name',
};

export const defaultAdditional = {
  page: 1,
  type: SearchOptionType.GENE,
};

const defaultSortParameter = 'id,ASC';

export interface FdaSubmissionPanelProps extends StoreProps {
  entityId: string;
}

const FdaSubmissionPanel: React.FunctionComponent<StoreProps> = props => {
  const [geneValue, onGeneChange] = useState(null);
  const [alterationList, setAlterationList] = useState([]);
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

  const loadOptions = async (searchWord: string, prevOptions: any[], { page, type }: { page: number; type: SearchOptionType }) => {
    let getEntities = undefined;
    let searchEntities = undefined;
    switch (type) {
      case SearchOptionType.GENE:
        getEntities = props.getGenes;
        searchEntities = props.searchGenes;
        break;
      case SearchOptionType.CANCER_TYPE:
        getEntities = props.getCancerTypes;
        searchEntities = props.searchCancerTypes;
        break;
      case SearchOptionType.DRUG:
        getEntities = props.getDrugs;
        searchEntities = props.searchDrugs;
        break;
      default:
        break;
    }

    let result = undefined;
    let options = [];
    if (searchWord) {
      result = await searchEntities({ query: searchWord, page: page - 1, size: 5, sort: defaultSortParameter });
    } else {
      result = await getEntities({ page: page - 1, size: 5, sort: defaultSortParameter });
    }

    options = result?.data?.map((entity: any) => ({
      value: entity.id,
      label: entity[SELECT_OPTION_LABEL[type]],
    }));

    return {
      options,
      hasMore: result.data.length > 0,
      additional: {
        page: page + 1,
        type,
      },
    };
  };

  const loadAlterationOptions = async (geneId: string) => {
    let options = [];
    if (geneId) {
      const result: any = await alterationClient.findByGeneId(parseInt(geneId, 10));
      result?.data?.sort((a: IAlteration, b: IAlteration) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
      options = result?.data?.map((alteration: IAlteration) => ({
        value: alteration.id,
        label: alteration.name,
      }));
      setAlterationList(options);
    }
  };

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
            <AsyncPaginate
              additional={{ ...defaultAdditional, type: SearchOptionType.GENE }}
              loadOptions={loadOptions}
              value={geneValue}
              onChange={option => {
                option ? loadAlterationOptions(option.value) : setAlterationList([]);
                onGeneChange(option);
              }}
              cacheUniqs={[geneValue]}
              placeholder="Select a gene..."
              isClearable
            />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <div style={{ display: 'flex' }}>
              <div style={{ flex: 1 }}>
                <Select
                  name={'alterations'}
                  options={alterationList}
                  placeholder="Select an alteration..."
                  onChange={onAlterationChange}
                  isDisabled={!geneValue}
                  isClearable
                />
              </div>
              <DefaultTooltip overlay={'Create new alteration'}>
                <Button color="primary" onClick={redirectToCreateAlteration}>
                  <FontAwesomeIcon icon={faPlus} size="sm" />
                </Button>
              </DefaultTooltip>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <CancerTypeSelect cancerTypeValue={cancerTypeValue} onCancerTypeChange={onCancerTypeChange} />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <AsyncPaginate
              additional={{ ...defaultAdditional, type: SearchOptionType.DRUG }}
              loadOptions={loadOptions}
              value={drugValue}
              onChange={onDrugChange}
              cacheUniqs={[drugValue]}
              placeholder="Select a drug..."
              isClearable
            />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Button color="primary" type="submit">
              Save
            </Button>
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
