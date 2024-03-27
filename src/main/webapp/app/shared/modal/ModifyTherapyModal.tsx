import React, { useEffect, useState } from 'react';
import { SimpleConfirmModal } from './SimpleConfirmModal';
import DrugSelect, { DrugSelectOption } from '../select/DrugSelect';
import { IRootStore } from 'app/stores';
import { componentInject } from '../util/typed-inject';
import { observer } from 'mobx-react';
import { IDrug } from '../model/drug.model';
import { FaExclamationCircle, FaRegTrashAlt } from 'react-icons/fa';
import './modify-therapy-modal.scss';
import { Button } from 'reactstrap';
import { generateUuid } from '../util/utils';
import { parseNcitUniqId } from '../select/NcitCodeSelect';
import _ from 'lodash';
import { Treatment, Tumor } from '../model/firebase/firebase.model';
import { ERROR_EXCLAMATION_ICON_SIZE } from 'app/config/constants/constants';
import { onValue, ref } from 'firebase/database';

export interface IModifyTherapyModalProps extends StoreProps {
  treatmentUuid: string;
  treatmentToEditPath?: string;
  drugList: readonly IDrug[];
  cancerTypePath: string;
  onConfirm: (newTreatment: Treatment, newDrugs: IDrug[]) => void;
  onCancel: () => void;
}

function ModifyTherapyModal({
  treatmentUuid,
  treatmentToEditPath,
  drugList,
  cancerTypePath,
  onConfirm,
  onCancel,
  modifyTherapyModalStore,
  firebaseDb,
}: IModifyTherapyModalProps) {
  return modifyTherapyModalStore.openTreatmentUuid === treatmentUuid ? (
    <ModifyTherapyModalContent
      treatmentUuid={treatmentUuid}
      treatmentToEditPath={treatmentToEditPath}
      drugList={drugList}
      cancerTypePath={cancerTypePath}
      onConfirm={onConfirm}
      onCancel={onCancel}
      modifyTherapyModalStore={modifyTherapyModalStore}
      firebaseDb={firebaseDb}
    />
  ) : (
    <></>
  );
}

