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
import { getFirebasePath, getMutationName, isSectionRemovableWithoutReview } from '../util/firebase/firebase-utils';
import { DANGER } from 'app/config/colors';
import { getHexColorWithAlpha } from '../util/utils';
import { parseFirebaseGenePath } from '../util/firebase/firebase-path-utils';
import GenomicIndicatorsHeader from 'app/pages/curation/header/GenomicIndicatorsHeader';

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
}: IGenomicIndicatorsTableProps) => {
  const [genomicIndicatorsLength, setGenomicIndicatorsLength] = useState<number>(0);

  async function deleteGenomicIndicator(genomicIndicator: GenomicIndicator, index: number) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const name = authStore.fullName;

    const pathDetails = parseFirebaseGenePath(`${genomicIndicatorsPath}/${index}/name`);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const hugoSymbol = pathDetails.hugoSymbol;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const pathFromGene = pathDetails.pathFromGene;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const removeWithoutReview = isSectionRemovableWithoutReview(genomicIndicator.name_review);

    const review = new Review(name, undefined, undefined, true);

    if (removeWithoutReview) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return deleteGenomicIndicators(genomicIndicatorsPath, [index]);
    }

    // Let the deletion be reviewed
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return update(ref(firebaseDb, `${getFirebasePath('GERMLINE_GENE', hugoSymbol)}`), {
      [`${pathFromGene}_review`]: review,
    }).then(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      updateGeneMetaContent(hugoSymbol, true);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      updateGeneReviewUuid(hugoSymbol, genomicIndicator.name_uuid, true, true);
    });
  }

  useEffect(() => {
    const callbacks = [];
    callbacks.push(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      onValue(ref(firebaseDb, genomicIndicatorsPath), snapshot => {
        const data = snapshot.val();
        let newGenomicIndicatorsLength = 0;
        if (data) {
          newGenomicIndicatorsLength = typeof data === 'object' ? Object.keys(data).length : (data as []).length;
        }

        if (newGenomicIndicatorsLength !== genomicIndicatorsLength) {
          setGenomicIndicatorsLength(newGenomicIndicatorsLength);
        }
      })
    );
    return () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
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
          <GenomicIndicatorNameCell
            genomicIndicatorsPath={genomicIndicatorsPath}
            firebaseIndex={index}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
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
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    style={{ height: '60px', marginBottom: isDuplicateName ? 0 : null }}
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
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            firebaseDb={firebaseDb}
            buildCell={genomicIndicator => {
              return (
                <div style={{ lineHeight: 2 }}>
                  <RealtimeCheckedInputGroup
                    disabled={genomicIndicator.name_review?.removed || false}
                    groupHeader={''}
                    options={[ALLELE_STATE.MONOALLELIC, ALLELE_STATE.BIALLELIC, ALLELE_STATE.MOSAIC].map(label => {
                      return {
                        label,
                        firebasePath: `${genomicIndicatorPath}/${label.toLowerCase()}`,
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
          <GenomicIndicatorCell
            genomicIndicatorPath={genomicIndicatorPath}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
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
        );
      },
    },
    {
      Header: 'Association Variants',
      style: { overflow: 'visible', padding: 0 },
      Cell({ index }: CellInfo) {
        const genomicIndicatorPath = `${genomicIndicatorsPath}/${index}`;

        return (
          <GenomicIndicatorCell
            genomicIndicatorPath={genomicIndicatorPath}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
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
                  value={genomicIndicator.associationVariants?.map(variant => ({ label: variant.name, value: variant.uuid })) || []}
                  options={[
                    {
                      label: PATHOGENIC_VARIANTS,
                      value: PATHOGENIC_VARIANTS,
                    },
                    ...(mutations?.map(mutation => ({
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore
                      label: getMutationName(mutation.name, mutation.alterations),
                      value: mutation.name_uuid,
                    })) || []),
                  ]}
                  onChange={(newValue: { label: string; value: string }[]) => {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    updateReviewableContent(
                      `${genomicIndicatorPath}/associationVariants`,
                      genomicIndicator.associationVariants,
                      newValue.map(value => ({
                        name: value.label,
                        uuid: value.value,
                      })),
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore
                      genomicIndicator.associationVariants_review,
                      genomicIndicator.associationVariants_uuid
                    );
                  }}
                />
              );
            }}
          />
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
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
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
}: IRootStore) => ({
  firebaseDb: firebaseAppStore.firebaseDb,
  authStore,
  deleteGenomicIndicators: firebaseGeneService.deleteObjectsFromArray,
  updateReviewableContent: firebaseGeneReviewService.updateReviewableContent,
  updateGeneMetaContent: firebaseMetaService.updateGeneMetaContent,
  updateGeneReviewUuid: firebaseMetaService.updateGeneReviewUuid,
  mutations: firebaseMutationListStore.data,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(GenomicIndicatorsTable));

interface IGenomicIndicatorCellProps {
  genomicIndicatorPath: string;
  mutations?: Mutation[];
  firebaseDb: Database;
  buildCell: (genomicIndicator: GenomicIndicator) => React.ReactNode;
}

function GenomicIndicatorCell({ genomicIndicatorPath, firebaseDb, buildCell }: IGenomicIndicatorCellProps) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const [genomicIndicator, setGenomicIndicator] = useState<GenomicIndicator>(null);

  useEffect(() => {
    const callbacks = [];
    callbacks.push(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      onValue(ref(firebaseDb, genomicIndicatorPath), snapshot => {
        setGenomicIndicator(snapshot.val());
      })
    );

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        backgroundColor: genomicIndicator?.name_review?.removed ? getHexColorWithAlpha(DANGER, 0.05) : null,
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
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const [genomicIndicators, setGenomicIndicators] = useState<GenomicIndicator[]>(null);

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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        backgroundColor: genomicIndicators?.[firebaseIndex]?.name_review?.removed ? getHexColorWithAlpha(DANGER, 0.05) : null,
      }}
    >
      {getCell()}
    </div>
  );
}
