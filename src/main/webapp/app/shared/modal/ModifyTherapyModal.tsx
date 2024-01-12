import React, { useEffect, useMemo, useState } from 'react';
import { SimpleConfirmModal } from './SimpleConfirmModal';
import { Treatment } from '../model/firebase/firebase.model';
import DrugSelect, { DrugSelectOption } from '../select/DrugSelect';
import { IRootStore } from 'app/stores';
import { componentInject } from '../util/typed-inject';
import { observer } from 'mobx-react';
import { getTxName } from '../util/firebase/firebase-utils';
import { IDrug } from '../model/drug.model';
import { FaExclamationCircle, FaRegTrashAlt } from 'react-icons/fa';
import styles from './styles.module.scss';
import './modify-therapy-modal.scss';
import { Button, Spinner } from 'reactstrap';
import { generateUuid } from '../util/utils';

export interface IModifyTherapyModalProps extends StoreProps {
  treatment: Treatment;
  onConfirm: (treatmentName: string) => void;
  onCancel: () => void;
}

function ModifyTherapyModal({ treatment, onConfirm, onCancel, searchDrugs, drugList, modifyTherapyModalStore }: IModifyTherapyModalProps) {
  return modifyTherapyModalStore.openTreatmentUuid === treatment.name_uuid ? (
    <ModifyTherapyModalContent
      treatment={treatment}
      onConfirm={onConfirm}
      onCancel={onCancel}
      searchDrugs={searchDrugs}
      drugList={drugList}
      modifyTherapyModalStore={modifyTherapyModalStore}
    />
  ) : (
    <></>
  );
}

const ModifyTherapyModalContent = observer(
  ({ treatment, onConfirm, onCancel, searchDrugs, drugList, modifyTherapyModalStore }: IModifyTherapyModalProps) => {
    const disableDeleteTherapy = modifyTherapyModalStore.selectedTreatments.length < 2;
    const isEmptyTherapy = modifyTherapyModalStore.selectedTreatments.some(therapy => therapy.length === 0);

    function handleRetryButtonClick() {
      modifyTherapyModalStore.setIsRetryButtonClicked(true);

      setTimeout(async () => {
        // add some delay so the user gets feedback
        modifyTherapyModalStore.setIsErrorFetchingTherapies(false);
        await setSelectedTreatments();
        modifyTherapyModalStore.setIsRetryButtonClicked(false);
      }, 500);
    }

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
              uuid: drug.uuid,
            });
          }
        }
        selectedTreatments.push(selectedTreatmentList);
      }
      modifyTherapyModalStore.setSelectedTreatments(selectedTreatments);
    }

    function getBottomMessage() {
      if (modifyTherapyModalStore.isErrorFetchingTherapies) {
        return <></>;
      } else if (isEmptyTherapy && !modifyTherapyModalStore.isRetryButtonClicked) {
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

    const isConfirmButtonDisabled = useMemo(() => {
      return isEmptyTherapy || modifyTherapyModalStore.isErrorFetchingTherapies;
    }, [isEmptyTherapy, modifyTherapyModalStore.isErrorFetchingTherapies]);

    return (
      <SimpleConfirmModal
        title="Modify Therapy(s)"
        show={true}
        onConfirm={() => {
          const name = modifyTherapyModalStore.selectedTreatments.map(therapy => therapy.map(drug => drug.uuid).join(' + ')).join(', ');
          onConfirm(name);
        }}
        confirmDisabled={isConfirmButtonDisabled}
        onCancel={onCancel}
        body={
          <div>
            {modifyTherapyModalStore.isErrorFetchingTherapies && (
              <div className={`mb-4 ${styles.warning}`}>
                <FaExclamationCircle className="mr-2" size={'25px'} />
                <span className="mr-3">Error fetching therapies</span>
                <Button
                  disabled={modifyTherapyModalStore.isRetryButtonClicked}
                  outline
                  color="danger"
                  size="sm"
                  onClick={handleRetryButtonClick}
                >
                  {modifyTherapyModalStore.isRetryButtonClicked && (
                    <span>
                      <Spinner size="sm" />{' '}
                    </span>
                  )}
                  <span>Retry</span>
                </Button>
              </div>
            )}
            <div className="mb-2">
              {modifyTherapyModalStore.selectedTreatments.map((therapy, index) => {
                return (
                  <div className={`${index === 0 ? 'mt-2' : 'mt-3'}`} key={generateUuid()}>
                    <h6 className="mb-2">Therapy</h6>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div className="mr-3" style={{ flexGrow: 1 }}>
                        <DrugSelect
                          onChange={options => modifyTherapyModalStore.setTherapy(index, options)}
                          isDisabled={modifyTherapyModalStore.isErrorFetchingTherapies}
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

const mapStoreToProps = ({ drugStore, firebaseDrugsStore, modifyTherapyModalStore }: IRootStore) => ({
  searchDrugs: drugStore.searchEntities,
  drugList: firebaseDrugsStore.drugList,
  modifyTherapyModalStore,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(ModifyTherapyModal));
