import React, { useEffect, useMemo, useState } from 'react';
import CancerTypeSelect, { CancerTypeSelectOption } from '../select/CancerTypeSelect';
import { CancerType, Tumor } from '../model/firebase/firebase.model';
import { generateUuid, getCancerTypeName } from '../util/utils';
import { IRootStore } from 'app/stores';
import { componentInject } from '../util/typed-inject';
import { ICancerType } from '../model/cancer-type.model';
import { FaExclamationCircle } from 'react-icons/fa';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from 'reactstrap';
import { observer } from 'mobx-react-lite';
import { DEFAULT_ICON_SIZE } from 'app/config/constants/constants';
import { onValue, ref } from 'firebase/database';
import _ from 'lodash';

export interface IModifyCancerTypeModalProps extends StoreProps {
  cancerTypesUuid: string;
  cancerTypesPathToEdit?: string;
  onConfirm: (newTumor: Tumor) => void;
  onCancel: () => void;
}

function ModifyCancerTypeModal({
  cancerTypesUuid,
  cancerTypesPathToEdit,
  onConfirm,
  onCancel,
  searchCancerTypes,
  modifyCancerTypeModalStore,
  firebaseDb,
}: IModifyCancerTypeModalProps) {
  return modifyCancerTypeModalStore.openCancerTypesUuid === cancerTypesUuid ? (
    <ModifyCancerTypeModalContent
      cancerTypesUuid={cancerTypesUuid}
      cancerTypesPathToEdit={cancerTypesPathToEdit}
      onConfirm={onConfirm}
      onCancel={onCancel}
      searchCancerTypes={searchCancerTypes}
      modifyCancerTypeModalStore={modifyCancerTypeModalStore}
      firebaseDb={firebaseDb}
    />
  ) : (
    <></>
  );
}

