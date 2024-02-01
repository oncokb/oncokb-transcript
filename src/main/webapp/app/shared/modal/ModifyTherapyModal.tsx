import React, { useEffect, useMemo } from 'react';
import { SimpleConfirmModal } from './SimpleConfirmModal';
import { Treatment } from '../model/firebase/firebase.model';
import DrugSelect, { DrugSelectOption } from '../select/DrugSelect';
import { IRootStore } from 'app/stores';
import { componentInject } from '../util/typed-inject';
import { observer } from 'mobx-react';
import { IDrug } from '../model/drug.model';
import { FaExclamationCircle, FaRegTrashAlt } from 'react-icons/fa';
import styles from './styles.module.scss';
import './modify-therapy-modal.scss';
import { Button } from 'reactstrap';
import { generateUuid } from '../util/utils';

export interface IModifyTherapyModalProps extends StoreProps {
  treatmentUuid: string;
  treatmentName: string;
  drugList: IDrug[];
  onConfirm: (treatmentName: string) => void;
  onCancel: () => void;
}

function ModifyTherapyModal({
  treatmentUuid,
  treatmentName,
  drugList,
  onConfirm,
  onCancel,
  modifyTherapyModalStore,
}: IModifyTherapyModalProps) {
  return modifyTherapyModalStore.openTreatmentUuid === treatmentUuid ? (
    <ModifyTherapyModalContent
      treatmentName={treatmentName}
      drugList={drugList}
      onConfirm={onConfirm}
      onCancel={onCancel}
      modifyTherapyModalStore={modifyTherapyModalStore}
    />
  ) : (
    <></>
  );
}

/* eslint-disable no-console */
const ModifyTherapyModalContent = observer(
  ({ treatmentName, drugList, onConfirm, onCancel, modifyTherapyModalStore }: Omit<IModifyTherapyModalProps, 'treatmentUuid'>) => {
    const disableDeleteTherapy = modifyTherapyModalStore.selectedTreatments.length < 2;
    const isEmptyTherapy = modifyTherapyModalStore.selectedTreatments.some(therapy => therapy.length === 0);

    function getDrugFromTreatmentUuid(treatmentId: string) {
      return drugList.find(drug => drug.uuid === treatmentId);
    }

    function setSelectedTreatments() {
      if (!treatmentName) {
        // only when creating new therapy
        modifyTherapyModalStore.setSelectedTreatments([[]]);
        return;
      }

      const treatmentLists = treatmentName.split(',').map(tx => tx.split('+').map(txId => txId.trim()));

      const selectedTreatments: DrugSelectOption[][] = [];
      if (treatmentLists) {
        for (const list of treatmentLists) {
          const selectedOptions: DrugSelectOption[] = [];
          for (const treatmentUuid of list) {
            const drug = getDrugFromTreatmentUuid(treatmentUuid);
            selectedOptions.push({
              label: drug.name,
              value: drug.id,
              uuid: drug.uuid,
            });
          }
          selectedTreatments.push(selectedOptions);
        }
      }
      modifyTherapyModalStore.setSelectedTreatments(selectedTreatments);
    }

    function getBottomMessage() {
      if (isEmptyTherapy) {
        return (
          <div className={styles.warning}>
            <FaExclamationCircle className="mr-2" size={'25px'} />
            <span>You must include at least one drug for each therapy</span>
          </div>
        );
      } else {
        return (
          <span>
            The result will be added as{' '}
            {modifyTherapyModalStore.selectedTreatments.map(therapy => therapy.map(drug => drug.label).join(' + ')).join(', ')}
          </span>
        );
      }
    }

    useEffect(() => {
      setSelectedTreatments();
    }, []);

    return (
      <SimpleConfirmModal
        title="Modify Therapy(s)"
        show={true}
        onConfirm={() => {
          const name = modifyTherapyModalStore.selectedTreatments.map(therapy => therapy.map(drug => drug.uuid).join(' + ')).join(', ');
          onConfirm(name);
        }}
        confirmDisabled={isEmptyTherapy}
        onCancel={onCancel}
        body={
          <div>
            <div className="mb-2">
              {modifyTherapyModalStore.selectedTreatments.map((therapy, index) => {
                return (
                  <div className={`${index === 0 ? 'mt-2' : 'mt-3'}`} key={generateUuid()}>
                    <h6 className="mb-2">Therapy</h6>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div className="mr-3" style={{ flexGrow: 1 }}>
                        <DrugSelect
                          drugList={drugList}
                          onChange={options => modifyTherapyModalStore.setTherapy(index, options)}
                          value={therapy}
                          isMulti
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

const mapStoreToProps = ({ modifyTherapyModalStore }: IRootStore) => ({
  modifyTherapyModalStore,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(ModifyTherapyModal));
