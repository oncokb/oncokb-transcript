import React, { useEffect, useMemo, useState } from 'react';
import { Menu } from 'react-pro-sidebar';
import { Button, Container, Form } from 'reactstrap';
import {
  DUPLICATE_THERAPY_ERROR_MESSAGE,
  EMPTY_THERAPY_ERROR_MESSAGE,
  RULE_ENTITY,
  SearchOptionType,
} from 'app/config/constants/constants';
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
import { Alteration, Association, CancerType, FdaSubmission, Rule } from 'app/shared/api/generated/curation';
import { associationClient } from 'app/shared/api/clients';
import { notifyError, notifySuccess } from 'app/oncokb-commons/components/util/NotificationUtils';
import { IRootStore } from 'app/stores';
import { connect } from 'app/shared/util/typed-inject';
import classNames from 'classnames';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import _ from 'lodash';
import { ErrorMessage } from 'app/shared/error/ErrorMessage';
import { SimpleConfirmModal } from 'app/shared/modal/SimpleConfirmModal';
import FdaSubmissionUpdateForm from 'app/entities/fda-submission/fda-submission-update-form';
import { getCancerTypeName } from 'app/shared/util/utils';
import { getFdaSubmissionNumber } from 'app/entities/companion-diagnostic-device/companion-diagnostic-device';
import AlterationUpdateForm from 'app/entities/alteration/alteration-update-form';

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

