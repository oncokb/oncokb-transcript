import React, { useEffect, useMemo, useState } from 'react';
import { Menu } from 'react-pro-sidebar';
import { Button, Container, Form } from 'reactstrap';
import { ENTITY_ACTION, ENTITY_TYPE, RULE_ENTITY, SearchOptionType } from 'app/config/constants/constants';
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
import { Alteration, Association, CancerType, Drug, FdaSubmission, Rule } from 'app/shared/api/generated/curation';
import { associationClient } from 'app/shared/api/clients';
import { notifyError, notifySuccess } from 'app/oncokb-commons/components/util/NotificationUtils';
import { IRootStore } from 'app/stores';
import { connect } from 'app/shared/util/typed-inject';
import classNames from 'classnames';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import _ from 'lodash';
import { DUPLICATE_THERAPY_ERROR_MESSAGE, EMPTY_THERAPY_ERROR_MESSAGE } from 'app/shared/modal/ModifyTherapyModal';

const SidebarMenuItem: React.FunctionComponent<{ style?: React.CSSProperties; children: React.ReactNode; className?: string }> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={classNames('py-2 px-1', className)} {...props}>
      {children}
    </div>
  );
};

export const defaultAdditional = {
  page: 1,
  type: SearchOptionType.GENE,
};

const CompanionDiagnosticDevicePanel: React.FunctionComponent<StoreProps> = ({ getEntity }: StoreProps) => {
  const [geneValue, setGeneValue] = useState<GeneSelectOption | null>(null);
  const [alterationValue, setAlterationValue] = useState<readonly AlterationSelectOption[]>();
  const [cancerTypeValue, setCancerTypeValue] = useState<CancerTypeSelectOption | null>(null);
  const [selectedTreatments, setSelectedTreatments] = useState<DrugSelectOption[][]>([[]]);
  const [fdaSubmissionValue, setFdaSubmissionValue] = useState<readonly FdaSubmissionSelectOption[]>([]);

  const history = useHistory();
  const location = useLocation();
  const id = parseInt(location.pathname.split('/')[2], 10);

  useEffect(() => {
    if (geneValue === null) {
      setAlterationValue([]);
    }
  }, [geneValue]);

  const resetValues = () => {
    setAlterationValue([]);
    setGeneValue(null);
    setCancerTypeValue(null);
    setSelectedTreatments([[]]);
    setFdaSubmissionValue([]);
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
      drugs: _.uniqBy(
        selectedTreatments.flat().map(option => ({ id: option.value, uuid: '' })),
        'id',
      ),
    };

    if (!_.isEmpty(association.drugs)) {
      const rule: Rule = {
        entity: RULE_ENTITY.DRUG,
        rule: selectedTreatments.map(innerArray => innerArray.map(option => option.value).join('+')).join(','),
      };
      association.rules = [rule];
    }

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

  const onTreatmentChange = (drugOptions: DrugSelectOption[], index: number) => {
    setSelectedTreatments(prevItems => prevItems.map((item, i) => (i === index ? drugOptions : item)));
  };

  const isEmptyTreatments = selectedTreatments.some(drugs => drugs.length === 0);
  const hasDuplicateTreatments = useMemo(() => {
    return selectedTreatments.some((item, index) => selectedTreatments.slice(index + 1).some(otherItem => _.isEqual(item, otherItem)));
  }, [selectedTreatments]);

  const isSaveButtonDisabled =
    isEmptyTreatments ||
    hasDuplicateTreatments ||
    [geneValue, alterationValue, cancerTypeValue, fdaSubmissionValue].some(v => _.isEmpty(v));

  return (
    <Container className="ps-0">
      <h4 style={{ marginBottom: '1rem' }}>Curation Panel</h4>
      <div className="border-top py-3"></div>
      <Menu>
        <Form onSubmit={createBiomarkerAssociation}>
          <h5 className="ms-1">Add Biomarker Association</h5>
          <SidebarMenuItem>
            <GeneSelect onChange={setGeneValue} value={geneValue} />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <div className="d-flex align-items-start">
              <div style={{ flex: 1 }}>
                <AlterationSelect
                  isMulti
                  geneId={geneValue?.value?.toString() ?? ''}
                  onChange={setAlterationValue}
                  value={alterationValue}
                />
              </div>
              <DefaultTooltip overlay={'Create new alteration'}>
                <Button className="ms-1" color="primary" onClick={redirectToCreateAlteration} outline>
                  <FontAwesomeIcon icon={faPlus} size="sm" />
                </Button>
              </DefaultTooltip>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <CancerTypeSelect onChange={setCancerTypeValue} value={cancerTypeValue} />
          </SidebarMenuItem>
          <SidebarMenuItem className="border-top py-2">
            <h6>Input Therapies</h6>
            <>
              {selectedTreatments.map((drugOptions, index) => {
                return (
                  <div key={`cdx-drug-add-${index}`} className={classNames(index > 0 ? 'mt-2' : undefined, 'd-flex align-items-start')}>
                    <DrugSelect
                      className={'flex-grow-1'}
                      isMulti
                      onChange={options => onTreatmentChange(options as DrugSelectOption[], index)}
                      value={drugOptions}
                      placeholder={'Select drug(s)'}
                    />
                    <Button
                      className="ms-1"
                      color="danger"
                      onClick={() => {
                        setSelectedTreatments(prevItems => prevItems.filter((val, i) => i !== index));
                      }}
                      outline
                      disabled={selectedTreatments.length === 1}
                    >
                      <FontAwesomeIcon icon={faTrashCan} size="sm" />
                    </Button>
                  </div>
                );
              })}
            </>
            <Button
              outline
              size="sm"
              className="mt-2"
              color="primary"
              onClick={() => {
                setSelectedTreatments(prevState => [...prevState, []]);
              }}
              disabled={isEmptyTreatments || hasDuplicateTreatments}
            >
              Add Therapy
            </Button>
            <div>
              {selectedTreatments.length > 1 && isEmptyTreatments && EMPTY_THERAPY_ERROR_MESSAGE}
              {hasDuplicateTreatments && DUPLICATE_THERAPY_ERROR_MESSAGE}
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem className="border-top py-2">
            <div className="d-flex align-items-start">
              <div style={{ flex: 1 }}>
                <FdaSubmissionSelect
                  cdxId={id}
                  isMulti
                  onChange={setFdaSubmissionValue}
                  value={fdaSubmissionValue}
                  placeholder={'Select FDA submission(s)'}
                />
              </div>
              <DefaultTooltip overlay={'Create new FDA submission'}>
                <Button className="ms-1" color="primary" onClick={redirectToCreateFdaSubmission} outline>
                  <FontAwesomeIcon icon={faPlus} size="sm" />
                </Button>
              </DefaultTooltip>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem style={{ display: 'flex', justifyContent: 'end' }}>
            <SaveButton disabled={isSaveButtonDisabled} />
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
