import { ALLELE_STATE, PATHOGENIC_VARIANTS } from 'app/config/constants/firebase';
import { GenomicIndicator, Mutation, Review } from 'app/shared/model/firebase/firebase.model';
import OncoKBTable, { SearchColumn } from 'app/shared/table/OncoKBTable';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { Database, onValue, ref, update } from 'firebase/database';
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
import { Unsubscribe } from 'firebase/auth';

export interface IGenomicIndicatorsTableProps extends StoreProps {
  genomicIndicatorsPath: string;
}

const GenomicIndicatorsTable = ({
  genomicIndicatorsPath,
  firebaseDb,
  authStore,
  mutations,
  deleteGenomicIndicators,
  updateReviewableContent,
  updateGeneMetaContent,
  updateGeneReviewUuid,
  updateMeta,
  fetchGenomicIndicators,
}: IGenomicIndicatorsTableProps) => {
  const [genomicIndicatorsLength, setGenomicIndicatorsLength] = useState<number>(0);

  async function deleteGenomicIndicator(genomicIndicator: GenomicIndicator, index: number) {
    const name = authStore?.fullName;

    const pathDetails = parseFirebaseGenePath(`${genomicIndicatorsPath}/${index}/name`);
    const hugoSymbol = pathDetails?.hugoSymbol;
    const pathFromGene = pathDetails?.pathFromGene;

    const removeWithoutReview = isSectionRemovableWithoutReview(genomicIndicator?.name_review);

    const review = new Review(name ?? '', undefined, undefined, true);

    if (removeWithoutReview && hugoSymbol) {
      const nestedUuids = findNestedUuids(genomicIndicator);
      try {
        await deleteGenomicIndicators?.(genomicIndicatorsPath, [index]);
        for (const id of nestedUuids) {
          await updateGeneReviewUuid?.(hugoSymbol, id, false, true);
        }
        return await fetchGenomicIndicators?.(genomicIndicatorsPath);
      } catch (error) {
        throw new SentryError('Failed to genomic indicator without review', { genomicIndicator, index });
      }
    }

    // Let the deletion be reviewed
    try {
      if (firebaseDb && hugoSymbol) {
        await update(ref(firebaseDb, `${getFirebasePath('GERMLINE_GENE', hugoSymbol)}`), {
          [`${pathFromGene}_review`]: review,
        });
        await updateMeta?.(hugoSymbol, genomicIndicator.name_uuid, true, true);
      }
    } catch (error) {
      throw new SentryError('Failed to mark genomic indicator deletion for review', { genomicIndicator, index });
    }
  }

  useEffect(() => {
    const callbacks: Unsubscribe[] = [];
    if (firebaseDb) {
      callbacks.push(
        onValue(ref(firebaseDb, genomicIndicatorsPath), snapshot => {
          const data = snapshot.val();
          let newGenomicIndicatorsLength = 0;
          if (data) {
            newGenomicIndicatorsLength = typeof data === 'object' ? Object.keys(data).length : (data as []).length;
          }

          if (newGenomicIndicatorsLength !== genomicIndicatorsLength) {
            setGenomicIndicatorsLength(newGenomicIndicatorsLength);
          }
        }),
      );
    }
    fetchGenomicIndicators?.(genomicIndicatorsPath);

    return () => {
      callbacks.forEach(callback => callback?.());
    };
  }, [genomicIndicatorsLength, genomicIndicatorsPath, firebaseDb]);

  const columns: SearchColumn<GenomicIndicator>[] = [
    {
      Header: 'Name',
      width: 200,
      style: { overflow: 'visible', padding: 0 },
      Cell({ index }: CellInfo) {
        return (
          <>
            {firebaseDb && (
              <GenomicIndicatorNameCell
                genomicIndicatorsPath={genomicIndicatorsPath}
                firebaseIndex={index}
                firebaseDb={firebaseDb}
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
                        firebasePath={`${genomicIndicatorsPath}/${index}/name`}
                        label=""
                        disabled={thisCellIndicator.name_review?.removed || false}
                        invalid={isDuplicateName}
                        invalidMessage="Name must be unique"
                      />
                    </>
                  );
                }}
              />
            )}
          </>
        );
      },
    },
    {
      Header: 'Allele State',
      style: { overflow: 'visible', padding: 0 },
      width: 200,
      Cell({ index }: CellInfo) {
        const genomicIndicatorPath = `${genomicIndicatorsPath}/${index}`;

        return (
          <GenomicIndicatorCell
            genomicIndicatorPath={genomicIndicatorPath}
            firebaseDb={firebaseDb}
            buildCell={genomicIndicator => {
              return (
                <div style={{ lineHeight: 2 }}>
                  <RealtimeCheckedInputGroup
                    disabled={genomicIndicator.name_review?.removed || false}
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
      Cell({ index }: CellInfo) {
        const genomicIndicatorPath = `${genomicIndicatorsPath}/${index}`;

        return (
          <>
            {firebaseDb && (
              <GenomicIndicatorCell
                genomicIndicatorPath={genomicIndicatorPath}
                firebaseDb={firebaseDb}
                buildCell={genomicIndicator => {
                  return (
                    <RealtimeTextAreaInput
                      style={{ height: '60px' }}
                      firebasePath={`${genomicIndicatorsPath}/${index}/description`}
                      label=""
                      disabled={genomicIndicator.name_review?.removed || false}
                    />
                  );
                }}
              />
            )}
          </>
        );
      },
    },
    {
      Header: 'Association Variants',
      style: { overflow: 'visible', padding: 0 },
      Cell({ index }: CellInfo) {
        const genomicIndicatorPath = `${genomicIndicatorsPath}/${index}`;
        return (
          <>
            {firebaseDb && (
              <GenomicIndicatorCell
                genomicIndicatorPath={genomicIndicatorPath}
                firebaseDb={firebaseDb}
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
                      isDisabled={genomicIndicator.name_review?.removed || false}
                      value={
                        genomicIndicator.associationVariants?.map(variant => {
                          // remove when working on https://github.com/oncokb/oncokb-pipeline/issues/389
                          if (variant.uuid === PATHOGENIC_VARIANTS) {
                            return { label: PATHOGENIC_VARIANTS, value: variant.uuid };
                          }

                          const associatedMutation = mutations?.find(mutation => mutation.name_uuid === variant.uuid);
                          return { label: getMutationName(associatedMutation?.name, associatedMutation?.alterations), value: variant.uuid };
                        }) || []
                      }
                      options={[
                        {
                          label: PATHOGENIC_VARIANTS,
                          value: PATHOGENIC_VARIANTS,
                        },
                        ...(mutations?.map(mutation => ({
                          label: getMutationName(mutation.name, mutation.alterations),
                          value: mutation.name_uuid,
                        })) || []),
                      ]}
                      onChange={async newValue => {
                        if (genomicIndicator.associationVariants_review) {
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
                        }
                      }}
                      noOptionsMessage={() => 'Please add this mutation in the Mutations List below first'}
                    />
                  );
                }}
              />
            )}
          </>
        );
      },
    },
    {
      Header: 'Actions',
      width: 80,
      style: { padding: 0 },
      Cell({ index }: CellInfo) {
        const genomicIndicatorPath = `${genomicIndicatorsPath}/${index}`;

        return (
          <GenomicIndicatorCell
            genomicIndicatorPath={genomicIndicatorPath}
            firebaseDb={firebaseDb}
            buildCell={genomicIndicator => {
              return genomicIndicator.name_review?.removed ? (
                <DefaultBadge color="danger" text="Deleted" tooltipOverlay={DELETED_SECTION_TOOLTIP_OVERLAY} />
              ) : (
                <DeleteSectionButton
                  sectionName={genomicIndicator.name}
                  deleteHandler={() => {
                    deleteGenomicIndicator(genomicIndicator, index);
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
      {genomicIndicatorsLength > 0 ? (
        <div className="genomic-indicators">
          <OncoKBTable
            minRows={1}
            data={Array(genomicIndicatorsLength).fill(0)}
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
  firebaseGeneService,
  firebaseGeneReviewService,
  firebaseMetaService,
  firebaseMutationListStore,
  firebaseGenomicIndicatorsStore,
}: IRootStore) => ({
  firebaseDb: firebaseAppStore.firebaseDb,
  authStore,
  deleteGenomicIndicators: firebaseGeneService.deleteObjectsFromArray,
  updateReviewableContent: firebaseGeneReviewService.updateReviewableContent,
  updateGeneMetaContent: firebaseMetaService.updateGeneMetaContent,
  updateGeneReviewUuid: firebaseMetaService.updateGeneReviewUuid,
  mutations: firebaseMutationListStore.data,
  fetchGenomicIndicators: firebaseGenomicIndicatorsStore.fetchData,
  updateMeta: firebaseMetaService.updateMeta,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(GenomicIndicatorsTable));

interface IGenomicIndicatorCellProps {
  genomicIndicatorPath: string;
  mutations?: Mutation[];
  firebaseDb: Database | undefined;
  buildCell: (genomicIndicator: GenomicIndicator) => React.ReactNode;
}

function GenomicIndicatorCell({ genomicIndicatorPath, firebaseDb, buildCell }: IGenomicIndicatorCellProps) {
  const [genomicIndicator, setGenomicIndicator] = useState<GenomicIndicator | null>(null);

  useEffect(() => {
    if (firebaseDb) {
      const callbacks: Unsubscribe[] = [];
      callbacks.push(
        onValue(ref(firebaseDb, genomicIndicatorPath), snapshot => {
          setGenomicIndicator(snapshot.val());
        }),
      );

      return () => callbacks.forEach(callback => callback?.());
    }
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
  firebaseIndex: number;
  firebaseDb: Database;
  buildCell: (genomicIndicators: GenomicIndicator[]) => React.ReactNode;
}

function GenomicIndicatorNameCell({ genomicIndicatorsPath, firebaseIndex, firebaseDb, buildCell }: IGenomicIndicatorNameCellProps) {
  const [genomicIndicators, setGenomicIndicators] = useState<GenomicIndicator[] | null>(null);

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
