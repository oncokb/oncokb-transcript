import React from 'react';
import Collapsible from './Collapsible';
import { IRootStore } from 'app/stores';
import { componentInject } from 'app/shared/util/typed-inject';
import { observer } from 'mobx-react';
import { DX_LEVELS, Mutation, PX_LEVELS, TX_LEVELS } from 'app/shared/model/firebase/firebase.model';
import { buildFirebaseGenePath } from 'app/shared/util/firebase/firebase-path-utils';
import { getMutationName, getTxName, isSectionEmpty, isSectionRemovableWithoutReview } from 'app/shared/util/firebase/firebase-utils';
import { NestLevelColor, NestLevelMapping, NestLevelType } from './NestLevel';
import MutationLevelSummary from '../nestLevelSummary/MutationLevelSummary';
import { DeleteSectionButton } from '../button/DeleteSectionButton';
import GeneHistoryTooltip from 'app/components/geneHistoryTooltip/GeneHistoryTooltip';
import { ParsedHistoryRecord } from '../CurationPage';
import { RealtimeCheckedInputGroup, RealtimeTextAreaInput } from 'app/shared/firebase/input/FirebaseRealtimeInput';
import { MUTATION_EFFECT_OPTIONS, ONCOGENICITY_OPTIONS } from 'app/config/constants/firebase';
import styles from './styles.module.scss';
import { AutoParseRefField } from 'app/shared/form/AutoParseRefField';
import { CANCER_TYPE_THERAPY_INDENTIFIER, GERMLINE_INHERITANCE_MECHANISM, PATHOGENICITY, PENETRANCE } from 'app/config/constants/constants';
import { getCancerTypeName } from 'app/shared/util/utils';
import CancerTypeLevelSummary from '../nestLevelSummary/CancerTypeLevelSummary';
import RealtimeDropdownInput from 'app/shared/firebase/input/RealtimeDropdownInput';

export interface IMutationCollapsibleProps extends StoreProps {
  mutation: Mutation;
  firebaseIndex: number;
  parsedHistoryList: Map<string, ParsedHistoryRecord[]>;
}

