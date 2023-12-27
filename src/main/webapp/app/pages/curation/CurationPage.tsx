import React, { useEffect, useMemo, useState } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { Col, Input, Row } from 'reactstrap';
import { IRootStore } from 'app/stores';
import LoadingIndicator, { LoaderSize } from 'app/oncokb-commons/components/loadingIndicator/LoadingIndicator';
import {
  CANCER_TYPE_THERAPY_INDENTIFIER,
  CBIOPORTAL,
  COSMIC,
  GERMLINE_INHERITANCE_MECHANISM,
  MUTATION_EFFECT,
  PAGE_ROUTE,
  PATHOGENICITY,
  PENETRANCE,
} from 'app/config/constants/constants';
import { PubmedGeneLink } from 'app/shared/links/PubmedGeneLink';
import { InlineDivider, PubmedGeneArticlesLink } from 'app/shared/links/PubmedGeneArticlesLink';
import { getCancerTypeName, getSectionClassName } from 'app/shared/util/utils';
import ExternalLinkIcon from 'app/shared/icons/ExternalLinkIcon';
import WithSeparator from 'react-with-separator';
import { AutoParseRefField } from 'app/shared/form/AutoParseRefField';
import { RealtimeCheckedInputGroup, RealtimeTextAreaInput } from 'app/shared/firebase/input/FirebaseRealtimeInput';
import { getFirebasePath, getMutationName, getTxName } from 'app/shared/util/firebase/firebase-utils';
import Collapsible, { NestLevelType } from 'app/pages/curation/collapsible/Collapsible';
import styles from './styles.module.scss';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import { FIREBASE_ONCOGENICITY, HistoryRecord, TX_LEVELS } from 'app/shared/model/firebase/firebase.model';
import RealtimeDropdownInput from 'app/shared/firebase/input/RealtimeDropdownInput';
import { GENE_TYPE, GENE_TYPE_KEY } from 'app/config/constants/firebase';
import GeneHistoryTooltip from 'app/components/geneHistoryTooltip/GeneHistoryTooltip';
import VusTable from '../../shared/table/VusTable';

export interface ICurationPageProps extends StoreProps, RouteComponentProps<{ hugoSymbol: string }> {}

export type ParsedHistoryRecord = { record: HistoryRecord; timestamp: string; admin: string };

