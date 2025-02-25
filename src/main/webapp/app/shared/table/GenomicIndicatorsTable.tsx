import { ALLELE_STATE, PATHOGENIC_VARIANTS } from 'app/config/constants/firebase';
import { GenomicIndicator, GenomicIndicatorList, Mutation, MutationList, Review } from 'app/shared/model/firebase/firebase.model';
import OncoKBTable, { SearchColumn } from 'app/shared/table/OncoKBTable';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { Database, Unsubscribe, onValue, ref, update } from 'firebase/database';
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { CellInfo } from 'react-table';
import RealtimeDropdownInput from '../firebase/input/RealtimeDropdownInput';
import { RealtimeCheckedInputGroup, RealtimeTextAreaInput } from '../firebase/input/RealtimeInputs';
import './genomic-indicators-table.scss';
import { DeleteSectionButton } from 'app/pages/curation/button/DeleteSectionButton';
import DefaultBadge from '../badge/DefaultBadge';
import { DELETED_SECTION_TOOLTIP_OVERLAY } from 'app/pages/curation/BadgeGroup';
import { findNestedUuids, getFirebasePath, getMutationName, isSectionRemovableWithoutReview } from '../util/firebase/firebase-utils';
import { DANGER } from 'app/config/colors';
import { getHexColorWithAlpha } from '../util/utils';
import { parseFirebaseGenePath } from '../util/firebase/firebase-path-utils';
import GenomicIndicatorsHeader from 'app/pages/curation/header/GenomicIndicatorsHeader';
import { SentryError } from 'app/config/sentry-error';
import _ from 'lodash';

export interface IGenomicIndicatorsTableProps extends StoreProps {
  genomicIndicatorsPath: string;
}

