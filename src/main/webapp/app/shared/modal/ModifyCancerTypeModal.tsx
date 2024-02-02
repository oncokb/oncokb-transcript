import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SimpleConfirmModal } from './SimpleConfirmModal';
import CancerTypeSelect, { CancerTypeSelectOption } from '../select/CancerTypeSelect';
import { CancerType } from '../model/firebase/firebase.model';
import { getCancerTypeName } from '../util/utils';
import { IRootStore } from 'app/stores';
import { componentInject } from '../util/typed-inject';
import { ICancerType } from '../model/cancer-type.model';
import { FaExclamationCircle } from 'react-icons/fa';
import { Button, Spinner } from 'reactstrap';
import { observer } from 'mobx-react-lite';
import styles from './styles.module.scss';

export interface IModifyCancerTypeModalProps extends StoreProps {
  cancerTypesUuid: string;
  includedCancerTypes: CancerType[];
  excludedCancerTypes: CancerType[];
  onConfirm: (includedCancerTypes: CancerType[], excludedCancerTypes: CancerType[]) => void;
  onCancel: () => void;
}

function ModifyCancerTypeModal({
  cancerTypesUuid,
  includedCancerTypes,
  excludedCancerTypes,
  onConfirm,
  onCancel,
  searchCancerTypes,
  modifyCancerTypeModalStore,
}: IModifyCancerTypeModalProps) {
  return modifyCancerTypeModalStore.openCancerTypesUuid === cancerTypesUuid ? (
    <ModifyCancerTypeModalContent
      cancerTypesUuid={cancerTypesUuid}
      includedCancerTypes={includedCancerTypes}
      excludedCancerTypes={excludedCancerTypes}
      onConfirm={onConfirm}
      onCancel={onCancel}
      searchCancerTypes={searchCancerTypes}
      modifyCancerTypeModalStore={modifyCancerTypeModalStore}
    />
  ) : (
    <></>
  );
}

const ModifyCancerTypeModalContent = observer(
  ({
    cancerTypesUuid,
    includedCancerTypes,
    excludedCancerTypes,
    onConfirm,
    onCancel,
    searchCancerTypes,
    modifyCancerTypeModalStore,
  }: IModifyCancerTypeModalProps) => {
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
        const iCancerType = await searchCancerTypes({ query: isMainType ? cancerType.mainType : cancerType.code });
        return isMainType ? iCancerType['data'].find(data => !data.subtype) : iCancerType['data'][0];
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

    async function setIncludedCancerTypes() {
      const promises = [];
      for (const cancerType of includedCancerTypes) {
        promises.push(getICancerTypeFromCancerType(cancerType));
      }
      modifyCancerTypeModalStore.setIncludedCancerTypes(
        getCancerTypeSelectOptionsFromICancerTypes(await Promise.all<ICancerType>(promises))
      );
    }

    async function setExcludedCancerTypes() {
      const promises = [];
      for (const cancerType of excludedCancerTypes) {
        promises.push(getICancerTypeFromCancerType(cancerType));
      }
      modifyCancerTypeModalStore.setExcludedCancerTypes(
        getCancerTypeSelectOptionsFromICancerTypes(await Promise.all<ICancerType>(promises))
      );
    }

    function handleRetryButtonClick() {
      modifyCancerTypeModalStore.setIsRetryButtonClicked(true);

      setTimeout(async () => {
        // add some delay so the user gets feedback
        modifyCancerTypeModalStore.setIsErrorFetchingICancerTypes(false);
        await Promise.all([setIncludedCancerTypes(), setExcludedCancerTypes()]);
        modifyCancerTypeModalStore.setIsRetryButtonClicked(false);
      }, 500);
    }

    // There is a bug when 2 people edit the same cancer type at the same time,
    // the updates will not be reflected on each other's screens, possibly leading to data being overwritten
    useEffect(() => {
      setIncludedCancerTypes();
    }, []);

    useEffect(() => {
      setExcludedCancerTypes();
    }, []);

    const isConfirmButtonDisabled = useMemo(
      () => modifyCancerTypeModalStore.isErrorFetchingICancerTypes || modifyCancerTypeModalStore.includedCancerTypes.length < 1,
      [modifyCancerTypeModalStore.includedCancerTypes, modifyCancerTypeModalStore.isErrorFetchingICancerTypes]
    );

    return (
      <SimpleConfirmModal
        show={true}
        title={cancerTypesUuid === 'new_cancer_type' ? 'Add Cancer Type(s)' : 'Modify Cancer Type(s)'}
        onCancel={onCancel}
        confirmDisabled={isConfirmButtonDisabled}
        onConfirm={() => {
          onConfirm(
            modifyCancerTypeModalStore.includedCancerTypes.map(option => getCancerTypeFromCancerTypeSelectOption(option)),
            modifyCancerTypeModalStore.excludedCancerTypes.map(option => getCancerTypeFromCancerTypeSelectOption(option))
          );
        }}
        body={
          <div>
            {modifyCancerTypeModalStore.isErrorFetchingICancerTypes && (
              <div className={`mb-4 ${styles.warning}`}>
                <FaExclamationCircle className="mr-2" size={'25px'} />
                <span className="mr-3">Error fetching cancer types</span>
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
              {isConfirmButtonDisabled && !modifyCancerTypeModalStore.isErrorFetchingICancerTypes ? (
                <div className={`mt-2 mb-4 ${styles.warning}`}>
                  <FaExclamationCircle className="mr-2" size={'25px'} />
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
              />
            </div>
          </div>
        }
      />
    );
  }
);

const mapStoreToProps = ({ cancerTypeStore, modifyCancerTypeModalStore }: IRootStore) => ({
  searchCancerTypes: cancerTypeStore.searchEntities,
  modifyCancerTypeModalStore,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(ModifyCancerTypeModal));