const ModifyTherapyModalContent = observer(
  ({
    treatmentUuid,
    treatmentToEditPath,
    drugList,
    cancerTypePath,
    onConfirm,
    onCancel,
    modifyTherapyModalStore,
    firebaseDb,
  }: IModifyTherapyModalProps) => {
    const [currentTreatments, setCurrentTreatments] = useState<Treatment[]>([]);
    const [treatmentToEdit, setTreatmentToEdit] = useState<Treatment>(null);

    const disableDeleteTherapy = modifyTherapyModalStore.selectedTreatments.length < 2;
    const isEmptyTherapy = modifyTherapyModalStore.selectedTreatments.some(therapy => therapy.length === 0);
    const isDuplicate = isDuplicateTreatment();
    const alreadyExists = therapyAlreadyExists();

    function isDuplicateTreatment() {
      for (let i = 0; i < modifyTherapyModalStore.selectedTreatments.length; i++) {
        for (let j = i + 1; j < modifyTherapyModalStore.selectedTreatments.length; j++) {
          const firstTreatment = modifyTherapyModalStore.selectedTreatments[i].map(drug => drug.value);
          firstTreatment.sort();
          const secondTreatment = modifyTherapyModalStore.selectedTreatments[j].map(drug => drug.value);
          secondTreatment.sort();

          if (_.isEqual(firstTreatment, secondTreatment)) {
            return true;
          }
        }
      }
      return false;
    }

    function therapyAlreadyExists() {
      const therapyToAdd: string[][] = [];
      for (const treatment of modifyTherapyModalStore.selectedTreatments) {
        if (treatment.length === 0) {
          continue;
        }

        const drugUuids = [];
        for (const drug of treatment) {
          if (!drug.uuid) {
            // drug only does not have uuid for drugs not in drug collection, so it can't already exist
            return false;
          }
          drugUuids.push(drug.uuid);
        }
        drugUuids.sort();
        therapyToAdd.push(drugUuids);
      }
      therapyToAdd.sort();

      return currentTreatments.some(treatment => {
        if (modifyTherapyModalStore.openTreatmentUuid === treatment.name_uuid) {
          return false;
        }

        const formattedTreatment: string[][] = [];
        for (const individualTreatment of treatment.name.split(',')) {
          const drugUuids = [];
          for (const drugUuid of individualTreatment.split('+')) {
            drugUuids.push(drugUuid.trim());
          }
          drugUuids.sort();
          formattedTreatment.push(drugUuids);
        }
        formattedTreatment.sort();

        return _.isEqual(formattedTreatment, therapyToAdd);
      });
    }

    function getDrugFromTreatmentUuid(treatmentId: string) {
      return drugList.find(drug => drug.uuid === treatmentId);
    }

    function setSelectedTreatments() {
      if (!treatmentToEdit) {
        // only when creating new therapy
        modifyTherapyModalStore.setSelectedTreatments([[]]);
        return;
      }

      const treatmentLists = treatmentToEdit.name.split(',').map(tx => tx.split('+').map(txId => txId.trim()));

      const selectedTreatments: DrugSelectOption[][] = [];
      if (treatmentLists) {
        for (const list of treatmentLists) {
          const selectedOptions: DrugSelectOption[] = [];
          for (const uuid of list) {
            const drug = getDrugFromTreatmentUuid(uuid);
            selectedOptions.push({
              label: `${drug.name}${drug.nciThesaurus ? ` (${drug.nciThesaurus.code})` : ''}`,
              value: drug.id,
              uuid: drug.uuid,
              drugName: drug.name,
            });
          }
          selectedTreatments.push(selectedOptions);
        }
      }
      modifyTherapyModalStore.setSelectedTreatments(selectedTreatments);
    }

    function getBottomMessage() {
      if (isEmptyTherapy || isDuplicate || alreadyExists) {
        return (
          <div>
            {isDuplicate && (
              <div className="error-message">
                <FaExclamationCircle className="mr-2" size={ERROR_EXCLAMATION_ICON_SIZE} />
                <span>Each therapy must be unique</span>
              </div>
            )}
            {isEmptyTherapy && (
              <div className="error-message">
                <FaExclamationCircle className="mr-2" size={ERROR_EXCLAMATION_ICON_SIZE} />
                <span>You must include at least one drug for each therapy</span>
              </div>
            )}
            {alreadyExists && (
              <div className="error-message">
                <FaExclamationCircle className="mr-2" size={ERROR_EXCLAMATION_ICON_SIZE} />
                <span>Therapy already exists</span>
              </div>
            )}
          </div>
        );
      } else {
        return (
          <span>
            The result will be added as{' '}
            {modifyTherapyModalStore.selectedTreatments
              .map(therapy => therapy.map(drug => (drug.ncit ? drug.ncit.preferredName : drug.drugName || drug.label)).join(' + '))
              .join(', ')}
          </span>
        );
      }
    }

    useEffect(() => {
      const callbacks = [];
      callbacks.push(
        onValue(ref(firebaseDb, cancerTypePath), snapshot => {
          const cancerType = snapshot.val() as Tumor;
          const currentTreatmentsForCancerType = cancerType.TIs.reduce((accumulator: Treatment[], ti) => {
            if (!ti.treatments) {
              return accumulator;
            }

            return accumulator.concat(ti.treatments);
          }, []);
          setCurrentTreatments(currentTreatmentsForCancerType);
        })
      );

      if (treatmentToEditPath) {
        callbacks.push(
          onValue(ref(firebaseDb, treatmentToEditPath), snapshot => {
            setTreatmentToEdit(snapshot.val());
          })
        );
      }

      return () => callbacks.forEach(callback => callback?.());
    }, [cancerTypePath, treatmentToEditPath]);

    useEffect(() => {
      setSelectedTreatments();
    }, [treatmentToEdit]);

    return (
      <SimpleConfirmModal
        title={treatmentUuid.startsWith('new_treatment_for') ? 'Add Therapy(s)' : 'Modify Therapy(s)'}
        show={true}
        onConfirm={() => {
          const newDrugs: IDrug[] = modifyTherapyModalStore.selectedTreatments.reduce((accumulator: IDrug[], currentTreatment) => {
            const drugs = currentTreatment
              .filter(therapy => therapy.ncit && !accumulator.some(treatment => treatment.nciThesaurus.id === therapy.ncit.id))
              .map<IDrug>(therapy => ({
                uuid: generateUuid(),
                name: therapy.ncit.preferredName,
                nciThesaurus: parseNcitUniqId(therapy.value),
              }));
            return accumulator.concat(drugs);
          }, []);

          const newTreatmentName = modifyTherapyModalStore.selectedTreatments
            .map(therapy =>
              therapy
                .map(drug =>
                  drug.uuid ? drug.uuid : newDrugs.find(newDrug => _.isEqual(newDrug.nciThesaurus, parseNcitUniqId(drug.value))).uuid
                )
                .join(' + ')
            )
            .join(', ');

          const newTreatment = treatmentToEdit ? _.cloneDeep(treatmentToEdit) : new Treatment('');
          newTreatment.name = newTreatmentName;
          onConfirm(newTreatment, newDrugs);
        }}
        confirmDisabled={isEmptyTherapy || isDuplicate || alreadyExists}
        onCancel={onCancel}
        body={
          <div>
            <div className="mb-2">
              {modifyTherapyModalStore.selectedTreatments.map((therapy, index) => {
                return (
                  <div className={`${index === 0 ? 'mt-2' : 'mt-3'}`} key={generateUuid()}>
                    <h6 className="mb-2">Therapy</h6>
                    <div className="d-flex align-items-center">
                      <div className="mr-3" style={{ display: 'inline-block', width: '93%' }}>
                        <DrugSelect
                          drugList={drugList}
                          onChange={options => modifyTherapyModalStore.setTherapy(index, options)}
                          value={therapy}
                          isMulti
                          isOptionDisabled={(option: DrugSelectOption) =>
                            modifyTherapyModalStore.selectedTreatments[index].some(selected => selected.value === option.value)
                          }
                        />
                      </div>
                      <FaRegTrashAlt
                        className={`${disableDeleteTherapy ? 'delete-disabled' : 'delete-enabled'}`}
                        onClick={
                          disableDeleteTherapy
                            ? null
                            : () => {
                                modifyTherapyModalStore.removeTherapy(index);
                              }
                        }
                        size={16}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div>
              <Button outline size="sm" className="mt-2" color="primary" onClick={modifyTherapyModalStore.addTherapy}>
                Add Therapy
              </Button>
            </div>
            <div className="mt-3">{getBottomMessage()}</div>
          </div>
        }
      />
    );
  }
);

const mapStoreToProps = ({ modifyTherapyModalStore, firebaseStore }: IRootStore) => ({
  firebaseDb: firebaseStore.firebaseDb,
  modifyTherapyModalStore,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(ModifyTherapyModal));
