import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SimpleConfirmModal } from './SimpleConfirmModal';
import CancerTypeSelect, { CancerTypeSelectOption } from '../select/CancerTypeSelect';
import { CancerType } from '../model/firebase/firebase.model';
import { getCancerTypeName } from '../util/utils';
import { IRootStore } from 'app/stores';
import { componentInject } from '../util/typed-inject';
import { ICancerType } from '../model/cancer-type.model';
import { FaExclamationCircle } from 'react-icons/fa';
import './modify-cancer-type-modal.scss';
import { Button, Spinner } from 'reactstrap';

export interface IModifyCancerTypeModalProps extends StoreProps {
  includedCancerTypes: CancerType[];
  excludedCancerTypes: CancerType[];
  onConfirm: (includedCancerTypes: CancerType[], excludedCancerTypes: CancerType[]) => void;
  onCancel: () => void;
  open?: boolean;
}

function ModifyCancerTypeModal({
  includedCancerTypes,
  excludedCancerTypes,
  onConfirm,
  onCancel,
  open = false,
  searchCancerTypes,
}: IModifyCancerTypeModalProps) {
  return open ? (
    <ModifyCancerTypeModalContent
      includedCancerTypes={includedCancerTypes}
      excludedCancerTypes={excludedCancerTypes}
      onConfirm={onConfirm}
      onCancel={onCancel}
      searchCancerTypes={searchCancerTypes}
    />
  ) : (
    <></>
  );
}

function ModifyCancerTypeModalContent({
  includedCancerTypes,
  excludedCancerTypes,
  onConfirm,
  onCancel,
  searchCancerTypes,
}: Omit<IModifyCancerTypeModalProps, 'open'>) {
  const [included, setIncluded] = useState<CancerTypeSelectOption[]>([]);
  const [excluded, setExcluded] = useState<CancerTypeSelectOption[]>([]);
  const [isErrorFetchingICancerTypes, setIsErrorFetchingICancerTypes] = useState(false);
  const [isRetryButtonClicked, setIsRetryButtonClicked] = useState(false);

  function getCancerTypeFromCancerTypeSelectOption(cancerTypeSelectOption: CancerTypeSelectOption) {
    const cancerType = new CancerType();
    cancerType.code = cancerTypeSelectOption.code;
    cancerType.mainType = cancerTypeSelectOption.mainType;
    cancerType.subtype = cancerTypeSelectOption.subtype;
    return cancerType;
  }

  async function getICancerTypeFromCancerType(cancerType: CancerType) {
    try {
      const iCancerType = await searchCancerTypes({ query: cancerType.code ? cancerType.subtype : cancerType.mainType });
      return iCancerType['data'][0];
    } catch {
      setIsErrorFetchingICancerTypes(true);
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
    setIncluded(getCancerTypeSelectOptionsFromICancerTypes(await Promise.all<ICancerType>(promises)));
  }

  async function setExcludedCancerTypes() {
    const promises = [];
    for (const cancerType of excludedCancerTypes) {
      promises.push(getICancerTypeFromCancerType(cancerType));
    }
    setExcluded(getCancerTypeSelectOptionsFromICancerTypes(await Promise.all<ICancerType>(promises)));
  }

  function handleRetryButtonClick() {
    setIsRetryButtonClicked(true);

    setTimeout(async () => {
      // add some delay so the user gets feedback
      setIsErrorFetchingICancerTypes(false);
      await Promise.all([setIncludedCancerTypes(), setExcludedCancerTypes()]);
      setIsRetryButtonClicked(false);
    }, 500);
  }

  useEffect(() => {
    setIncludedCancerTypes();
  }, [includedCancerTypes]);

  useEffect(() => {
    setExcludedCancerTypes();
  }, [excludedCancerTypes]);

  const isConfirmButtonDisabled = useMemo(
    () => isErrorFetchingICancerTypes || included.length < 1,
    [included, isErrorFetchingICancerTypes]
  );

  return (
    <SimpleConfirmModal
      show={true}
      title="Modify Cancer Type(s)"
      onCancel={onCancel}
      confirmDisabled={isConfirmButtonDisabled}
      onConfirm={() => {
        onConfirm(
          included.map(option => getCancerTypeFromCancerTypeSelectOption(option)),
          excluded.map(option => getCancerTypeFromCancerTypeSelectOption(option))
        );
      }}
      body={
        <div>
          {isErrorFetchingICancerTypes && (
            <div className="mb-4 warning-message">
              <FaExclamationCircle className="mr-2" size={'25px'} />
              <span className="mr-3">Error fetching cancer types</span>
              <Button disabled={isRetryButtonClicked} outline color="danger" size="sm" onClick={handleRetryButtonClick}>
                {isRetryButtonClicked && (
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
              isDisabled={isErrorFetchingICancerTypes}
              value={included}
              onChange={options => setIncluded(options)}
              isMulti
            />
            {isConfirmButtonDisabled && !isErrorFetchingICancerTypes ? (
              <div className="mt-2 mb-4 warning-message">
                <FaExclamationCircle className="mr-2" size={'25px'} />
                <span>You must include at least one cancer type</span>
              </div>
            ) : (
              <div className="mb-4" />
            )}
            <h6 className="mb-2">Select cancer type(s) for EXCLUSION</h6>
            <CancerTypeSelect
              isDisabled={isErrorFetchingICancerTypes}
              value={excluded}
              onChange={options => setExcluded(options)}
              isMulti
            />
          </div>
        </div>
      }
    />
  );
}

const mapStoreToProps = ({ cancerTypeStore }: IRootStore) => ({
  searchCancerTypes: cancerTypeStore.searchEntities,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(ModifyCancerTypeModal);
