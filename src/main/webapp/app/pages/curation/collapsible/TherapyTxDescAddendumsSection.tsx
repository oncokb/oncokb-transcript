import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { DANGER } from 'app/config/colors';
import { SPECIAL_CANCER_TYPES } from 'app/config/constants/constants';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import axiosInstance from 'app/shared/api/axiosInstance';
import { cancerTypeClient } from 'app/shared/api/clients';
import { CancerType as ApiCancerType, RelevantCancerTypeQuery } from 'app/shared/api/generated/curation';
import { RealtimeRichTextEditor } from 'app/shared/firebase/input/RealtimeInputs';
import ActionIcon from 'app/shared/icons/ActionIcon';
import { CancerType, CancerTypeList, TxDescAddendum, TxDescAddendumList } from 'app/shared/model/firebase/firebase.model';
import CancerTypeSelect, { CancerTypeSelectOption } from 'app/shared/select/CancerTypeSelect';
import DefaultTooltip from 'app/shared/tooltip/DefaultTooltip';
import { componentInject } from 'app/shared/util/typed-inject';
import { generateUuid, getCancerTypeName } from 'app/shared/util/utils';
import { IRootStore } from 'app/stores';
import { onValue, ref, set, Unsubscribe } from 'firebase/database';
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { Button, Card, CardBody } from 'reactstrap';
import BadgeGroup from '../BadgeGroup';
import * as styles from './styles.module.scss';

interface ITherapyTxDescAddendumsSectionProps extends StoreProps {
  therapyPath: string;
  cancerTypePath: string;
  cancerTypeName: string;
  treatmentUuid: string;
}

const getCancerTypeKey = (mainType?: string, subtype?: string, code?: string) => `${mainType ?? ''}|${subtype ?? ''}|${code ?? ''}`;

const isTxDescAddendumPendingDelete = (txDescAddendum?: TxDescAddendum) => !!txDescAddendum?.cancer_type_review?.removed;

const getCancerTypeKeyFromList = (cancerTypeList?: CancerTypeList) => {
  const selectedCancerType = Object.values(cancerTypeList ?? {})[0];
  if (!selectedCancerType) {
    return '';
  }

  return getCancerTypeKey(selectedCancerType.mainType, selectedCancerType.subtype, selectedCancerType.code);
};