const CompanionDiagnosticDevicePanel: React.FunctionComponent<StoreProps> = ({
  getEntity,
  editingAssociation,
  clearEditingAssociation,
}: StoreProps) => {
  const [geneValue, setGeneValue] = useState<GeneSelectOption | null>(null);
  const [alterationValue, setAlterationValue] = useState<readonly AlterationSelectOption[]>();
  const [cancerTypeValue, setCancerTypeValue] = useState<CancerTypeSelectOption | null>(null);
  const [selectedTreatments, setSelectedTreatments] = useState<DrugSelectOption[][]>([[]]);
  const [fdaSubmissionValue, setFdaSubmissionValue] = useState<readonly FdaSubmissionSelectOption[]>([]);
  const [showAddFdaSubmissionModal, setShowFdaSubmissionModal] = useState(false);
  const [showAddAlterationModal, setShowAddAlterationModal] = useState(false);

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

  useEffect(() => {
    if (editingAssociation) {
      const firstAlt = editingAssociation.alterations?.[0];
      if (firstAlt && firstAlt.genes && firstAlt.genes.length > 0) {
        setGeneValue({ value: firstAlt.genes[0].id, label: firstAlt.genes[0].hugoSymbol });
      } else {
        setGeneValue(null);
      }

      setAlterationValue(editingAssociation.alterations?.map(alt => ({ value: alt.id, label: alt.name })) ?? []);

      const ct = editingAssociation?.cancerTypes?.[0];
      if (ct) {
        setCancerTypeValue({
          value: ct.id,
          label: getCancerTypeName(ct),
          code: ct.code ?? '',
          mainType: ct.mainType,
          subtype: ct.subtype ?? '',
          level: ct.level,
        });
      } else {
        setCancerTypeValue(null);
      }

      const drugOptionsMap = new Map<number, DrugSelectOption>();
      editingAssociation.drugs?.forEach(drug => {
        const label = `${drug.name}${drug.nciThesaurus ? ` (${drug.nciThesaurus.code})` : ''}`;
        drugOptionsMap.set(drug.id, {
          value: drug.id,
          label,
          drugName: drug.name,
          uuid: drug.uuid,
          synonyms: drug.nciThesaurus?.synonyms ?? undefined,
          ncit: drug.nciThesaurus ?? undefined,
        });
      });
      const drugRule = editingAssociation.rules?.find(r => r.entity === 'DRUG');
      let groups: DrugSelectOption[][] = [[]];
      if (drugRule?.rule) {
        groups = drugRule.rule.split(',').map(group =>
          group
            .split('+')
            .filter(s => s)
            .map(idStr => {
              const drugId = parseInt(idStr, 10);
              return (
                drugOptionsMap.get(drugId) || {
                  value: drugId,
                  label: `${drugId}`,
                }
              );
            }),
        );
      } else if (editingAssociation.drugs) {
        groups = [
          editingAssociation.drugs.map(
            d =>
              drugOptionsMap.get(d.id) ?? {
                value: d.id,
                label: d.name,
              },
          ),
        ];
      }
      setSelectedTreatments(groups);

      setFdaSubmissionValue(
        editingAssociation.fdaSubmissions?.map(fs => ({ value: fs.id, label: getFdaSubmissionNumber(fs.number, fs.supplementNumber) })) ??
          [],
      );
    }
  }, [editingAssociation]);

  const buildAssociationFromState = (): Association => {
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
    return association;
  };

  const createBiomarkerAssociation = (e: any) => {
    e.preventDefault();
    const association = buildAssociationFromState();
    associationClient
      .createAssociation(association)
      .then(() => {
        getEntity(id); // Refresh CDx association table
        resetValues();
        notifySuccess('Biomarker association added.');
      })
      .catch(error => notifyError(error));
  };

  const updateBiomarkerAssociation = (e: any) => {
    e.preventDefault();
    if (!editingAssociation) return;
    const association = buildAssociationFromState();
    // TODO: Add a resource endpoint to update association instead
    // of having to delete and create new.
    associationClient
      .deleteAssociation(editingAssociation.id)
      .then(() => associationClient.createAssociation(association))
      .then(() => {
        getEntity(id);
        resetValues();
        clearEditingAssociation();
        notifySuccess('Biomarker association updated.');
      })
      .catch(error => notifyError(error));
  };

  const openCreateAlterationModal = () => setShowAddAlterationModal(true);

  const cancelEditing = () => {
    resetValues();
    clearEditingAssociation();
  };

  const onTreatmentChange = (drugOptions: DrugSelectOption[], index: number) => {
    setSelectedTreatments(prevItems => prevItems.map((item, i) => (i === index ? drugOptions : item)));
  };

  // Clear panel state when leaving the page (on unmount)
  useEffect(() => {
    return () => {
      resetValues();
      clearEditingAssociation();
      setShowFdaSubmissionModal(false);
      setShowAddAlterationModal(false);
    };
  }, []);

  const isEmptyTreatments = selectedTreatments.some(drugs => drugs.length === 0);
  const hasDuplicateTreatments = useMemo(() => {
    return selectedTreatments.some((item, index) => selectedTreatments.slice(index + 1).some(otherItem => _.isEqual(item, otherItem)));
  }, [selectedTreatments]);

  const isSaveButtonDisabled =
    isEmptyTreatments ||
    hasDuplicateTreatments ||
    [geneValue, alterationValue, cancerTypeValue, fdaSubmissionValue].some(v => _.isEmpty(v));

  return (
    <>
      <Container className="ps-0">
        <h4 style={{ marginBottom: '1rem' }}>Curation Panel</h4>
        <div className="border-top py-3"></div>
        <Menu>
          <Form onSubmit={editingAssociation ? updateBiomarkerAssociation : createBiomarkerAssociation}>
            <h5 className="ms-1">{editingAssociation ? 'Edit Biomarker Association' : 'Add Biomarker Association'}</h5>
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
                  <Button className="ms-1" color="primary" onClick={openCreateAlterationModal} outline>
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
              <div className="mt-1">
                {selectedTreatments.length > 1 && isEmptyTreatments && <ErrorMessage message={EMPTY_THERAPY_ERROR_MESSAGE} />}
                {hasDuplicateTreatments && <ErrorMessage message={DUPLICATE_THERAPY_ERROR_MESSAGE} />}
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
                  <Button className="ms-1" color="primary" onClick={() => setShowFdaSubmissionModal(true)} outline>
                    <FontAwesomeIcon icon={faPlus} size="sm" />
                  </Button>
                </DefaultTooltip>
              </div>
            </SidebarMenuItem>
            <SidebarMenuItem style={{ display: 'flex', justifyContent: 'end' }}>
              {editingAssociation ? (
                <>
                  <Button color="danger" size="sm" className="me-2" onClick={cancelEditing}>
                    Cancel
                  </Button>
                  <SaveButton disabled={isSaveButtonDisabled}>Update</SaveButton>
                </>
              ) : (
                <SaveButton disabled={isSaveButtonDisabled}>Save</SaveButton>
              )}
            </SidebarMenuItem>
          </Form>
        </Menu>
      </Container>
      <SimpleConfirmModal
        title={'Create FDA Submission'}
        size="lg"
        show={showAddFdaSubmissionModal}
        body={<FdaSubmissionUpdateForm isNew showHeader={false} />}
        onCancel={() => setShowFdaSubmissionModal(false)}
        confirmText="Done"
        onConfirm={() => setShowFdaSubmissionModal(false)}
        bodyStyle={{ overflowY: 'scroll', height: '75vh' }}
      />
      <SimpleConfirmModal
        title={'Create Alteration'}
        size="lg"
        show={showAddAlterationModal}
        body={<AlterationUpdateForm isNew defaultGene={geneValue} />}
        onCancel={() => setShowAddAlterationModal(false)}
        confirmText="Done"
        onConfirm={() => {
          setShowAddAlterationModal(false);
        }}
        bodyStyle={{ overflowY: 'scroll', height: '75vh' }}
      />
    </>
  );
};

const mapStoreToProps = ({ companionDiagnosticDeviceStore, cdxAssociationEditStore }: IRootStore) => ({
  getEntity: companionDiagnosticDeviceStore.getEntity,
  editingAssociation: cdxAssociationEditStore.editingAssociation,
  clearEditingAssociation: cdxAssociationEditStore.clear,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(CompanionDiagnosticDevicePanel);
