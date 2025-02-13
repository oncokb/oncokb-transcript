import React, { useEffect, useMemo, useState } from 'react';
import CancerTypeSelect, { CancerTypeSelectOption } from '../select/CancerTypeSelect';
import { CancerType, CancerTypeList, Tumor } from '../model/firebase/firebase.model';
import { generateUuid, getCancerTypeName } from '../util/utils';
import { IRootStore } from 'app/stores';
import { componentInject } from '../util/typed-inject';
import { ICancerType } from '../model/cancer-type.model';
import { FaExclamationCircle } from 'react-icons/fa';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from 'reactstrap';
import { observer } from 'mobx-react-lite';
import { DEFAULT_ICON_SIZE } from 'app/config/constants/constants';
import { Unsubscribe, onValue, ref } from 'firebase/database';
import _ from 'lodash';
import { AsyncSaveButton } from '../button/AsyncSaveButton';
import { mapJSArrayToFirebaseArray } from '../util/firebase/firebase-utils';

export interface IModifyCancerTypeModalProps extends StoreProps {
  cancerTypesUuid: string;
  cancerTypesPathToEdit?: string;
  allCancerTypesPath: string;
  onConfirm: (newTumor: Tumor) => Promise<void>;
  onCancel: () => void;
}

export function getCancerTypeFromCancerTypeSelectOption(cancerTypeSelectOption: CancerTypeSelectOption) {
  const cancerType = new CancerType();
  if (!_.isNil(cancerTypeSelectOption?.code)) {
    cancerType.code = cancerTypeSelectOption.code;
  }
  if (!_.isNil(cancerTypeSelectOption?.mainType)) {
    cancerType.mainType = cancerTypeSelectOption.mainType;
  }
  if (!_.isNil(cancerTypeSelectOption?.subtype)) {
    cancerType.subtype = cancerTypeSelectOption.subtype;
  }
  return cancerType;
}