const GenomicIndicatorsTable = ({
  genomicIndicatorsPath,
  firebaseDb,
  authStore,
  mutations,
  updateReviewableContent,
  updateGeneReviewUuid,
  updateMeta,
  fetchGenomicIndicators,
  readOnly,
  deleteFromArray,
}: IGenomicIndicatorsTableProps) => {
  const [genomicIndicatorKeys, setGenomicIndicatorKeys] = useState<string[]>([]);

  async function deleteGenomicIndicator(genomicIndicator: GenomicIndicator, arrayKey: string) {
    const name = authStore?.fullName ?? '';

    const pathDetails = parseFirebaseGenePath(`${genomicIndicatorsPath}/${arrayKey}/name`);
    const hugoSymbol = pathDetails?.hugoSymbol;
    const pathFromGene = pathDetails?.pathFromGene;

    const removeWithoutReview = isSectionRemovableWithoutReview(genomicIndicator.name_review);

    const review = new Review(name, undefined, undefined, true);

    if (!hugoSymbol) {
      throw new SentryError('Missing hugoSymbol in pathDetails', pathDetails ?? {});
    }

    if (removeWithoutReview) {
      const nestedUuids = findNestedUuids(genomicIndicator);
      try {
        await deleteFromArray?.(genomicIndicatorsPath, [arrayKey]);
        for (const id of nestedUuids) {
          await updateGeneReviewUuid?.(hugoSymbol, id, false, true);
        }
        return await fetchGenomicIndicators?.(genomicIndicatorsPath);
      } catch (error) {
        throw new SentryError('Failed to genomic indicator without review', { genomicIndicator, arrayKey });
      }
    }

    // Let the deletion be reviewed
    try {
      if (!firebaseDb) return;
      await update(ref(firebaseDb, `${getFirebasePath('GERMLINE_GENE', hugoSymbol)}`), {
        [`${pathFromGene}_review`]: review,
      });
      await updateMeta?.(hugoSymbol, genomicIndicator.name_uuid, true, true);
    } catch (error) {
      throw new SentryError('Failed to mark genomic indicator deletion for review', { genomicIndicator, arrayKey });
    }
  }

  useEffect(() => {
    if (!firebaseDb) {
      return;
    }
    const callbacks: Unsubscribe[] = [];
    callbacks.push(
      onValue(ref(firebaseDb, genomicIndicatorsPath), snapshot => {
        const data = snapshot.val() as GenomicIndicatorList;
        let newGenomicIndicatorKeys = [] as string[];
        if (data) {
          newGenomicIndicatorKeys = typeof data === 'object' ? Object.keys(data) : [];
        }

        if (!_.isEqual(newGenomicIndicatorKeys, genomicIndicatorKeys)) {
          setGenomicIndicatorKeys(newGenomicIndicatorKeys);
        }
      }),
    );

    fetchGenomicIndicators?.(genomicIndicatorsPath);

    return () => {
      callbacks.forEach(callback => callback?.());
    };
  }, [genomicIndicatorKeys, genomicIndicatorsPath, firebaseDb]);

  const columns: SearchColumn<{ arrayKey: string }>[] = [
    {
      Header: 'Name',
      width: 200,
      style: { overflow: 'visible', padding: 0 },
      Cell(cell: { arrayKey: string }) {
        return (
          <GenomicIndicatorNameCell
            genomicIndicatorsPath={genomicIndicatorsPath}
            firebaseArrayKey={cell.arrayKey}
            firebaseDb={firebaseDb!}
            buildCell={genomicIndicators => {
              const thisCellIndicator = genomicIndicators[index];

              let isDuplicateName = false;
              for (let i = 0; i < genomicIndicators.length; i++) {
                if (i !== index && thisCellIndicator.name === genomicIndicators[i]?.name) {
                  isDuplicateName = true;
                  break;
                }
              }

              return (
                <>
                  <RealtimeTextAreaInput
                    style={{ height: '60px', marginBottom: isDuplicateName ? 0 : undefined }}
                    firebasePath={`${genomicIndicatorsPath}/${cell.arrayKey}/name`}
                    label=""
                    disabled={thisCellIndicator.name_review?.removed || readOnly || false}
                    invalid={isDuplicateName}
                    invalidMessage="Name must be unique"
                  />
                </>
              );
            }}
          />
        );
      },
    },
    {
      Header: 'Allele State',
      style: { overflow: 'visible', padding: 0 },
      width: 200,
      Cell(cell: { arrayKey: string }) {
        const genomicIndicatorPath = `${genomicIndicatorsPath}/${cell.arrayKey}`;

        return (
          <GenomicIndicatorCell
            genomicIndicatorPath={genomicIndicatorPath}
            firebaseDb={firebaseDb!}
            buildCell={genomicIndicator => {
              return (
                <div style={{ lineHeight: 2 }}>
                  <RealtimeCheckedInputGroup
                    disabled={genomicIndicator.name_review?.removed || readOnly || false}
                    groupHeader={''}
                    options={[ALLELE_STATE.MONOALLELIC, ALLELE_STATE.BIALLELIC, ALLELE_STATE.MOSAIC, ALLELE_STATE.CARRIER].map(label => {
                      return {
                        label,
                        firebasePath: `${genomicIndicatorPath}/allele_state/${label.toLowerCase()}`,
                      };
                    })}
                  />
                </div>
              );
            }}
          />
        );
      },
    },
    {
      Header: 'Description',
      style: { overflow: 'visible', padding: 0 },
      Cell(cell: { arrayKey: string }) {
        const genomicIndicatorPath = `${genomicIndicatorsPath}/${cell.arrayKey}`;

        return (
          <GenomicIndicatorCell
            genomicIndicatorPath={genomicIndicatorPath}
            firebaseDb={firebaseDb!}
            buildCell={genomicIndicator => {
              return (
                <RealtimeTextAreaInput
                  style={{ height: '60px' }}
                  firebasePath={`${genomicIndicatorsPath}/${cell.arrayKey}/description`}
                  label=""
                  disabled={genomicIndicator.name_review?.removed || readOnly || false}
                />
              );
            }}
          />
        );
      },
    },
    {
      Header: 'Association Variants',
      style: { overflow: 'visible', padding: 0 },
      Cell(cell: { arrayKey: string }) {
        const genomicIndicatorPath = `${genomicIndicatorsPath}/${cell.arrayKey}`;
        return (
          <GenomicIndicatorCell
            genomicIndicatorPath={genomicIndicatorPath}
            firebaseDb={firebaseDb!}
            buildCell={genomicIndicator => {
              return (
                <RealtimeDropdownInput
                  styles={{
                    multiValueLabel: baseStyles => ({
                      ...baseStyles,
                      whiteSpace: 'normal',
                    }),
                  }}
                  placeholder="Select Variants"
                  isMulti
                  isDisabled={genomicIndicator.name_review?.removed || readOnly || false}
                  value={
                    Object.values(genomicIndicator.associationVariants ?? {})?.map(variant => {
                      const associatedMutation = Object.values(mutations ?? {})?.find(mutation => mutation.name_uuid === variant.uuid);
                      return { label: getMutationName(associatedMutation?.name, associatedMutation?.alterations), value: variant.uuid };
                    }) || []
                  }
                  options={[
                    ...(Object.values(mutations ?? {})?.map(mutation => ({
                      label: getMutationName(mutation.name, mutation.alterations),
                      value: mutation.name_uuid,
                    })) || []),
                  ]}
                  onChange={async (newValue: readonly { label: string; value: string }[]) => {
                    await updateReviewableContent?.(
                      `${genomicIndicatorPath}/associationVariants`,
                      genomicIndicator.associationVariants,
                      newValue.map(value => ({
                        name: value.label,
                        uuid: value.value,
                      })),
                      genomicIndicator.associationVariants_review,
                      genomicIndicator.associationVariants_uuid,
                    );
                    await fetchGenomicIndicators?.(genomicIndicatorsPath);
                  }}
                  noOptionsMessage={() => 'Please add this mutation in the Mutations List below first'}
                />
              );
            }}
          />
        );
      },
    },
    {
      disableHeaderFiltering: true,
      Header: 'Actions',
      width: 80,
      style: { padding: 0 },
      Cell(cell: { arrayKey: string }) {
        const genomicIndicatorPath = `${genomicIndicatorsPath}/${cell.arrayKey}`;

        return (
          <GenomicIndicatorCell
            genomicIndicatorPath={genomicIndicatorPath}
            firebaseDb={firebaseDb!}
            buildCell={genomicIndicator => {
              return genomicIndicator.name_review?.removed ? (
                <DefaultBadge color="danger" tooltipOverlay={DELETED_SECTION_TOOLTIP_OVERLAY}>
                  Deleted
                </DefaultBadge>
              ) : (
                <DeleteSectionButton
                  disabled={readOnly}
                  sectionName={genomicIndicator.name}
                  deleteHandler={() => {
                    deleteGenomicIndicator(genomicIndicator, cell.arrayKey);
                  }}
                  isRemovableWithoutReview={genomicIndicator.name_review?.added || false}
                />
              );
            }}
          />
        );
      },
    },
  ];

  return (
    <div className={'justify-content-between align-items-center mb-4'}>
      <GenomicIndicatorsHeader genomicIndicatorsPath={genomicIndicatorsPath} />
      {genomicIndicatorKeys.length > 0 ? (
        <div className="genomic-indicators">
          <OncoKBTable
            minRows={1}
            data={genomicIndicatorKeys.map(arrayKey => ({ arrayKey }))}
            columns={columns}
            disableSearch
            showPaginationBottom={false}
          />
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

const mapStoreToProps = ({
  firebaseAppStore,
  authStore,
  firebaseGeneReviewService,
  firebaseMetaService,
  firebaseMutationListStore,
  firebaseGenomicIndicatorsStore,
  curationPageStore,
  firebaseRepository,
}: IRootStore) => ({
  firebaseDb: firebaseAppStore.firebaseDb,
  authStore,
  updateReviewableContent: firebaseGeneReviewService.updateReviewableContent,
  updateGeneMetaContent: firebaseMetaService.updateGeneMetaContent,
  updateGeneReviewUuid: firebaseMetaService.updateGeneReviewUuid,
  mutations: firebaseMutationListStore.data,
  fetchGenomicIndicators: firebaseGenomicIndicatorsStore.fetchData,
  updateMeta: firebaseMetaService.updateMeta,
  readOnly: curationPageStore.readOnly,
  deleteFromArray: firebaseRepository.deleteFromArray,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(GenomicIndicatorsTable));

interface IGenomicIndicatorCellProps {
  genomicIndicatorPath: string;
  mutations?: MutationList;
  firebaseDb: Database;
  buildCell: (genomicIndicator: GenomicIndicator) => React.ReactNode;
}

function GenomicIndicatorCell({ genomicIndicatorPath, firebaseDb, buildCell }: IGenomicIndicatorCellProps) {
  const [genomicIndicator, setGenomicIndicator] = useState<GenomicIndicator | null>(null);

  useEffect(() => {
    const callbacks: Unsubscribe[] = [];
    callbacks.push(
      onValue(ref(firebaseDb, genomicIndicatorPath), snapshot => {
        setGenomicIndicator(snapshot.val());
      }),
    );

    return () => callbacks.forEach(callback => callback?.());
  }, [genomicIndicatorPath, firebaseDb]);

  function getCell() {
    if (!genomicIndicator) {
      return <></>;
    }

    return buildCell(genomicIndicator);
  }

  return (
    <div
      style={{
        padding: '7px 5px',
        height: '100%',
        backgroundColor: genomicIndicator?.name_review?.removed ? getHexColorWithAlpha(DANGER, 0.05) : undefined,
      }}
    >
      {getCell()}
    </div>
  );
}

interface IGenomicIndicatorNameCellProps {
  // this exists so the name cell only can have data about all genomic indicators
  genomicIndicatorsPath: string;
  firebaseArrayKey: string;
  firebaseDb: Database;
  buildCell: (genomicIndicators: GenomicIndicator[]) => React.ReactNode;
}

function GenomicIndicatorNameCell({ genomicIndicatorsPath, firebaseArrayKey, firebaseDb, buildCell }: IGenomicIndicatorNameCellProps) {
  const [genomicIndicators, setGenomicIndicators] = useState<GenomicIndicatorList | null>(null);

  useEffect(() => {
    const unsubscribe = onValue(ref(firebaseDb, genomicIndicatorsPath), snapshot => {
      setGenomicIndicators(snapshot.val());
    });

    return () => unsubscribe?.();
  }, [genomicIndicatorsPath, firebaseDb]);

  function getCell() {
    if (!genomicIndicators?.[firebaseIndex]) {
      return <></>;
    }

    return buildCell(genomicIndicators);
  }

  return (
    <div
      style={{
        padding: '7px 5px',
        height: '100%',
        backgroundColor: genomicIndicators?.[firebaseIndex]?.name_review?.removed ? getHexColorWithAlpha(DANGER, 0.05) : undefined,
      }}
    >
      {getCell()}
    </div>
  );
}