function TherapyTxDescAddendumsSection({
  therapyPath,
  cancerTypePath,
  cancerTypeName,
  treatmentUuid,
  readOnly,
  firebaseDb,
  addTxDescAddendum,
  deleteTxDescAddendum,
  updateReviewableContent,
}: ITherapyTxDescAddendumsSectionProps) {
  const [txDescAddendums, setTxDescAddendums] = useState<TxDescAddendumList>({});
  const [cancerTypes, setCancerTypes] = useState<CancerTypeList>({});
  const [excludedCancerTypes, setExcludedCancerTypes] = useState<CancerTypeList>({});
  const [selectableCancerTypes, setSelectableCancerTypes] = useState<CancerType[]>([]);
  const [allCancerTypeOptions, setAllCancerTypeOptions] = useState<CancerTypeSelectOption[]>([]);

  // Only allow All Solid/Liquid Tumors to have tx desc addendums
  const showAddTumorTypeSpecificDescriptionButton = [SPECIAL_CANCER_TYPES.ALL_SOLID_TUMORS, SPECIAL_CANCER_TYPES.ALL_LIQUID_TUMORS].some(
    cancerType => cancerTypeName.toLowerCase() === cancerType.toLowerCase(),
  );

  const hasIncompleteTxDescAddendum = Object.values(txDescAddendums).some(txDescAddendum => {
    if (isTxDescAddendumPendingDelete(txDescAddendum)) {
      return false;
    }

    const hasCancerType = Object.keys(txDescAddendum?.cancer_type ?? {}).length > 0;
    const hasDescription = !!txDescAddendum?.description?.trim();
    return !hasCancerType || !hasDescription;
  });

  const selectableCancerTypeKeys = new Set(
    selectableCancerTypes.map(cancerType => getCancerTypeKey(cancerType.mainType, cancerType.subtype, cancerType.code)),
  );

  const selectedCancerTypeKeyByAddendum = Object.entries(txDescAddendums).reduce(
    (selectedKeys, [addendumKey, txDescAddendum]) => {
      if (isTxDescAddendumPendingDelete(txDescAddendum)) {
        return selectedKeys;
      }

      const selectedCancerTypeKey = getCancerTypeKeyFromList(txDescAddendum?.cancer_type);
      if (selectedCancerTypeKey) {
        selectedKeys[addendumKey] = selectedCancerTypeKey;
      }
      return selectedKeys;
    },
    {} as Record<string, string>,
  );

  const selectedCancerTypeKeys = new Set(Object.values(selectedCancerTypeKeyByAddendum));

  const disabledCancerTypeOptionsByAddendum = Object.entries(txDescAddendums).reduce(
    (disabledOptions, [addendumKey]) => {
      const selectedCancerTypeKey = selectedCancerTypeKeyByAddendum[addendumKey];
      disabledOptions[addendumKey] = allCancerTypeOptions.filter(option => {
        if (!option) {
          return false;
        }

        const optionCancerTypeKey = getCancerTypeKey(option.mainType, option.subtype, option.code);
        const isOutsideRelevantCancerTypes = !selectableCancerTypeKeys.has(optionCancerTypeKey);
        const isSelectedByOtherAddendum = selectedCancerTypeKeys.has(optionCancerTypeKey) && optionCancerTypeKey !== selectedCancerTypeKey;

        return isOutsideRelevantCancerTypes || isSelectedByOtherAddendum;
      });
      return disabledOptions;
    },
    {} as Record<string, CancerTypeSelectOption[]>,
  );

  useEffect(() => {
    if (!firebaseDb) {
      return;
    }

    return onValue(ref(firebaseDb, `${therapyPath}/description_addendums`), snapshot => {
      setTxDescAddendums((snapshot.val() as TxDescAddendumList) ?? {});
    });
  }, [therapyPath, firebaseDb]);

  useEffect(() => {
    if (!firebaseDb || !showAddTumorTypeSpecificDescriptionButton || Object.keys(txDescAddendums).length === 0) {
      setSelectableCancerTypes([]);
      return;
    }

    const callbacks: Unsubscribe[] = [];
    callbacks.push(
      onValue(ref(firebaseDb, `${cancerTypePath}/cancerTypes`), snapshot => {
        setCancerTypes(snapshot.val() ?? {});
      }),
    );
    callbacks.push(
      onValue(ref(firebaseDb, `${cancerTypePath}/excludedCancerTypes`), snapshot => {
        setExcludedCancerTypes(snapshot.val() ?? {});
      }),
    );

    return () => callbacks.forEach(callback => callback?.());
  }, [cancerTypePath, firebaseDb, showAddTumorTypeSpecificDescriptionButton, txDescAddendums]);

  useEffect(() => {
    if (!showAddTumorTypeSpecificDescriptionButton || Object.keys(txDescAddendums).length === 0 || Object.keys(cancerTypes).length === 0) {
      setSelectableCancerTypes([]);
      return;
    }

    const relevantCancerTypeQueries: RelevantCancerTypeQuery[] = Object.values(cancerTypes).map(type => ({
      mainType: type.mainType,
      code: type.code,
    }));
    const excludedRelevantCancerTypeQueries: RelevantCancerTypeQuery[] = Object.values(excludedCancerTypes).map(type => ({
      mainType: type.mainType,
      code: type.code,
    }));

    cancerTypeClient
      .getRelevantCancerTypes({ relevantCancerTypeQueries, excludedRelevantCancerTypeQueries })
      .then(({ data }) => {
        setSelectableCancerTypes(
          (data ?? []).map(cancerType => ({
            code: cancerType.code,
            mainType: cancerType.mainType,
            subtype: cancerType.subtype,
          })),
        );
      })
      .catch(error => {
        notifyError(error);
      });
  }, [cancerTypes, excludedCancerTypes, showAddTumorTypeSpecificDescriptionButton, txDescAddendums]);

  useEffect(() => {
    if (!showAddTumorTypeSpecificDescriptionButton || Object.keys(txDescAddendums).length === 0) {
      setAllCancerTypeOptions([]);
      return;
    }

    const pageSize = 1000;

    const fetchAllCancerTypes = async () => {
      try {
        let page = 0;
        const optionMap = new Map<string, CancerTypeSelectOption>();
        let hasMore = true;

        while (hasMore) {
          const queryParams = new URLSearchParams();
          queryParams.set('page', String(page));
          queryParams.set('size', String(pageSize));
          queryParams.append('sort', 'subtype,ASC');
          queryParams.append('sort', 'mainType,ASC');

          // Use axios here because the generated client serializes pagination incorrectly for /api/cancer-types
          // (criteria/pageable objects instead of Spring page/size/sort query params).
          const { data } = await axiosInstance.get<ApiCancerType[]>('/api/cancer-types', { params: queryParams });
          const cancerTypesInPage = data ?? [];
          cancerTypesInPage.forEach((cancerType: ApiCancerType) => {
            if (cancerType.id === undefined) {
              return;
            }

            const option: CancerTypeSelectOption = {
              value: cancerType.id,
              label: getCancerTypeName(cancerType),
              code: cancerType.code ?? '',
              mainType: cancerType.mainType,
              subtype: cancerType.subtype ?? '',
              level: cancerType.level,
            };
            optionMap.set(getCancerTypeKey(option.mainType, option.subtype, option.code), option);
          });
          hasMore = cancerTypesInPage.length === pageSize;
          page += 1;
        }

        setAllCancerTypeOptions(Array.from(optionMap.values()));
      } catch (error) {
        notifyError(error);
      }
    };

    fetchAllCancerTypes();
  }, [showAddTumorTypeSpecificDescriptionButton, txDescAddendums]);

  async function handleAddTumorTypeSpecificDescription() {
    if (hasIncompleteTxDescAddendum) {
      return;
    }

    try {
      await addTxDescAddendum?.(therapyPath);
    } catch (error) {
      notifyError(error);
    }
  }

  async function handleDeleteTxDescAddendum(addendumKey: string) {
    const addendum = txDescAddendums[addendumKey];
    if (!addendum) {
      return;
    }

    try {
      await deleteTxDescAddendum?.(therapyPath, addendumKey, addendum);
    } catch (error) {
      notifyError(error);
    }
  }

  function getSelectedCancerTypeOption(cancerTypeList?: CancerTypeList): CancerTypeSelectOption | null {
    const selectedCancerType = Object.values(cancerTypeList ?? {})[0];
    if (!selectedCancerType) {
      return null;
    }

    return allCancerTypeOptions.find(
      option =>
        option?.code === (selectedCancerType.code ?? '') &&
        option?.mainType === (selectedCancerType.mainType ?? '') &&
        option?.subtype === (selectedCancerType.subtype ?? ''),
    );
  }

  async function handleTxDescAddendumCancerTypeChange(addendumKey: string, selectedCancerTypeOption: CancerTypeSelectOption | null) {
    if (!firebaseDb && !updateReviewableContent) {
      return;
    }

    const currentAddendum = txDescAddendums[addendumKey];
    if (isTxDescAddendumPendingDelete(currentAddendum)) {
      return;
    }

    const currentCancerTypeList = currentAddendum?.cancer_type ?? {};
    const currentCancerTypeKey = getCancerTypeKeyFromList(currentCancerTypeList);

    if (selectedCancerTypeOption) {
      const nextCancerTypeKey = getCancerTypeKey(
        selectedCancerTypeOption.mainType,
        selectedCancerTypeOption.subtype,
        selectedCancerTypeOption.code,
      );

      if (currentCancerTypeKey === nextCancerTypeKey) {
        return;
      }

      const isAlreadySelectedByAnotherAddendum = Object.entries(txDescAddendums).some(
        ([currentAddendumKey, txDescAddendum]) =>
          !isTxDescAddendumPendingDelete(txDescAddendum) &&
          currentAddendumKey !== addendumKey &&
          getCancerTypeKeyFromList(txDescAddendum?.cancer_type) === nextCancerTypeKey,
      );

      if (isAlreadySelectedByAnotherAddendum) {
        return;
      }
    } else if (Object.keys(currentCancerTypeList).length === 0) {
      return;
    }

    const nextCancerTypeList: CancerTypeList =
      selectedCancerTypeOption === null || selectedCancerTypeOption === undefined
        ? {}
        : {
            [generateUuid()]: {
              code: selectedCancerTypeOption.code,
              mainType: selectedCancerTypeOption.mainType,
              subtype: selectedCancerTypeOption.subtype,
            },
          };

    const addendumCancerTypePath = `${therapyPath}/description_addendums/${addendumKey}/cancer_type`;

    try {
      if (updateReviewableContent) {
        await updateReviewableContent(
          addendumCancerTypePath,
          currentCancerTypeList,
          nextCancerTypeList,
          currentAddendum?.cancer_type_review,
          currentAddendum?.cancer_type_uuid,
        );
        return;
      }

      await set(ref(firebaseDb!, addendumCancerTypePath), nextCancerTypeList);
    } catch (error) {
      notifyError(error);
    }
  }

  return (
    <>
      {showAddTumorTypeSpecificDescriptionButton && Object.keys(txDescAddendums).length > 0 && (
        <h6 className="mt-3 mb-2 fw-bold">Tumor Type Specific Treatment Descriptions</h6>
      )}
      {Object.entries(txDescAddendums).map(([addendumKey, txDescAddendum]) => {
        const isPendingDelete = isTxDescAddendumPendingDelete(txDescAddendum);
        const hasSelectedCancerType = Object.keys(txDescAddendum?.cancer_type ?? {}).length > 0;

        return (
          <Card key={treatmentUuid + '-tumor-type-specific-description-' + addendumKey} className="mb-2">
            <CardBody className="py-3">
              <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
                <div className="w-50">
                  <CancerTypeSelect
                    inputId={`${treatmentUuid}-tumor-type-specific-cancer-type-${addendumKey}`}
                    value={getSelectedCancerTypeOption(txDescAddendum?.cancer_type)}
                    onChange={option => {
                      handleTxDescAddendumCancerTypeChange(addendumKey, option as CancerTypeSelectOption | null);
                    }}
                    isDisabled={!!readOnly || isPendingDelete || selectableCancerTypes.length === 0}
                    disabledOptions={disabledCancerTypeOptionsByAddendum[addendumKey]}
                    isClearable={false}
                  />
                </div>
                {isPendingDelete ? (
                  <BadgeGroup firebasePath={`${therapyPath}/description_addendums/${addendumKey}/cancer_type`} showDeletedBadge />
                ) : (
                  <ActionIcon
                    icon={faTrashAlt}
                    color={DANGER}
                    onClick={() => handleDeleteTxDescAddendum(addendumKey)}
                    disabled={!!readOnly}
                  />
                )}
              </div>
              <RealtimeRichTextEditor
                id={`${treatmentUuid}-tumor-type-specific-description-input-${addendumKey}`}
                disabled={!!readOnly || isPendingDelete || !hasSelectedCancerType}
                disabledMessage={!hasSelectedCancerType ? 'Select cancer type first' : undefined}
                firebasePath={`${therapyPath}/description_addendums/${addendumKey}/description`}
                inputClass={styles.textarea}
                label="Description"
              />
            </CardBody>
          </Card>
        );
      })}
      {showAddTumorTypeSpecificDescriptionButton && (
        <DefaultTooltip
          placement="top"
          overlay={<span>There is an incomplete tumor type specific treatment description. Please complete it first.</span>}
          disabled={!hasIncompleteTxDescAddendum}
        >
          <span className="d-inline-block mt-2">
            <Button
              type="button"
              outline
              color="primary"
              disabled={!!readOnly || hasIncompleteTxDescAddendum}
              onClick={handleAddTumorTypeSpecificDescription}
            >
              + Add tumor type specific description
            </Button>
          </span>
        </DefaultTooltip>
      )}
    </>
  );
}

const mapStoreToProps = ({ firebaseAppStore, firebaseGeneService, firebaseGeneReviewService, curationPageStore }: IRootStore) => ({
  firebaseDb: firebaseAppStore.firebaseDb,
  addTxDescAddendum: firebaseGeneService.addTxDescAddendum,
  deleteTxDescAddendum: firebaseGeneService.deleteTxDescAddendum,
  updateReviewableContent: firebaseGeneReviewService.updateReviewableContent,
  readOnly: curationPageStore.readOnly,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(TherapyTxDescAddendumsSection));