function ModifyCancerTypeModal({
  cancerTypesUuid,
  cancerTypesPathToEdit,
  allCancerTypesPath,
  onConfirm,
  onCancel,
  searchCancerTypes,
  modifyCancerTypeModalStore,
  firebaseDb,
}: IModifyCancerTypeModalProps) {
  return modifyCancerTypeModalStore?.openCancerTypesUuid === cancerTypesUuid ? (
    <ModifyCancerTypeModalContent
      cancerTypesUuid={cancerTypesUuid}
      cancerTypesPathToEdit={cancerTypesPathToEdit}
      allCancerTypesPath={allCancerTypesPath}
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
    allCancerTypesPath,
    onConfirm,
    onCancel,
    searchCancerTypes,
    modifyCancerTypeModalStore,
    firebaseDb,
    getArrayKey,
  }: IModifyCancerTypeModalProps) => {
    const [cancerTypeToEdit, setCancerTypeToEdit] = useState<Tumor | null>(null);
    const [isConfirmPending, setIsConfirmPending] = useState(false);
    const [allCancerTypes, setAllCancerTypes] = useState<Tumor[]>([]);

    async function getICancerTypeFromCancerType(cancerType: CancerType) {
      try {
        const isMainType = !cancerType.subtype;
        const iCancerType = await searchCancerTypes?.({ query: cancerType.mainType, size: 10000 });
        return isMainType
          ? iCancerType?.['data'].find(data => !data.subtype)
          : iCancerType?.['data'].find(data => data.subtype === cancerType.subtype);
      } catch {
        modifyCancerTypeModalStore?.setIsErrorFetchingICancerTypes(true);
        return null;
      }
    }

    function getCancerTypeSelectOptionsFromICancerTypes(cancerTypes: (ICancerType | null | undefined)[]) {
      return cancerTypes.reduce<CancerTypeSelectOption[]>((accumulator, cancerType) => {
        if (!cancerType) {
          return accumulator;
        }
        const option: CancerTypeSelectOption = {
          label: getCancerTypeName(cancerType),
          value: cancerType.id,
          code: cancerType.code ?? '',
          mainType: cancerType.mainType,
          subtype: cancerType.subtype ?? '',
          level: cancerType.level,
        };
        return [...accumulator, option];
      }, []);
    }

    async function setIncludedCancerTypes(includedCancerTypes: CancerType[]) {
      if (includedCancerTypes) {
        const promises: Promise<ICancerType | null | undefined>[] = [];
        for (const cancerType of includedCancerTypes) {
          promises.push(getICancerTypeFromCancerType(cancerType));
        }
        modifyCancerTypeModalStore?.setIncludedCancerTypes(
          getCancerTypeSelectOptionsFromICancerTypes(await Promise.all(promises)),
          allCancerTypes,
          cancerTypeToEdit?.cancerTypes_uuid,
        );
      }
    }

    async function setExcludedCancerTypes(excludedCancerTypes: CancerType[]) {
      if (excludedCancerTypes) {
        const promises: Promise<ICancerType | null | undefined>[] = [];
        for (const cancerType of excludedCancerTypes) {
          promises.push(getICancerTypeFromCancerType(cancerType));
        }
        modifyCancerTypeModalStore?.setExcludedCancerTypes(
          getCancerTypeSelectOptionsFromICancerTypes(await Promise.all(promises)),
          allCancerTypes,
          cancerTypeToEdit?.cancerTypes_uuid,
        );
      }
    }

    function handleRetryButtonClick() {
      modifyCancerTypeModalStore?.setIsRetryButtonClicked(true);

      setTimeout(async () => {
        // add some delay so the user gets feedback
        modifyCancerTypeModalStore?.setIsErrorFetchingICancerTypes(false);
        await Promise.all([
          setIncludedCancerTypes(Object.values(cancerTypeToEdit?.cancerTypes ?? {})),
          setExcludedCancerTypes(Object.values(cancerTypeToEdit?.excludedCancerTypes ?? {})),
        ]);
        modifyCancerTypeModalStore?.setIsRetryButtonClicked(false);
      }, 500);
    }

    useEffect(() => {
      if (!firebaseDb) {
        return;
      }
      const callbacks: Unsubscribe[] = [];
      if (cancerTypesPathToEdit) {
        callbacks.push(
          onValue(ref(firebaseDb, cancerTypesPathToEdit), snapshot => {
            setCancerTypeToEdit(snapshot.val());
          }),
        );
      }

      callbacks.push(
        onValue(ref(firebaseDb, allCancerTypesPath), snapshot => {
          setAllCancerTypes(snapshot.val() || []);
        }),
      );

      return () => callbacks.forEach(callback => callback?.());
    }, [cancerTypesPathToEdit, allCancerTypesPath]);

    // There is a bug when 2 people edit the same cancer type at the same time,
    // the updates will not be reflected on each other's screens, possibly leading to data being overwritten
    useEffect(() => {
      setIncludedCancerTypes(Object.values(cancerTypeToEdit?.cancerTypes ?? {}));
    }, [cancerTypeToEdit]);

    useEffect(() => {
      setExcludedCancerTypes(Object.values(cancerTypeToEdit?.excludedCancerTypes ?? {}));
    }, [cancerTypeToEdit]);

    const isConfirmButtonDisabled = useMemo(
      () =>
        modifyCancerTypeModalStore?.isErrorFetchingICancerTypes ||
        modifyCancerTypeModalStore?.isErrorIncludedAndExcluded ||
        modifyCancerTypeModalStore?.isErrorDuplicate ||
        (modifyCancerTypeModalStore?.includedCancerTypes.length ?? 0) < 1 ||
        isConfirmPending,
      [
        modifyCancerTypeModalStore?.includedCancerTypes,
        modifyCancerTypeModalStore?.isErrorFetchingICancerTypes,
        modifyCancerTypeModalStore?.isErrorIncludedAndExcluded,
        modifyCancerTypeModalStore?.isErrorDuplicate,
        isConfirmPending,
      ],
    );

    const handleConfirm = async () => {
      const includedCancerTypes = modifyCancerTypeModalStore?.includedCancerTypes.map(option =>
        getCancerTypeFromCancerTypeSelectOption(option),
      );
      const excludedCancerTypes = modifyCancerTypeModalStore?.excludedCancerTypes.map(option =>
        getCancerTypeFromCancerTypeSelectOption(option),
      );

      const newTumor = cancerTypeToEdit ? _.cloneDeep(cancerTypeToEdit) : new Tumor();
      newTumor.cancerTypes =
        includedCancerTypes?.reduce((acc, cancerType) => {
          const ctKey = getArrayKey?.();
          acc[ctKey!] = cancerType;
          return acc;
        }, {} as CancerTypeList) ?? {};
      newTumor.cancerTypes = mapJSArrayToFirebaseArray<CancerType>(
        includedCancerTypes,
        getArrayKey!,
        `${cancerTypesPathToEdit}/cancerTypes`,
      );
      newTumor.excludedCancerTypes =
        excludedCancerTypes?.reduce((acc, cancerType) => {
          const ctKey = getArrayKey?.();
          acc[ctKey!] = cancerType;
          return acc;
        }, {} as CancerTypeList) ?? {};
      if (!newTumor.excludedCancerTypes_uuid) {
        newTumor.excludedCancerTypes_uuid = generateUuid();
      }

      setIsConfirmPending(true);
      try {
        await onConfirm(newTumor);
      } finally {
        setIsConfirmPending(false);
      }
    };

    return (
      <Modal isOpen>
        <ModalHeader>{cancerTypesUuid.startsWith('new_cancer_type_for') ? 'Add Cancer Type(s)' : 'Modify Cancer Type(s)'}</ModalHeader>
        <ModalBody>
          <div>
            {modifyCancerTypeModalStore?.isErrorFetchingICancerTypes && (
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
                isDisabled={modifyCancerTypeModalStore?.isErrorFetchingICancerTypes}
                value={modifyCancerTypeModalStore?.includedCancerTypes}
                onChange={options =>
                  modifyCancerTypeModalStore?.setIncludedCancerTypes(options, allCancerTypes, cancerTypeToEdit?.cancerTypes_uuid)
                }
                isMulti
              />
              {isConfirmButtonDisabled &&
              !modifyCancerTypeModalStore?.isErrorFetchingICancerTypes &&
              !modifyCancerTypeModalStore?.isErrorIncludedAndExcluded &&
              !modifyCancerTypeModalStore?.isErrorDuplicate ? (
                <div className={`mt-2 mb-4 error-message`}>
                  <FaExclamationCircle className="me-2" size={DEFAULT_ICON_SIZE} />
                  <span>You must include at least one cancer type</span>
                </div>
              ) : (
                <div className="mb-4" />
              )}
              <h6 className="mb-2">Select cancer type(s) for EXCLUSION</h6>
              <CancerTypeSelect
                isDisabled={modifyCancerTypeModalStore?.isErrorFetchingICancerTypes}
                value={modifyCancerTypeModalStore?.excludedCancerTypes}
                onChange={options =>
                  modifyCancerTypeModalStore?.setExcludedCancerTypes(options, allCancerTypes, cancerTypeToEdit?.cancerTypes_uuid)
                }
                isMulti
                disabledOptions={modifyCancerTypeModalStore?.includedCancerTypes}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter style={{ display: 'inline-block' }}>
          <div className="d-flex justify-content-between align-items-center">
            {modifyCancerTypeModalStore?.isErrorIncludedAndExcluded || modifyCancerTypeModalStore?.isErrorDuplicate ? (
              <div className="me-3">
                {modifyCancerTypeModalStore.isErrorIncludedAndExcluded && (
                  <div className="error-message">
                    <FaExclamationCircle className="me-2" size={DEFAULT_ICON_SIZE} />
                    <span>Cancer types may not be both included and excluded</span>
                  </div>
                )}
                {modifyCancerTypeModalStore.isErrorDuplicate && (
                  <div className="error-message">
                    <FaExclamationCircle className="me-2" size={DEFAULT_ICON_SIZE} />
                    <span>Cancer type already exists</span>
                  </div>
                )}
              </div>
            ) : (
              <div />
            )}
            <div style={{ flexShrink: 0 }}>
              <Button className="me-2" onClick={onCancel}>
                Cancel
              </Button>
              <AsyncSaveButton disabled={isConfirmButtonDisabled} onClick={handleConfirm} isSavePending={isConfirmPending} />
            </div>
          </div>
        </ModalFooter>
      </Modal>
    );
  },
);

const mapStoreToProps = ({ cancerTypeStore, modifyCancerTypeModalStore, firebaseAppStore, firebaseRepository }: IRootStore) => ({
  searchCancerTypes: cancerTypeStore.searchEntities,
  modifyCancerTypeModalStore,
  firebaseDb: firebaseAppStore.firebaseDb,
  getArrayKey: firebaseRepository.getArrayKey,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(ModifyCancerTypeModal));