const MutationCollapsible = ({
  data,
  hugoSymbol,
  deleteSection,
  drugList,
  mutation,
  firebaseIndex,
  parsedHistoryList,
}: IMutationCollapsibleProps) => {
  const title = getMutationName(mutation);
  const mutationFirebasePath = buildFirebaseGenePath(hugoSymbol, `mutations/${firebaseIndex}`);
  const showMutationLevelSummary = !title.includes(',');

  return (
    <Collapsible
      className={'mb-1'}
      title={title}
      borderLeftColor={NestLevelColor[NestLevelMapping[NestLevelType.MUTATION]]}
      info={showMutationLevelSummary ? <MutationLevelSummary mutationUuid={mutation.name_uuid} /> : null}
      action={
        <>
          <span>
            <GeneHistoryTooltip key={'gene-history-tooltip'} historyData={parsedHistoryList} location={getMutationName(mutation)} />
          </span>
          <div className="mr-3" />
          <DeleteSectionButton
            sectionName={title}
            deleteHandler={() => deleteSection(NestLevelType.MUTATION, mutationFirebasePath)}
            isRemovableWithoutReview={isSectionRemovableWithoutReview(data, NestLevelType.MUTATION, mutationFirebasePath)}
          />
        </>
      }
      isSectionEmpty={isSectionEmpty(data, mutationFirebasePath)}
    >
      <Collapsible
        open
        title="Mutation Effect"
        borderLeftColor={NestLevelColor[NestLevelMapping[NestLevelType.MUTATION_EFFECT]]}
        isSectionEmpty={isSectionEmpty(data, buildFirebaseGenePath(hugoSymbol, `mutations/${firebaseIndex}/mutation_effect`))}
      >
        <Collapsible
          open
          title="Somatic"
          borderLeftColor={NestLevelColor[NestLevelMapping[NestLevelType.SOMATIC]]}
          isSectionEmpty={isSectionEmpty(data, buildFirebaseGenePath(hugoSymbol, `mutations/${firebaseIndex}/mutation_effect/oncogenic`))}
        >
          <RealtimeCheckedInputGroup
            groupHeader={
              <>
                <span style={{ marginRight: '8px' }}>Oncogenic</span>
                {
                  <GeneHistoryTooltip
                    historyData={parsedHistoryList}
                    location={`${getMutationName(mutation)}, Mutation Effect`}
                    contentFieldWhenObject="oncogenic"
                  />
                }
              </>
            }
            isRadio
            options={ONCOGENICITY_OPTIONS.map(label => ({
              label,
              fieldKey: `mutations/${firebaseIndex}/mutation_effect/oncogenic`,
            }))}
          />
          <RealtimeCheckedInputGroup
            groupHeader={
              <>
                <span style={{ marginRight: '8px' }}>Mutation Effect</span>
                {
                  <GeneHistoryTooltip
                    historyData={parsedHistoryList}
                    location={`${getMutationName(mutation)}, Mutation Effect`}
                    contentFieldWhenObject="effect"
                  />
                }
              </>
            }
            isRadio
            options={MUTATION_EFFECT_OPTIONS.map(label => ({
              label,
              fieldKey: `mutations/${firebaseIndex}/mutation_effect/effect`,
            }))}
          />
          <RealtimeTextAreaInput
            fieldKey={`mutations/${firebaseIndex}/mutation_effect/description`}
            inputClass={styles.textarea}
            label="Description of Evidence"
            labelIcon={<GeneHistoryTooltip historyData={parsedHistoryList} location={`${getMutationName(mutation)}, Mutation Effect`} />}
            name="description"
          />
          <div className="mb-2">
            <AutoParseRefField summary={mutation.mutation_effect.description} />
          </div>
        </Collapsible>
        {mutation.mutation_effect.germline && (
          <Collapsible
            open
            className={'mt-2'}
            title={'Germline'}
            borderLeftColor={NestLevelColor[NestLevelMapping[NestLevelType.GERMLINE]]}
            isSectionEmpty={isSectionEmpty(data, buildFirebaseGenePath(hugoSymbol, `mutations/${firebaseIndex}/mutation_effect/germline`))}
          >
            <RealtimeCheckedInputGroup
              groupHeader="Pathogenic"
              isRadio
              options={[
                PATHOGENICITY.PATHOGENIC,
                PATHOGENICITY.LIKELY_PATHOGENIC,
                PATHOGENICITY.BENIGN,
                PATHOGENICITY.LIKELY_BENIGN,
                PATHOGENICITY.UNKNOWN,
              ].map(label => ({
                label,
                fieldKey: `mutations/${firebaseIndex}/mutation_effect/germline/pathogenic`,
              }))}
            />
            <RealtimeCheckedInputGroup
              groupHeader="Penetrance"
              isRadio
              options={[PENETRANCE.HIGH, PENETRANCE.INTERMEDIATE, PENETRANCE.LOW, PENETRANCE.OTHER].map(label => ({
                label,
                fieldKey: `mutations/${firebaseIndex}/mutation_effect/germline/penetrance`,
              }))}
            />
            <RealtimeCheckedInputGroup
              groupHeader="Mechanism of Inheritance"
              isRadio
              options={[GERMLINE_INHERITANCE_MECHANISM.RECESSIVE, GERMLINE_INHERITANCE_MECHANISM.DOMINANT].map(label => ({
                label,
                fieldKey: `mutations/${firebaseIndex}/mutation_effect/germline/inheritanceMechanism`,
              }))}
            />
            <RealtimeTextAreaInput
              fieldKey={`mutations/${firebaseIndex}/mutation_effect/germline/cancerRisk`}
              inputClass={styles.textarea}
              label="Cancer Risk"
              name="cancerRisk"
            />
          </Collapsible>
        )}
      </Collapsible>
      {mutation.tumors?.map((tumor, tumorIndex) => {
        const cancerTypeName = tumor.cancerTypes.map(cancerType => getCancerTypeName(cancerType)).join(', ');
        const cancerTypeFirebasePath = buildFirebaseGenePath(hugoSymbol, `mutations/${firebaseIndex}/tumors/${tumorIndex}`);

        return (
          <Collapsible
            className={'mt-2'}
            key={tumor.cancerTypes_uuid}
            title={`Cancer Type: ${cancerTypeName}`}
            borderLeftColor={NestLevelColor[NestLevelMapping[NestLevelType.CANCER_TYPE]]}
            info={<CancerTypeLevelSummary mutationUuid={mutation.name_uuid} cancerTypeUuid={tumor.cancerTypes_uuid} />}
            action={
              <>
                <span>
                  <GeneHistoryTooltip key={'gene-history-tooltip'} historyData={parsedHistoryList} location={getMutationName(mutation)} />
                </span>
                <div className="mr-3" />
                <DeleteSectionButton
                  sectionName={title}
                  deleteHandler={() => deleteSection(NestLevelType.CANCER_TYPE, cancerTypeFirebasePath)}
                  isRemovableWithoutReview={isSectionRemovableWithoutReview(data, NestLevelType.CANCER_TYPE, cancerTypeFirebasePath)}
                />
              </>
            }
            isSectionEmpty={isSectionEmpty(data, cancerTypeFirebasePath)}
          >
            <RealtimeTextAreaInput
              fieldKey={`mutations/${firebaseIndex}/tumors/${tumorIndex}/summary`}
              inputClass={styles.summaryTextarea}
              label="Therapeutic Summary (Optional)"
              labelIcon={
                <GeneHistoryTooltip
                  historyData={parsedHistoryList}
                  location={`${getMutationName(mutation)}, ${cancerTypeName}, Tumor Type Summary`}
                />
              }
              name="txSummary"
            />
            <RealtimeTextAreaInput
              fieldKey={`mutations/${firebaseIndex}/tumors/${tumorIndex}/diagnosticSummary`}
              inputClass={styles.summaryTextarea}
              label="Diagnostic Summary (Optional)"
              labelIcon={
                <GeneHistoryTooltip
                  historyData={parsedHistoryList}
                  location={`${getMutationName(mutation)}, ${cancerTypeName}, Diagnostic Summary`}
                />
              }
              name="dxSummary"
            />
            <RealtimeTextAreaInput
              fieldKey={`mutations/${firebaseIndex}/tumors/${tumorIndex}/prognosticSummary`}
              inputClass={styles.summaryTextarea}
              label="Prognostic Summary (Optional)"
              labelIcon={
                <GeneHistoryTooltip
                  historyData={parsedHistoryList}
                  location={`${getMutationName(mutation)}, ${cancerTypeName}, Prognostic Summary`}
                />
              }
              name="pxSummary"
            />
            <Collapsible
              className={'mt-2'}
              key={tumor.diagnostic_uuid}
              title="Diagnostic Implication"
              borderLeftColor={NestLevelColor[NestLevelMapping[NestLevelType.DIAGNOSTIC]]}
              isSectionEmpty={isSectionEmpty(
                data,
                buildFirebaseGenePath(hugoSymbol, `mutations/${firebaseIndex}/tumors/${tumorIndex}/diagnostic`)
              )}
            >
              <RealtimeDropdownInput
                fieldKey={`mutations/${firebaseIndex}/tumors/${tumorIndex}/diagnostic/level`}
                label="Level of evidence"
                name="level"
                options={[DX_LEVELS.LEVEL_DX1, DX_LEVELS.LEVEL_DX2, DX_LEVELS.LEVEL_DX3]}
              />
              <RealtimeTextAreaInput
                fieldKey={`mutations/${firebaseIndex}/tumors/${tumorIndex}/diagnostic/description`}
                inputClass={styles.textarea}
                label="Description of Evidence"
                name="evidenceDescription"
              />
              <div className="mb-2">
                <AutoParseRefField summary={tumor.diagnostic.description} />
              </div>
            </Collapsible>
            <Collapsible
              className={'mt-2'}
              key={tumor.prognostic_uuid}
              title="Prognostic Implication"
              borderLeftColor={NestLevelColor[NestLevelMapping[NestLevelType.PROGNOSTIC]]}
              isSectionEmpty={isSectionEmpty(
                data,
                buildFirebaseGenePath(hugoSymbol, `mutations/${firebaseIndex}/tumors/${tumorIndex}/prognostic`)
              )}
            >
              <RealtimeDropdownInput
                fieldKey={`mutations/${firebaseIndex}/tumors/${tumorIndex}/prognostic/level`}
                label="Level of evidence"
                name="level"
                options={[PX_LEVELS.LEVEL_PX1, PX_LEVELS.LEVEL_PX2, PX_LEVELS.LEVEL_PX3]}
              />
              <RealtimeTextAreaInput
                fieldKey={`mutations/${firebaseIndex}/tumors/${tumorIndex}/prognostic/description`}
                inputClass={styles.textarea}
                label="Description of Evidence"
                name="evidenceDescription"
              />
              <div className="mb-2">
                <AutoParseRefField summary={tumor.prognostic.description} />
              </div>
            </Collapsible>
            {tumor.TIs.reduce((accumulator, ti, tiIndex) => {
              if (!ti.treatments) {
                return accumulator;
              }
              return accumulator.concat(
                ti.treatments.map((treatment, treatmentIndex) => {
                  const therapyFirebasePath = buildFirebaseGenePath(
                    hugoSymbol,
                    `mutations/${firebaseIndex}/tumors/${tumorIndex}/TIs/${tiIndex}/treatments/${treatmentIndex}`
                  );

                  return (
                    <Collapsible
                      className={'mt-2'}
                      key={tumor.cancerTypes_uuid}
                      title={`Therapy: ${getTxName(drugList, treatment.name)}`}
                      borderLeftColor={NestLevelColor[NestLevelMapping[NestLevelType.THERAPY]]}
                      action={
                        <DeleteSectionButton
                          sectionName={title}
                          deleteHandler={() => deleteSection(NestLevelType.THERAPY, therapyFirebasePath)}
                          isRemovableWithoutReview={isSectionRemovableWithoutReview(data, NestLevelType.THERAPY, therapyFirebasePath)}
                        />
                      }
                      isSectionEmpty={isSectionEmpty(data, therapyFirebasePath)}
                    >
                      <RealtimeDropdownInput
                        fieldKey={`mutations/${firebaseIndex}/tumors/${tumorIndex}/TIs/${tiIndex}/treatments/${treatmentIndex}/level`}
                        label="Highest level of evidence"
                        name="level"
                        options={[TX_LEVELS.LEVEL_NO, TX_LEVELS.LEVEL_1, TX_LEVELS.LEVEL_2]}
                      />
                      <RealtimeDropdownInput
                        fieldKey={`mutations/${firebaseIndex}/tumors/${tumorIndex}/TIs/${tiIndex}/treatments/${treatmentIndex}/propagation`}
                        label="Level of Evidence in other solid tumor types"
                        name="propagationLevel"
                        options={[]} // Todo
                      />
                      <RealtimeDropdownInput
                        fieldKey={`mutations/${firebaseIndex}/tumors/${tumorIndex}/TIs/${tiIndex}/treatments/${treatmentIndex}/propagationLiquid`}
                        label="Level of Evidence in other liquid tumor types"
                        name="propagationLiquidLevel"
                        options={[]}
                      />
                      <RealtimeDropdownInput
                        fieldKey={`mutations/${firebaseIndex}/tumors/${tumorIndex}/TIs/${tiIndex}/treatments/${treatmentIndex}/fdaLevel`}
                        label="FDA Level of Evidence"
                        name="propagationLiquidLevel"
                        options={[]}
                      />
                      <RealtimeTextAreaInput
                        fieldKey={`mutations/${firebaseIndex}/tumors/${tumorIndex}/TIs/${tiIndex}/treatments/${treatmentIndex}/description`}
                        inputClass={styles.textarea}
                        label="Description of Evidence"
                        labelIcon={
                          <GeneHistoryTooltip
                            historyData={parsedHistoryList}
                            location={`${CANCER_TYPE_THERAPY_INDENTIFIER}${getMutationName(mutation)}, ${cancerTypeName}, ${
                              treatment.name
                            }`}
                          />
                        }
                        name="evidenceDescription"
                      />
                      <div className="mb-2">
                        <AutoParseRefField summary={treatment.description} />
                      </div>
                    </Collapsible>
                  );
                })
              );
            }, [])}
          </Collapsible>
        );
      })}
    </Collapsible>
  );
};

const mapStoreToProps = ({ firebaseGeneStore, firebaseDrugsStore }: IRootStore) => ({
  data: firebaseGeneStore.data,
  hugoSymbol: firebaseGeneStore.hugoSymbol,
  deleteSection: firebaseGeneStore.deleteSection,
  drugList: firebaseDrugsStore.drugList,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(MutationCollapsible));