const ModifyCancerTypeModalContent = observer(
  ({
    cancerTypesUuid,
    cancerTypesPathToEdit,
    onConfirm,
    onCancel,
    searchCancerTypes,
    modifyCancerTypeModalStore,
    firebaseDb,
  }: IModifyCancerTypeModalProps) => {
    const [cancerTypeToEdit, setCancerTypeToEdit] = useState<Tumor>(null);

    function getCancerTypeFromCancerTypeSelectOption(cancerTypeSelectOption: CancerTypeSelectOption) {
      const cancerType = new CancerType();
      cancerType.code = cancerTypeSelectOption.code;
      cancerType.mainType = cancerTypeSelectOption.mainType;
      cancerType.subtype = cancerTypeSelectOption.subtype;
      return cancerType;
    }

    async function getICancerTypeFromCancerType(cancerType: CancerType) {
      try {
        const isMainType = !cancerType.subtype;
        const iCancerType = await searchCancerTypes({ query: cancerType.mainType, size: 10000 });
        return isMainType
          ? iCancerType['data'].find(data => !data.subtype)
          : iCancerType['data'].find(data => data.subtype === cancerType.subtype);
      } catch {
        modifyCancerTypeModalStore.setIsErrorFetchingICancerTypes(true);
        return null;
      }
    }

    function getCancerTypeSelectOptionsFromICancerTypes(cancerTypes: ICancerType[]) {
      return cancerTypes.reduce<CancerTypeSelectOption[]>((accumulator, cancerType) => {
        if (!cancerType) {
          return accumulator;
        }

        const option: CancerTypeSelectOption = {
          label: getCancerTypeName(cancerType),
          value: cancerType.id,
          code: cancerType.code,
          mainType: cancerType.mainType,
          subtype: cancerType.subtype,
        };
        return [...accumulator, option];
      }, []);
    }

    async function setIncludedCancerTypes(includedCancerTypes: CancerType[]) {
      if (includedCancerTypes) {
        const promises = [];
        for (const cancerType of includedCancerTypes) {
          promises.push(getICancerTypeFromCancerType(cancerType));
        }
        modifyCancerTypeModalStore.setIncludedCancerTypes(
          getCancerTypeSelectOptionsFromICancerTypes(await Promise.all<ICancerType>(promises)),
        );
      }
    }

    async function setExcludedCancerTypes(excludedCancerTypes: CancerType[]) {
      if (excludedCancerTypes) {
        const promises = [];
        for (const cancerType of excludedCancerTypes) {
          promises.push(getICancerTypeFromCancerType(cancerType));
        }
        modifyCancerTypeModalStore.setExcludedCancerTypes(
          getCancerTypeSelectOptionsFromICancerTypes(await Promise.all<ICancerType>(promises)),
        );
      }
    }

    function handleRetryButtonClick() {
      modifyCancerTypeModalStore.setIsRetryButtonClicked(true);

      setTimeout(async () => {
        // add some delay so the user gets feedback
        modifyCancerTypeModalStore.setIsErrorFetchingICancerTypes(false);
        await Promise.all([
          setIncludedCancerTypes(cancerTypeToEdit?.cancerTypes),
          setExcludedCancerTypes(cancerTypeToEdit?.excludedCancerTypes),
        ]);
        modifyCancerTypeModalStore.setIsRetryButtonClicked(false);
      }, 500);
    }

    useEffect(() => {
      let unsubscribe;
      if (cancerTypesPathToEdit) {
        unsubscribe = onValue(ref(firebaseDb, cancerTypesPathToEdit), snapshot => {
          setCancerTypeToEdit(snapshot.val());
        });
      }

      return () => unsubscribe?.();
    }, [cancerTypesPathToEdit]);

    // There is a bug when 2 people edit the same cancer type at the same time,
    // the updates will not be reflected on each other's screens, possibly leading to data being overwritten
    useEffect(() => {
      setIncludedCancerTypes(cancerTypeToEdit?.cancerTypes);
    }, [cancerTypeToEdit]);

    useEffect(() => {
      setExcludedCancerTypes(cancerTypeToEdit?.excludedCancerTypes);
    }, [cancerTypeToEdit]);

    const isConfirmButtonDisabled = useMemo(
      () =>
        modifyCancerTypeModalStore.isErrorFetchingICancerTypes ||
        modifyCancerTypeModalStore.isErrorIncludedAndExcluded ||
        modifyCancerTypeModalStore.includedCancerTypes.length < 1,
      [
        modifyCancerTypeModalStore.includedCancerTypes,
        modifyCancerTypeModalStore.isErrorFetchingICancerTypes,
        modifyCancerTypeModalStore.isErrorIncludedAndExcluded,
      ],
    );

    return (
      <Modal isOpen>
        <ModalHeader>{cancerTypesUuid.startsWith('new_cancer_type_for') ? 'Add Cancer Type(s)' : 'Modify Cancer Type(s)'}</ModalHeader>
        <ModalBody>
          <div>
            {modifyCancerTypeModalStore.isErrorFetchingICancerTypes && (
              <div className={`mb-4 error-message`}>
                <FaExclamationCircle className="me-2" size={DEFAULT_ICON_SIZE} />
                <span className="me-3">Error fetching cancer types</span>
                <Button
                  disabled={modifyCancerTypeModalStore.isRetryButtonClicked}
                  outline
                  color="danger"
                  size="sm"
                  onClick={handleRetryButtonClick}
                >
                  {modifyCancerTypeModalStore.isRetryButtonClicked && (
                    <span>
                      <Spinner size="sm" />{' '}
                    </span>
                  )}
                  <span>Retry</span>
                </Button>
              </div>
            )}
            <div className="my-2">
              <h6 className="mb-2">Select cancer type(s) for INCLUSION</h6>
              <CancerTypeSelect
                isDisabled={modifyCancerTypeModalStore.isErrorFetchingICancerTypes}
                value={modifyCancerTypeModalStore.includedCancerTypes}
                onChange={options => modifyCancerTypeModalStore.setIncludedCancerTypes(options)}
                isMulti
              />
              {isConfirmButtonDisabled &&
              !modifyCancerTypeModalStore.isErrorFetchingICancerTypes &&
              !modifyCancerTypeModalStore.isErrorIncludedAndExcluded ? (
                <div className={`mt-2 mb-4 error-message`}>
                  <FaExclamationCircle className="me-2" size={DEFAULT_ICON_SIZE} />
                  <span>You must include at least one cancer type</span>
                </div>
              ) : (
                <div className="mb-4" />
              )}
              <h6 className="mb-2">Select cancer type(s) for EXCLUSION</h6>
              <CancerTypeSelect
                isDisabled={modifyCancerTypeModalStore.isErrorFetchingICancerTypes}
                value={modifyCancerTypeModalStore.excludedCancerTypes}
                onChange={options => modifyCancerTypeModalStore.setExcludedCancerTypes(options)}
                isMulti
                disabledOptions={modifyCancerTypeModalStore.includedCancerTypes}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter style={{ display: 'inline-block' }}>
          <div className="d-flex justify-content-between align-items-center">
            {modifyCancerTypeModalStore.isErrorIncludedAndExcluded ? (
              <div className="error-message">
                <FaExclamationCircle className="me-2" size={DEFAULT_ICON_SIZE} />
                <span className="me-3">Cancer types may not be both included and excluded</span>
              </div>
            ) : (
              <div />
            )}
            <div style={{ flexShrink: 0 }}>
              <Button className="me-2" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                color="primary"
                disabled={isConfirmButtonDisabled}
                onClick={() => {
                  const includedCancerTypes = modifyCancerTypeModalStore.includedCancerTypes.map(option =>
                    getCancerTypeFromCancerTypeSelectOption(option),
                  );
                  const excludedCancerTypes = modifyCancerTypeModalStore.excludedCancerTypes.map(option =>
                    getCancerTypeFromCancerTypeSelectOption(option),
                  );

                  const newTumor = cancerTypeToEdit ? _.cloneDeep(cancerTypeToEdit) : new Tumor();
                  newTumor.cancerTypes = includedCancerTypes;
                  newTumor.excludedCancerTypes = excludedCancerTypes;
                  if (!newTumor.excludedCancerTypes_uuid) {
                    newTumor.excludedCancerTypes_uuid = generateUuid();
                  }

                  onConfirm(newTumor);
                }}
              >
                Confirm
              </Button>
            </div>
          </div>
        </ModalFooter>
      </Modal>
    );
  },
);

const mapStoreToProps = ({ cancerTypeStore, modifyCancerTypeModalStore, firebaseAppStore }: IRootStore) => ({
  searchCancerTypes: cancerTypeStore.searchEntities,
  modifyCancerTypeModalStore,
  firebaseDb: firebaseAppStore.firebaseDb,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(ModifyCancerTypeModal));
