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
  mutationsPath: string;
}

const GenomicIndicatorsTable = ({
  genomicIndicatorsPath,
  mutationsPath,
  firebaseDb,
  firebaseDeleteFromArray,
  authStore,
  updateReviewableContent,
  updateGeneMetaContent,
  updateGeneReviewUuid,
}: IGenomicIndicatorsTableProps) => {
  const [genomicIndicatorsLength, setGenomicIndicatorsLength] = useState<number>(0);

  async function deleteGenomicIndicator(genomicIndicator: GenomicIndicator, index: number) {
    const name = authStore.fullName;

    const pathDetails = parseFirebaseGenePath(`${genomicIndicatorsPath}/${index}/name`);
    const hugoSymbol = pathDetails.hugoSymbol;
    const pathFromGene = pathDetails.pathFromGene;

    const removeWithoutReview = isSectionRemovableWithoutReview(genomicIndicator.name_review);

    const review = new Review(name, undefined, undefined, true);

    if (removeWithoutReview) {
      return firebaseDeleteFromArray(genomicIndicatorsPath, [index]);
    }

    // Let the deletion be reviewed
    return update(ref(firebaseDb, `${getFirebasePath('GERMLINE_GENE', hugoSymbol)}`), {
      [`${pathFromGene}_review`]: review,
    }).then(() => {
      updateGeneMetaContent(hugoSymbol, true);
      updateGeneReviewUuid(hugoSymbol, genomicIndicator.name_uuid, true, true);
    });
  }

  useEffect(() => {
    const callbacks = [];
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
      })
    );
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
            mutationsPath={mutationsPath}
            firebaseDb={firebaseDb}
            buildCell={(genomicIndicator, mutations) => {
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
                      label: getMutationName(mutation.name, mutation.alterations),
                      value: mutation.name_uuid,
                    })) || []),
                  ]}
                  onChange={(newValue: { label: string; value: string }[]) => {
                    updateReviewableContent(
                      `${genomicIndicatorPath}/associationVariants`,
                      genomicIndicator.associationVariants,
                      newValue.map(value => ({
                        name: value.label,
                        uuid: value.value,
                      })),
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

const mapStoreToProps = ({ firebaseStore, firebaseCrudStore, authStore, firebaseGeneReviewStore, firebaseMetaStore }: IRootStore) => ({
  firebaseDb: firebaseStore.firebaseDb,
  firebaseDeleteFromArray: firebaseCrudStore.deleteFromArray,
  authStore,
  updateReviewableContent: firebaseGeneReviewStore.updateReviewableContent,
  updateGeneMetaContent: firebaseMetaStore.updateGeneMetaContent,
  updateGeneReviewUuid: firebaseMetaStore.updateGeneReviewUuid,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(GenomicIndicatorsTable));

interface IGenomicIndicatorCellProps {
  genomicIndicatorPath: string;
  mutationsPath?: string;
  firebaseDb: Database;
  buildCell: (genomicIndicator: GenomicIndicator, mutations?: Mutation[]) => React.ReactNode;
}

function GenomicIndicatorCell({ genomicIndicatorPath, mutationsPath, firebaseDb, buildCell }: IGenomicIndicatorCellProps) {
  const [genomicIndicator, setGenomicIndicator] = useState<GenomicIndicator>(null);
  const [mutations, setMutations] = useState<Mutation[]>(null);

  useEffect(() => {
    const callbacks = [];
    callbacks.push(
      onValue(ref(firebaseDb, genomicIndicatorPath), snapshot => {
        setGenomicIndicator(snapshot.val());
      })
    );

    if (mutationsPath) {
      callbacks.push(
        onValue(ref(firebaseDb, mutationsPath), snapshot => {
          setMutations(snapshot.val());
        })
      );
    }

    return () => callbacks.forEach(callback => callback?.());
  }, [genomicIndicatorPath, firebaseDb, mutationsPath]);

  function getCell() {
    if (!genomicIndicator) {
      return <></>;
    }

    return buildCell(genomicIndicator, mutations);
  }

  return (
    <div
      style={{
        padding: '7px 5px',
        height: '100%',
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
        backgroundColor: genomicIndicators?.[firebaseIndex]?.name_review?.removed ? getHexColorWithAlpha(DANGER, 0.05) : null,
      }}
    >
      {getCell()}
    </div>
  );
}
