import React, { useEffect, useMemo, useState } from 'react';
import { SimpleConfirmModal } from './SimpleConfirmModal';
import { Treatment } from '../model/firebase/firebase.model';
import DrugSelect, { DrugSelectOption } from '../select/DrugSelect';
import { IRootStore } from 'app/stores';
import { componentInject } from '../util/typed-inject';
import { observer } from 'mobx-react';
import { getTxName } from '../util/firebase/firebase-utils';
import { IDrug } from '../model/drug.model';
import { FaRegTrashAlt } from 'react-icons/fa';
import './modify-therapy-modal.scss';

export interface IModifyTherapyModalProps extends StoreProps {
  treatment: Treatment;
  onConfirm: (treatment: Treatment) => void;
}

/* eslint-disable no-console */
function ModifyTherapyModal({ treatment, searchDrugs, drugList, modifyTherapyModalStore }: IModifyTherapyModalProps) {
  const disableDeleteTherapy = modifyTherapyModalStore.selectedTreatments.length < 2;
  const [isOpen, setIsOpen] = useState(true);

  async function getDrugFromTreatmentUuid(treatmentId: string) {
    const name = getTxName(drugList, treatmentId);
    try {
      const drug = await searchDrugs({ query: name });
      return drug['data'][0];
    } catch {
      modifyTherapyModalStore.setIsErrorFetchingTherapies(true);
      return null;
    }
  }

  useEffect(() => {
    async function setSelectedTreatments() {
      const treatmentLists = treatment.name.split(',').map(tx => tx.split('+').map(txId => txId.trim()));

      const drugPromises: Promise<any>[][] = [];
      for (const list of treatmentLists) {
        const promises = [];
        for (const treatmentUuid of list) {
          promises.push(getDrugFromTreatmentUuid(treatmentUuid));
        }
        drugPromises.push(promises);
      }
      const drugLists = await Promise.all(
        drugPromises.map(promises => {
          return Promise.all<IDrug>(promises);
        })
      );

      const selectedTreatments: DrugSelectOption[][] = [];
      for (const list of drugLists) {
        const selectedTreatmentList: DrugSelectOption[] = [];
        for (const drug of list) {
          if (drug) {
            selectedTreatmentList.push({
              label: drug.name,
              value: drug.id,
            });
          }
        }
        selectedTreatments.push(selectedTreatmentList);
      }
      modifyTherapyModalStore.setSelectedTreatments(selectedTreatments);
    }

    setSelectedTreatments();
  }, []);

  return (
    <SimpleConfirmModal
      title="Modify Therapy(s)"
      show={isOpen}
      onCancel={() => setIsOpen(false)}
      body={
        <div className="mb-2">
          {modifyTherapyModalStore.selectedTreatments.map((therapy, index) => {
            return (
              <div className={`${index === 0 ? 'mt-2' : 'mt-3'}`} key={index}>
                {/* find better key */}
                <h6 className="mb-2">Therapy</h6>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="mr-3" style={{ flexGrow: 1 }}>
                    <DrugSelect
                      onChange={options => modifyTherapyModalStore.setTherapy(index, options)}
                      isDisabled={disableDeleteTherapy}
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
      }
    />
  );
}

const mapStoreToProps = ({ drugStore, firebaseDrugsStore, modifyTherapyModalStore }: IRootStore) => ({
  searchDrugs: drugStore.searchEntities,
  drugList: firebaseDrugsStore.drugList,
  modifyTherapyModalStore,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(ModifyTherapyModal));