const CurationPage = (props: ICurationPageProps) => {
  const history = useHistory();
  const hugoSymbol = props.match.params.hugoSymbol;
  const firebaseGenePath = getFirebasePath('GENE', hugoSymbol);
  const firebaseHistoryPath = getFirebasePath('HISTORY', hugoSymbol);
  const [mutationFilter, setMutationFilter] = useState('');

  useEffect(() => {
    props.findAllGeneEntities(hugoSymbol);
    const cleanupCallbacks = [];
    cleanupCallbacks.push(props.addListener(firebaseGenePath));
    cleanupCallbacks.push(props.addDrugListListener());
    cleanupCallbacks.push(props.addHistoryListener(firebaseHistoryPath));
    cleanupCallbacks.push(() => props.updateCollaborator(hugoSymbol, false));
    cleanupCallbacks.push(props.addMetaCollaboratorsListener());
    return () => {
      cleanupCallbacks.forEach(callback => callback && callback());
    };
  }, []);

  const geneEntity = useMemo(() => {
    return props.entities.find(gene => gene.hugoSymbol === hugoSymbol);
  }, [props.entities]);

  useEffect(() => {
    if (props.metaCollaboratorsData && props.data?.name) {
      props.updateCollaborator(hugoSymbol, true).catch(error => {
        notifyError(error);
        history.push(PAGE_ROUTE.CURATION);
      });
    }
  }, [props.metaCollaboratorsData, props.data]);

  const parsedHistoryList = useMemo(() => {
    if (!props.historyData) {
      return;
    }

    const newList = new Map<string, ParsedHistoryRecord[]>();

    for (const historyData of Object.values(props.historyData)) {
      try {
        for (const record of historyData.records) {
          if (!newList.has(record.location)) {
            newList.set(record.location, []);
          }
          newList.get(record.location).push({ record, timestamp: historyData.timeStamp, admin: historyData.admin });
        }
      } catch {
        continue;
      }
    }

    return newList;
  }, [props.historyData]);

  return !!props.data && props.drugList && !!geneEntity ? (
    <div>
      <Row>
        <Col>
          <h2>Gene: {props.data.name}</h2>
        </Col>
      </Row>
      <Row className={`${getSectionClassName()} justify-content-between`}>
        <Col>
          <div className={'d-flex mb-2'}>
            <div>
              <span className="font-weight-bold">Entrez Gene:</span>
              <span className="ml-1">
                <PubmedGeneLink entrezGeneId={geneEntity.entrezGeneId} />
              </span>
            </div>
            <div className="ml-2">
              <span className="font-weight-bold">Gene aliases:</span>
              <span className="ml-1">
                <PubmedGeneArticlesLink hugoSymbols={geneEntity.geneAliases?.map(alias => alias.name)} />
              </span>
            </div>
          </div>
          <RealtimeTextAreaInput
            fieldKey="summary"
            label="Summary"
            labelIcon={<GeneHistoryTooltip historyData={parsedHistoryList} location={'Gene Summary'} />}
          />
          <RealtimeCheckedInputGroup
            groupHeader={
              <>
                <span className="mr-2">Gene Type</span>
                {<GeneHistoryTooltip historyData={parsedHistoryList} location={'Gene Type'} />}
              </>
            }
            options={[GENE_TYPE.TUMOR_SUPPRESSOR, GENE_TYPE.ONCOGENE].map(label => {
              return {
                label,
                fieldKey: GENE_TYPE_KEY[label],
              };
            })}
          />
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <RealtimeCheckedInputGroup
            groupHeader="Penetrance"
            isRadio
            options={[PENETRANCE.HIGH, PENETRANCE.INTERMEDIATE, PENETRANCE.LOW, PENETRANCE.OTHER].map(label => {
              return {
                label,
                fieldKey: 'penetrance',
              };
            })}
          />
        </Col>
      </Row>
      <Row className={'mb-5'}>
        <Col>
          <RealtimeTextAreaInput
            fieldKey="background"
            inputClass={styles.textarea}
            label="Background"
            name="geneBackground"
            labelIcon={<GeneHistoryTooltip historyData={parsedHistoryList} location={'Gene Background'} />}
          />
          <div className="mb-2">
            <AutoParseRefField summary={props.data.background} />
          </div>
          <div>
            <span className="font-weight-bold mr-2">External Links:</span>
            <WithSeparator separator={InlineDivider}>
              <a href={`https://cbioportal.mskcc.org/ln?q=${props.data.name}`} target="_blank" rel="noopener noreferrer">
                {CBIOPORTAL} <ExternalLinkIcon />
              </a>
              <a href={`http://cancer.sanger.ac.uk/cosmic/gene/overview?ln=${props.data.name}`} target="_blank" rel="noopener noreferrer">
                {COSMIC} <ExternalLinkIcon />
              </a>
            </WithSeparator>
          </div>
        </Col>
      </Row>
      {props.data.mutations && (
        <div className={'mb-5'}>
          <Row>
            <Col>
              <div className={'d-flex justify-content-between align-items-center mb-2'}>
                <div className={'h5'}>Mutations:</div>
                <div>
                  <Input placeholder={'Search Mutation'} value={mutationFilter} onChange={event => setMutationFilter(event.target.value)} />
                </div>
              </div>
            </Col>
          </Row>
          {props.data.mutations
            .filter(mutation => {
              return !mutationFilter || getMutationName(mutation).toLowerCase().includes(mutationFilter.toLowerCase());
            })
            .map((mutation, mutationIndex) => (
              <Row key={mutationIndex} className={'mb-2'}>
                <Col>
                  <Collapsible
                    nestLevel={NestLevelType.MUTATION}
                    className={'mb-1'}
                    title={`Mutation: ${getMutationName(mutation)}`}
                    mutationUuid={mutation.name_uuid}
                    actions={[
                      <GeneHistoryTooltip
                        key={'gene-history-tooltip'}
                        historyData={parsedHistoryList}
                        location={getMutationName(mutation)}
                      />,
                    ]}
                    geneFieldKey={`mutations/${mutationIndex}`}
                  >
                    <Collapsible
                      nestLevel={NestLevelType.MUTATION_EFFECT}
                      title={'Mutation Effect'}
                      geneFieldKey={`mutations/${mutationIndex}/mutation_effect`}
                    >
                      <Collapsible
                        nestLevel={NestLevelType.SOMATIC}
                        title={'Somatic'}
                        geneFieldKey={`mutations/${mutationIndex}/mutation_effect/oncogenic`}
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
                          options={[
                            FIREBASE_ONCOGENICITY.YES,
                            FIREBASE_ONCOGENICITY.LIKELY,
                            FIREBASE_ONCOGENICITY.LIKELY_NEUTRAL,
                            FIREBASE_ONCOGENICITY.INCONCLUSIVE,
                            FIREBASE_ONCOGENICITY.RESISTANCE,
                          ].map(label => ({
                            label,
                            fieldKey: `mutations/${mutationIndex}/mutation_effect/oncogenic`,
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
                          options={[
                            MUTATION_EFFECT.GAIN_OF_FUNCTION,
                            MUTATION_EFFECT.LIKELY_GAIN_OF_FUNCTION,
                            MUTATION_EFFECT.LOSS_OF_FUNCTION,
                            MUTATION_EFFECT.LIKELY_LOSS_OF_FUNCTION,
                            MUTATION_EFFECT.SWITCH_OF_FUNCTION,
                            MUTATION_EFFECT.LIKELY_SWITCH_OF_FUNCTION,
                            MUTATION_EFFECT.NEUTRAL,
                            MUTATION_EFFECT.LIKELY_NEUTRAL,
                            MUTATION_EFFECT.INCONCLUSIVE,
                          ].map(label => ({
                            label,
                            fieldKey: `mutations/${mutationIndex}/mutation_effect/effect`,
                          }))}
                        />
                        <RealtimeTextAreaInput
                          fieldKey={`mutations/${mutationIndex}/mutation_effect/description`}
                          inputClass={styles.textarea}
                          label="Description of Evidence"
                          labelIcon={
                            <GeneHistoryTooltip
                              historyData={parsedHistoryList}
                              location={`${getMutationName(mutation)}, Mutation Effect`}
                            />
                          }
                          name="description"
                        />
                      </Collapsible>
                      {mutation.mutation_effect.germline && (
                        <Collapsible
                          nestLevel={NestLevelType.GERMLINE}
                          className={'mt-2'}
                          title={'Germline'}
                          geneFieldKey="mutations/0/mutation_effect/germline"
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
                              fieldKey: `mutations/${mutationIndex}/mutation_effect/germline/pathogenic`,
                            }))}
                          />
                          <RealtimeCheckedInputGroup
                            groupHeader="Penetrance"
                            isRadio
                            options={[PENETRANCE.HIGH, PENETRANCE.INTERMEDIATE, PENETRANCE.LOW, PENETRANCE.OTHER].map(label => ({
                              label,
                              fieldKey: `mutations/${mutationIndex}/mutation_effect/germline/penetrance`,
                            }))}
                          />
                          <RealtimeCheckedInputGroup
                            groupHeader="Mechanism of Inheritance"
                            isRadio
                            options={[GERMLINE_INHERITANCE_MECHANISM.RECESSIVE, GERMLINE_INHERITANCE_MECHANISM.DOMINANT].map(label => ({
                              label,
                              fieldKey: `mutations/${mutationIndex}/mutation_effect/germline/inheritanceMechanism`,
                            }))}
                          />
                          <RealtimeTextAreaInput
                            fieldKey={`mutations/${mutationIndex}/mutation_effect/germline/cancerRisk`}
                            inputClass={styles.textarea}
                            label="Cancer Risk"
                            name="cancerRisk"
                          />
                        </Collapsible>
                      )}
                    </Collapsible>
                    {mutation.tumors &&
                      mutation.tumors.map((tumor, tumorIndex) => {
                        const cancerTypeName = tumor.cancerTypes.map(cancerType => getCancerTypeName(cancerType)).join(', ');

                        return (
                          <Collapsible
                            className={'mt-2'}
                            mutationUuid={mutation.name_uuid}
                            cancerTypeUuid={tumor.cancerTypes_uuid}
                            key={tumor.cancerTypes_uuid}
                            nestLevel={NestLevelType.CANCER_TYPE}
                            geneFieldKey={`mutations/${mutationIndex}/tumors/${tumorIndex}`}
                            actions={[
                              <GeneHistoryTooltip
                                key={'gene-history-tooltip'}
                                historyData={parsedHistoryList}
                                location={`${getMutationName(mutation)}, ${cancerTypeName}`}
                              />,
                            ]}
                            title={`Cancer Type: ${cancerTypeName}`}
                          >
                            <RealtimeTextAreaInput
                              fieldKey={`mutations/${mutationIndex}/tumors/${tumorIndex}/summary`}
                              inputClass={styles.textarea}
                              label="Therapeutic Summary (Optional)"
                              labelIcon={
                                <GeneHistoryTooltip
                                  historyData={parsedHistoryList}
                                  location={`${getMutationName(mutation)}, ${cancerTypeName}, Tumor Type Summary`}
                                />
                              }
                              name="txSummary"
                            />
                            {tumor.TIs.reduce((accumulator, ti, tiIndex) => {
                              if (!ti.treatments) {
                                return accumulator;
                              }
                              return accumulator.concat(
                                ti.treatments.map((treatment, treatmentIndex) => {
                                  return (
                                    <Collapsible
                                      className={'mt-2'}
                                      key={tumor.cancerTypes_uuid}
                                      nestLevel={NestLevelType.THERAPY}
                                      title={`Therapy: ${getTxName(props.drugList, treatment.name)}`}
                                      geneFieldKey={`mutations/${mutationIndex}/tumors/${tumorIndex}/TIs/${tiIndex}/treatments/${treatmentIndex}`}
                                    >
                                      <RealtimeDropdownInput
                                        fieldKey={`mutations/${mutationIndex}/tumors/${tumorIndex}/TIs/${tiIndex}/treatments/${treatmentIndex}/level`}
                                        label="Highest level of evidence"
                                        name="level"
                                        options={[TX_LEVELS.LEVEL_NO, TX_LEVELS.LEVEL_1, TX_LEVELS.LEVEL_2]}
                                      />
                                      <RealtimeDropdownInput
                                        fieldKey={`mutations/${mutationIndex}/tumors/${tumorIndex}/TIs/${tiIndex}/treatments/${treatmentIndex}/propagation`}
                                        label="Level of Evidence in other solid tumor types"
                                        name="propagationLevel"
                                        options={[]} // Todo
                                      />
                                      <RealtimeDropdownInput
                                        fieldKey={`mutations/${mutationIndex}/tumors/${tumorIndex}/TIs/${tiIndex}/treatments/${treatmentIndex}/propagationLiquid`}
                                        label="Level of Evidence in other liquid tumor types"
                                        name="propagationLiquidLevel"
                                        options={[]}
                                      />
                                      <RealtimeDropdownInput
                                        fieldKey={`mutations/${mutationIndex}/tumors/${tumorIndex}/TIs/${tiIndex}/treatments/${treatmentIndex}/fdaLevel`}
                                        label="FDA Level of Evidence"
                                        name="propagationLiquidLevel"
                                        options={[]}
                                      />
                                      <RealtimeTextAreaInput
                                        fieldKey={`mutations/${mutationIndex}/tumors/${tumorIndex}/TIs/${tiIndex}/treatments/${treatmentIndex}/description`}
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
                </Col>
              </Row>
            ))}
        </div>
      )}
      <VusTable hugoSymbol={hugoSymbol} />
    </div>
  ) : (
    <LoadingIndicator size={LoaderSize.LARGE} center={true} isLoading />
  );
};

const mapStoreToProps = ({
  geneStore,
  firebaseGeneStore,
  firebaseMetaStore,
  firebaseDrugsStore,
  firebaseHistoryStore,
  authStore,
}: IRootStore) => ({
  findAllGeneEntities: geneStore.findAllGeneEntities,
  entities: geneStore.entities,
  addListener: firebaseGeneStore.addListener,
  data: firebaseGeneStore.data,
  update: firebaseGeneStore.update,
  updateReviewableContent: firebaseGeneStore.updateReviewableContent,
  deleteSection: firebaseGeneStore.deleteSection,
  addMetaCollaboratorsListener: firebaseMetaStore.addMetaCollaboratorsListener,
  metaData: firebaseMetaStore.data,
  drugList: firebaseDrugsStore.drugList,
  addDrugListListener: firebaseDrugsStore.addDrugListListener,
  metaCollaboratorsData: firebaseMetaStore.metaCollaborators,
  updateCollaborator: firebaseMetaStore.updateCollaborator,
  historyData: firebaseHistoryStore.data,
  addHistoryListener: firebaseHistoryStore.addListener,
  account: authStore.account,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(CurationPage);
